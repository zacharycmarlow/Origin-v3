/**
 * Data export utilities.
 *
 * exportJSON  — serialise any serialisable payload to a .json file.
 * exportMarkdown — render chapter content to a readable Markdown document.
 *
 * Both use file-saver's saveAs() so downloads work across modern browsers.
 */
import { saveAs } from "file-saver";
import type { Chapter } from "../chapters";

/**
 * Export an arbitrary JSON-serialisable object as a downloadable .json file.
 */
export function exportJSON(data: unknown, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  saveAs(blob, filename.endsWith(".json") ? filename : `${filename}.json`);
}

/**
 * Export an array of chapters as a single Markdown document.
 *
 * Each chapter becomes an H1 section with its scenes nested as H2/H3 blocks.
 */
export function exportMarkdown(
  chapters: Chapter[],
  filename: string,
): void {
  const lines: string[] = [];
  lines.push("# Origin · A Metamyth Journey");
  lines.push("");
  lines.push("_Exported from The Origin journaling experience._");
  lines.push("");
  lines.push("---");
  lines.push("");

  for (const ch of chapters) {
    lines.push(`## ${ch.roman} · ${ch.title}`);
    if (ch.subtitle) {
      lines.push(`*${ch.subtitle}*`);
    }
    lines.push("");
    if (ch.invocation) {
      lines.push(ch.invocation);
      lines.push("");
    }
    if (ch.transition) {
      lines.push(`> ${ch.transition.replace(/\n/g, "\n> ")}`);
      lines.push("");
    }

    for (const scene of ch.scenes) {
      const heading = scene.title || scene.label || scene.kind;
      lines.push(`### ${heading}`);
      if (scene.subtitle) {
        lines.push(`*${scene.subtitle}*`);
        lines.push("");
      }
      if (scene.body) {
        lines.push(scene.body);
        lines.push("");
      }
      if (scene.code) {
        lines.push(`**${scene.code.title}**`);
        lines.push("");
        if (scene.code.body) {
          lines.push(scene.code.body);
          lines.push("");
        }
      }
    }

    lines.push("---");
    lines.push("");
  }

  const md = lines.join("\n");
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  saveAs(blob, filename.endsWith(".md") ? filename : `${filename}.md`);
}
