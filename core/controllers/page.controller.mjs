import { generateAppHtml } from "@/core/libs/pageLoader.mjs";
import { routes } from "@/core/libs/routes.mjs";

export default async (req, res) => {
  // const pageName = req.url.replace("/", "") || "home"; // Get the path from the request URL
  const componentPath = routes[req.url]; // Look up the component from the routes object

  if (componentPath) {
    // Generate HTML content based on the component name
    const htmlContent = await generateAppHtml(req.url, componentPath);

    if (htmlContent) {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(htmlContent);
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Page not found");
    }
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Route not found");
  }
};
