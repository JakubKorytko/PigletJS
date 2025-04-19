import fs from "fs";
import path from "path";

// routes.js - Global Route Storage
export const routes = {}; // Global object to store routes
export const routeAliases = {};

/**
 * Recursively finds all .pig.html component files in a directory.
 *
 * @param {string} dir - Directory to search for component files.
 * @param {Array} componentFiles - Array to store full paths of component files.
 */
function findComponentFiles(dir, componentFiles = []) {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const filePath = path.join(dir, file.name);

    if (file.isDirectory()) {
      findComponentFiles(filePath, componentFiles); // Recurse into subdirectories
    } else if (file.name.endsWith(".pig.html")) {
      componentFiles.push(filePath); // Add the component file path
    }
  }

  return componentFiles;
}

/**
 * Parses the HTML content and creates a route-to-component mapping.
 * It looks for component files in the 'pages' directory (and subdirectories).
 *
 * @param {string} html - HTML content to parse.
 * @param {string} pagesDir - The base directory where component files are located.
 * @param {Object} routes - Object to store the route-to-component mapping.
 */
export function parseRoutes(html, pagesDir) {
  const routeRegex = /<route\s+value="([^"]+)">[^<]*<(\w+) \/>[^<]*<\/route>/g;
  let match;

  // Find all component files in the pages directory and subdirectories
  const componentFiles = findComponentFiles(pagesDir);

  while ((match = routeRegex.exec(html)) !== null) {
    const pathValue = match[1]; // Route path (e.g., "/")
    const componentName = match[2]; // Component name (e.g., "Homepage")

    // Find the component file matching the component name
    const componentFile = componentFiles.find(
      (file) => file.toLowerCase().includes(componentName.toLowerCase()), // Match by name
    );

    if (componentFile) {
      const routeAlias = path
        .basename(componentFile)
        .replace(/\.pig\.html$/, "");

      routes[pathValue] = componentFile; // Map route path to component file
      routeAliases[pathValue] = routeAlias;
    } else {
      console.log(`Component file for "${componentName}" not found.`);
    }
  }
}
