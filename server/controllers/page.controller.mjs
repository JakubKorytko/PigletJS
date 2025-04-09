import { generateAppHtml } from "@/server/libs/pageLoader.mjs";

export default async (req, res) => {
  const pageName = req.url.replace("/", "") || "home";
  let htmlContent = await generateAppHtml(pageName);

  if (htmlContent) {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(htmlContent);
  }
};
