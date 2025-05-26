// noinspection JSUnusedGlobalSymbols

import crypto from "crypto";

export default async (req, res) => {
  const { method } = req;

  let body = "";
  for await (const chunk of req) {
    body += chunk;
  }

  try {
    body = JSON.parse(body);
  } catch (e) {
    body = {};
  }

  if (method === "POST") {
    const { text } = body;

    const hash = crypto
      .createHash("sha256")
      .update(text || "")
      .digest("hex");

    console.log("Received text:", text);
    console.log("Hash:", hash);

    res.setHeader("Content-Type", "text/plain");
    res.end(hash);
  } else {
    res.setHeader("Content-Type", "text/plain");
    res.end("Invalid method");
  }
};
