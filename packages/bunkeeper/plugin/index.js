const DOC_BASE = "https://github.com/dvaJi/bunkeeper/blob/HEAD/packages/bunkeeper/docs/rules";

const FS_SOURCES = new Set(["node:fs", "fs", "node:fs/promises", "fs/promises"]);
const FS_READ_METHODS = new Set(["readFile", "readFileSync"]);
const FS_WRITE_METHODS = new Set(["writeFile", "writeFileSync"]);
const GLOBAL_FETCH_NAMES = new Set(["fetch", "Headers", "Request", "Response", "FormData"]);
const DOTENV_SOURCES = (source) =>
  source === "dotenv" || source === "dotenv/config" || source.startsWith("dotenv-expand");

function literalString(node) {
  return node?.type === "Literal" && typeof node.value === "string" ? node.value : null;
}

function requireSource(node) {
  if (node?.type !== "CallExpression") return null;
  const callee = node.callee;
  if (callee.type === "Identifier" && callee.name === "require") {
    return literalString(node.arguments[0]);
  }
  return null;
}

function createFsTracker() {
  const fsNames = new Set();
  const fsNamedImports = new Set();

  return {
    fsNames,
    fsNamedImports,
    visitImport(node) {
      if (!FS_SOURCES.has(node.source.value)) return;
      for (const spec of node.specifiers) {
        if (spec.type === "ImportDefaultSpecifier" || spec.type === "ImportNamespaceSpecifier") {
          fsNames.add(spec.local.name);
        } else if (spec.type === "ImportSpecifier" && FS_READ_METHODS.has(spec.imported.name)) {
          fsNamedImports.add(spec.local.name);
        }
      }
    },
    visitRequireDeclarator(node) {
      const init = node.init;
      if (init?.type !== "CallExpression" || !FS_SOURCES.has(requireSource(init) ?? "")) return;
      const id = node.id;
      if (id.type === "Identifier") fsNames.add(id.name);
      if (id.type === "ObjectPattern") {
        for (const prop of id.properties) {
          if (
            prop.type === "Property" &&
            prop.key.type === "Identifier" &&
            FS_READ_METHODS.has(prop.key.name)
          ) {
            const value = prop.value;
            if (value.type === "Identifier") fsNamedImports.add(value.name);
          }
        }
      }
    },
    matchCall(node) {
      const callee = node.callee;
      if (
        callee.type === "Identifier" &&
        FS_READ_METHODS.has(callee.name) &&
        fsNamedImports.has(callee.name)
      ) {
        return { method: callee.name, kind: "read" };
      }
      if (
        callee.type === "Identifier" &&
        FS_WRITE_METHODS.has(callee.name) &&
        fsNamedImports.has(callee.name)
      ) {
        return { method: callee.name, kind: "write" };
      }
      if (
        callee.type !== "MemberExpression" ||
        callee.computed ||
        callee.property.type !== "Identifier"
      )
        return null;
      const method = callee.property.name;
      const kind = FS_READ_METHODS.has(method)
        ? "read"
        : FS_WRITE_METHODS.has(method)
          ? "write"
          : null;
      if (!kind) return null;

      let object = callee.object;
      while (object.type === "MemberExpression" && !object.computed) {
        if (
          object.property.type === "Identifier" &&
          (object.property.name === "promises" || object.property.name === "fs")
        ) {
          object = object.object;
        } else {
          return null;
        }
      }
      if (object.type === "Identifier" && fsNames.has(object.name)) {
        return { method, kind };
      }
      return null;
    },
  };
}

const noDotenv = {
  meta: {
    type: "problem",
    docs: { url: `${DOC_BASE}/no-dotenv.md` },
    schema: [],
    messages: {
      dotenv:
        "Bun loads .env, .env.local and .env.<NODE_ENV> automatically. Delete dotenv and read variables directly from Bun.env or process.env.",
    },
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        if (DOTENV_SOURCES(node.source.value)) context.report({ node, messageId: "dotenv" });
      },
      CallExpression(node) {
        if (DOTENV_SOURCES(requireSource(node) ?? "")) {
          context.report({ node, messageId: "dotenv" });
          return;
        }
        const callee = node.callee;
        if (
          callee.type === "MemberExpression" &&
          !callee.computed &&
          callee.property.type === "Identifier" &&
          callee.property.name === "config" &&
          callee.object.type === "CallExpression" &&
          requireSource(callee.object) === "dotenv"
        ) {
          context.report({ node, messageId: "dotenv" });
        }
      },
    };
  },
};

const noProcessEnv = {
  meta: {
    type: "suggestion",
    docs: { url: `${DOC_BASE}/no-process-env.md` },
    schema: [],
    messages: {
      useBunEnv:
        "Use Bun.env instead of process.env in Bun projects. Same variables, typed by bun-types.",
    },
  },
  create(context) {
    return {
      MemberExpression(node) {
        if (
          !node.computed &&
          node.object.type === "Identifier" &&
          node.object.name === "process" &&
          node.property.type === "Identifier" &&
          node.property.name === "env"
        ) {
          context.report({ node, messageId: "useBunEnv" });
        }
      },
    };
  },
};

const preferBunFile = {
  meta: {
    type: "suggestion",
    docs: { url: `${DOC_BASE}/prefer-bun-file.md` },
    schema: [],
    messages: {
      read: "Use Bun.file() instead of fs.{{method}}(): `const text = await Bun.file(path).text()`. No encoding juggling, lazy handles, faster in Bun.",
    },
  },
  create(context) {
    const tracker = createFsTracker();
    return {
      ImportDeclaration: tracker.visitImport,
      VariableDeclarator: tracker.visitRequireDeclarator,
      CallExpression(node) {
        const hit = tracker.matchCall(node);
        if (hit?.kind === "read") {
          context.report({ node, messageId: "read", data: { method: hit.method } });
        }
      },
    };
  },
};

const preferBunWrite = {
  meta: {
    type: "suggestion",
    docs: { url: `${DOC_BASE}/prefer-bun-write.md` },
    schema: [],
    messages: {
      write:
        "Use Bun.write() instead of fs.{{method}}(): `await Bun.write(path, data)`. Handles strings, blobs and arrays, and returns the bytes written.",
    },
  },
  create(context) {
    const tracker = createFsTracker();
    return {
      ImportDeclaration: tracker.visitImport,
      VariableDeclarator: tracker.visitRequireDeclarator,
      CallExpression(node) {
        const hit = tracker.matchCall(node);
        if (hit?.kind === "write") {
          context.report({ node, messageId: "write", data: { method: hit.method } });
        }
      },
    };
  },
};

const noNodeFetch = {
  meta: {
    type: "suggestion",
    docs: { url: `${DOC_BASE}/no-node-fetch.md` },
    schema: [],
    messages: {
      globalFetch:
        "Bun has fetch, Headers, Request, Response and FormData as globals. Delete this import and use them directly.",
      nodeFetch:
        "node-fetch is unnecessary in Bun. Delete the dependency and use the global fetch.",
    },
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        if (source === "node-fetch") {
          context.report({ node, messageId: "nodeFetch" });
          return;
        }
        if (source !== "undici" || node.specifiers.length === 0) return;
        const allGlobals = node.specifiers.every(
          (s) =>
            s.type === "ImportSpecifier" &&
            GLOBAL_FETCH_NAMES.has(
              s.imported.type === "Identifier" ? s.imported.name : s.imported.value,
            ),
        );
        if (allGlobals) context.report({ node, messageId: "globalFetch" });
      },
      CallExpression(node) {
        if (requireSource(node) === "node-fetch") {
          context.report({ node, messageId: "nodeFetch" });
        }
      },
    };
  },
};

const preferBunSleep = {
  meta: {
    type: "suggestion",
    docs: { url: `${DOC_BASE}/prefer-bun-sleep.md` },
    fixable: "code",
    schema: [],
    messages: {
      sleepPattern: "Use Bun.sleep({{ms}}) instead of wrapping setTimeout in a promise.",
    },
  },
  create(context) {
    return {
      AwaitExpression(node) {
        const arg = node.argument;
        if (
          arg?.type !== "NewExpression" ||
          arg.callee.type !== "Identifier" ||
          arg.callee.name !== "Promise"
        )
          return;
        const executor = arg.arguments[0];
        if (
          !executor ||
          (executor.type !== "ArrowFunctionExpression" && executor.type !== "FunctionExpression")
        )
          return;
        const params = executor.params;
        if (params.length !== 1 || params[0].type !== "Identifier") return;
        const resolveName = params[0].name;
        const body = executor.body;
        const calls = [];
        if (body.type === "CallExpression") calls.push(body);
        if (body.type === "BlockStatement") {
          for (const stmt of body.body) {
            if (stmt.type === "ExpressionStatement" && stmt.expression.type === "CallExpression") {
              calls.push(stmt.expression);
            }
          }
        }
        for (const call of calls) {
          const callee = call.callee;
          if (callee.type !== "Identifier" || callee.name !== "setTimeout") continue;
          const [callback, msArg] = call.arguments;
          if (!callback || callback.type !== "Identifier" || callback.name !== resolveName)
            continue;
          const ms =
            msArg && msArg.type === "Literal" && typeof msArg.value === "number"
              ? String(msArg.value)
              : msArg
                ? context.sourceCode.getText(msArg)
                : null;
          if (ms === null) continue;
          context.report({
            node,
            messageId: "sleepPattern",
            data: { ms },
            fix(fixer) {
              return fixer.replaceText(node, `Bun.sleep(${ms})`);
            },
          });
        }
      },
    };
  },
};

const plugin = {
  meta: { name: "bunkeeper" },
  rules: {
    "no-dotenv": noDotenv,
    "no-process-env": noProcessEnv,
    "prefer-bun-file": preferBunFile,
    "prefer-bun-write": preferBunWrite,
    "no-node-fetch": noNodeFetch,
    "prefer-bun-sleep": preferBunSleep,
  },
};

plugin.configs = {
  recommended: {
    plugins: { bunkeeper: plugin },
    rules: Object.fromEntries(
      Object.keys(plugin.rules).map((rule) => [`bunkeeper/${rule}`, "warn"]),
    ),
  },
};

export default plugin;
