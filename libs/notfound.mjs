import { generateAppHtml } from "@Piglet/libs/pageLoader.mjs";
import { resolvePath } from "@Piglet/utils/paths.mjs";
import fs from "fs";

/**
 * Handles 404 Not Found responses.
 *
 * If a custom `NotFound.pig.html` page exists, it will be rendered and served.
 * Otherwise, a plain text 404 message is sent.
 *
 * @param {import("http").ServerResponse} res - The HTTP response object.
 * @returns {Promise<void>}
 */
const notFound = async (res) => {
  const notFoundPath = resolvePath("@/src/pages/NotFound.pig.html");

  if (!fs.existsSync(notFoundPath)) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Not Found");
    return;
  }

  const html = await generateAppHtml("/notfound", notFoundPath);

  res.writeHead(404, { "Content-Type": "text/html" });
  res.end(html);
};

export default notFound;
