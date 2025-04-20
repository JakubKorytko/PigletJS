import { generateAppHtml } from "@/core/libs/pageLoader.mjs";
import { resolvePath } from "@/core/utils/paths.mjs";
import fs from "fs";

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
