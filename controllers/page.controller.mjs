import { generateAppHtml } from "@Piglet/libs/pageLoader.mjs";
import { routes } from "@Piglet/libs/routes.mjs";
import notFound from "@Piglet/libs/notfound.mjs";

export default async (req, res) => {
  const componentPath = routes[req.url];

  if (componentPath) {
    const htmlContent = await generateAppHtml(req.url, componentPath);

    if (htmlContent) {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(htmlContent);
    } else {
      await notFound(res);
    }
  } else {
    await notFound(res);
  }
};
