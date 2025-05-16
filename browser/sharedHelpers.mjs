/**
 * @import {
 *  ToPascalCase,
 *  ToKebabCase,
 * } from '@jsdocs/browser/helpers.d'
 */

/** @type {(html: string) => string[]} */
const extractComponentTagsFromString = (html) => {
  const componentTags = new Set();
  const tagRegex =
    /<([A-Z][a-zA-Z0-9]*)[^>]*>.*?<\/\1>|<([A-Z][a-zA-Z0-9]*)[^>]*\/>/g;
  let match;

  while ((match = tagRegex.exec(html)) !== null) {
    const pascalTag = match[1] || match[2];
    componentTags.add(pascalTag);
  }

  return Array.from(componentTags);
};

/** @type {ToPascalCase} */
const toPascalCase = function (str) {
  return str
    .split(/[-_]/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
};

/** @type {ToKebabCase} */
const toKebabCase = function (str) {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
};

export { extractComponentTagsFromString, toPascalCase, toKebabCase };
