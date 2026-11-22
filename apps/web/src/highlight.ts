import hljs from "highlight.js/lib/core";
import typescript from "highlight.js/lib/languages/typescript";
import json from "highlight.js/lib/languages/json";
import ini from "highlight.js/lib/languages/ini";
import yaml from "highlight.js/lib/languages/yaml";
import bash from "highlight.js/lib/languages/bash";

hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("json", json);
hljs.registerLanguage("ini", ini);
hljs.registerLanguage("toml", ini);
hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("bash", bash);

export function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function inferLanguage(title?: string): string {
  if (!title) return "typescript";
  if (title.endsWith(".json")) return "json";
  if (title.endsWith(".toml")) return "toml";
  if (title.endsWith(".yml") || title.endsWith(".yaml")) return "yaml";
  if (title === "terminal" || title.endsWith(".sh")) return "bash";
  return "typescript";
}

export function highlight(code: string, lang: string): string {
  const language = hljs.getLanguage(lang) ? lang : "typescript";
  try {
    return hljs.highlight(code, { language, ignoreIllegals: true }).value;
  } catch {
    return escapeHtml(code);
  }
}

export function highlightLine(text: string, lang: string): string {
  if (!text.trim()) return escapeHtml(text);
  return highlight(text, lang);
}
