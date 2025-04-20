import { generateAppHtml } from "@/core/libs/pageLoader.mjs";
import { resolvePath } from "@/core/utils/paths.mjs";

const notFound = async (res) => {
  const html = await generateAppHtml(
    "/notfound",
    resolvePath("@/src/pages/NotFound.pig.html"),
  );

  if (!html) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Not Found");
    return;
  }

  res.writeHead(404, { "Content-Type": "text/html" });
  res.end(html);
};

export default notFound;
