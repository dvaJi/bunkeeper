import {
  createHighlighter,
  escapeHtml,
  renderNodesToHtml,
  renderTokens,
} from "@tanstack/highlight/core";
import { tsx } from "@tanstack/highlight/languages/tsx";
import { json } from "@tanstack/highlight/languages/json";
import { toml } from "@tanstack/highlight/languages/toml";
import { yaml } from "@tanstack/highlight/languages/yaml";
import { shell } from "@tanstack/highlight/languages/shell";

const highlighter = createHighlighter({
  languages: [tsx, json, toml, yaml, shell],
  fallbackLanguage: "tsx",
});

export function inferLanguage(title?: string): string {
  if (!title) return "tsx";
  if (title.endsWith(".json")) return "json";
  if (title.endsWith(".toml")) return "toml";
  if (title.endsWith(".yml") || title.endsWith(".yaml")) return "yaml";
  if (title === "terminal" || title.endsWith(".sh")) return "shell";
  return "tsx";
}

export function highlight(code: string, lang: string): string {
  return highlighter.highlight(code, { lang }).html;
}

export function highlightLine(code: string, lang: string): string {
  if (!code.trim()) return escapeHtml(code);
  const { tokens } = highlighter.tokenize(code, { lang });
  return renderNodesToHtml(renderTokens(tokens));
}

export { escapeHtml };
