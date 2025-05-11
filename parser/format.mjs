import CONST from "@Piglet/misc/CONST";

/**
 * Formats raw HTML by cleaning whitespace, adding proper indentation,
 * and formatting inline <style> tags separately using CSS formatter.
 *
 * @param {string} html - The raw HTML string to format.
 * @returns {string} - The formatted HTML string with proper indentation.
 */
function formatHTML(html) {
  html = html.replace(/>\s+</g, "><");

  html = html.replace(/</g, "\n<");

  html = html.replace(/\n\s*\n/g, "\n");

  let indent = 0;
  let inStyle = false;
  let styleContent = "";
  const lines = html.trim().split("\n");
  const formattedLines = [];

  for (let rawLine of lines) {
    const line = rawLine.trim();
    if (line === "") continue;

    if (line.startsWith("<style")) {
      inStyle = true;
      formattedLines.push("  ".repeat(indent) + line);
      continue;
    }

    if (inStyle) {
      if (line.startsWith("</style>")) {
        const formattedStyle = formatCSS(styleContent.trim());

        const styleLines = formattedStyle
          .split("\n")
          .map((l) => "  ".repeat(indent + 1) + l);
        formattedLines.push(...styleLines);
        formattedLines.push("  ".repeat(indent) + line);
        styleContent = "";
        inStyle = false;

        formattedLines.push("");
      } else {
        styleContent += line + "\n";
      }
      continue;
    }

    const isClosingTag = /^<\/\w/.test(line);
    const isOpeningTag = /^<\w/.test(line) && !/^<\w.*\/>$/.test(line);
    const tagNameMatch = line.match(/^<\/?(\w+)/);
    const tagName = tagNameMatch ? tagNameMatch[1].toLowerCase() : "";

    if (isClosingTag) indent = Math.max(indent - 1, 0);
    const padding = "  ".repeat(indent);

    const formattedLine = line.replace(/\s+>/g, ">");

    formattedLines.push(padding + formattedLine);

    if (isOpeningTag && !isClosingTag && !CONST.voidTags.includes(tagName)) {
      indent++;
    }
  }

  return formattedLines.join("\n");
}

/**
 * Formats raw CSS by adding indentation,
 * handling block structures `{}` and keeping `@import` at the top cleanly separated.
 *
 * @param {string} css - The raw CSS string to format.
 * @returns {string} - The formatted CSS string with proper indentation and spacing.
 */
function formatCSS(css) {
  let lines = css
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");
  const formatted = [];
  let indent = 0;
  let afterImport = false;

  for (let line of lines) {
    if (line.startsWith("@import")) {
      formatted.push(line);
      afterImport = true;
      continue;
    }

    if (afterImport) {
      formatted.push("");
      afterImport = false;
    }

    if (line.endsWith("{")) {
      line = line.replace(/\s+{/g, " {");
      formatted.push("  ".repeat(indent) + line);
      indent = Math.max(indent + 1, 1);
    } else if (line.endsWith("}")) {
      indent = Math.max(indent - 1, 1);
      formatted.push("  ".repeat(indent) + line);
      formatted.push("");
    } else {
      formatted.push("  ".repeat(indent) + line);
    }
  }

  while (formatted.length > 0 && formatted[formatted.length - 1] === "") {
    formatted.pop();
  }

  return formatted.join("\n");
}

/**
 * Formats raw JavaScript by cleaning indentation,
 * adding blank lines between variable declarations,
 * and handling block structures `{}` properly.
 *
 * @param {string} js - The raw JavaScript string to format.
 * @returns {string} - The formatted JavaScript string.
 */
function formatJS(js) {
  const lines = js
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");

  const formatted = [];
  let indent = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.endsWith("{")) {
      formatted.push("  ".repeat(indent) + line.replace(/\s+{/g, " {"));
      indent++;
      continue;
    }

    if (line === "}") {
      indent = Math.max(indent - 1, 0);
      formatted.push("  ".repeat(indent) + line);
      continue;
    }

    if (line === "});" || line === "};") {
      indent = Math.max(indent - 1, 0);
      formatted.push("  ".repeat(indent) + line);
      formatted.push("");
      continue;
    }

    formatted.push("  ".repeat(indent) + line);

    if (/^(const|let|var)\s.+;$/.test(line)) {
      formatted.push("");
    }
  }

  while (formatted.length > 0 && formatted[formatted.length - 1] === "") {
    formatted.pop();
  }

  return formatted.join("\n");
}

export { formatHTML, formatJS };
