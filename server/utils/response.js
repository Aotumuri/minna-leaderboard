import fs from "fs";

export function response(res, status, type, payload, extraHeaders) {
  const headers = {};
  let body;

  if (type === "json") {
    Object.assign(headers, {
      "Content-Type": "application/json; charset=UTF-8",
    });
    body = JSON.stringify(payload);
  } else if (type === "text") {
    Object.assign(headers, { "Content-Type": "text/plain; charset=UTF-8" });
    body = payload;
  } else if (type === "html") {
    Object.assign(headers, { "Content-Type": "text/html; charset=UTF-8" });
    body = fs.readFileSync(payload);
  } else if (type === "js") {
    Object.assign(headers, {
      "Content-Type": "application/javascript; charset=UTF-8",
    });
    body = fs.readFileSync(payload);
  } else {
    res.writeHead(500);
    res.end("Unknown response type");
    return;
  }

  if (extraHeaders) {
    Object.assign(headers, extraHeaders);
  }

  res.writeHead(status, headers);
  res.end(body);
}
