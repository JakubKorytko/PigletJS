// noinspection JSUnusedGlobalSymbols

import crypto from "crypto";

export default async (req, res) => {
  let body = "";

  try {
    for await (const chunk of req) {
      body += chunk;
    }
    body = JSON.parse(body);
  } catch {
    body = {};
  }

  if (req.method === "POST") {
    const { text = "" } = body;
    const hash = crypto.createHash("sha256").update(text).digest("hex");

    console.log("Received text:", text);
    console.log("Hash:", hash);

    res.setHeader("Content-Type", "text/plain");
    res.end(hash);
  } else {
    res.setHeader("Content-Type", "text/plain");
    res.end("Invalid method");
  }
};
