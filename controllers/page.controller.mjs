import { generateAppHtml } from "@Piglet/parser/page";
import notFound from "@Piglet/libs/notfound";

export default async (req, res) => {
  const htmlContent = await generateAppHtml(req.url.split("?")[0]);

  if (htmlContent) {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(htmlContent);
  } else {
    await notFound(res);
  }
};
