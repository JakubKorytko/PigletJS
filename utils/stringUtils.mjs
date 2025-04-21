/**
 * Converts a PascalCase or camelCase string to kebab-case.
 *
 * @param {string} str - The string to convert.
 * @returns {string}
 */
function toKebabCase(str) {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

/**
 * Converts a string to PascalCase.
 *
 * @param {string} str - The string to convert.
 * @returns {string}
 */
function toPascalCase(str) {
  return str
    .split(/[-_]/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
}

/**
 * Indents each line of a string by a given number of spaces.
 *
 * @param {string} text - The text to indent.
 * @param {number} spaces - Number of spaces to indent by.
 * @returns {string}
 */
function indent(text, spaces = 2) {
  const pad = " ".repeat(spaces);
  return text
    .split("\n")
    .map((line) => pad + line)
    .join("\n");
}

export { toPascalCase, toKebabCase, indent };
