import "dotenv/config";
import http from "http";
import fs from "fs";

import { setDecoy, resetLeaderBoard } from "./db.js";

const SERVER_CONFIG_PATH = process.env.SERVER_CONFIG_PATH || "data/config.json";

// for stopping the servers (maintenance mode)
let servers = [];

export function startServer() {
  stopServers();

  const server_config = JSON.parse(
    fs.readFileSync(SERVER_CONFIG_PATH, "utf-8"),
  ).server;

  for (const port_config of server_config) {
    // TODO: type によって分岐するようにする。
    const server = http.createServer((req, res) => {
      if (port_config.type === "api") {
        apiServer(req, res, port_config);
      } else {
        // TODO: admin / client を作る
        res.end("Hello HTTP");
      }
    });

    server.listen(port_config.port, () => {
      console.log(
        `${port_config.type} server at http://localhost:${port_config.port}`,
      );
    });

    servers.push(server);
  }
}

function stopServers() {
  for (const s of servers) {
    s.close();
  }
  servers = [];
}

function apiServer(req, res, config) {
  const { url, method } = req;
  if (url.startsWith("/health") && method === "GET") {
    responseApi(res, 200, "json", { status: "ok" });
    return;
  }

  if (url.startsWith("/debug")) {
    responseApi(res, 200, "json", setDecoy());
    return;
  }

  if (url.startsWith("/reset")) {
    resetLeaderBoard();
    responseApi(res, 200, "json", { status: "ok" });
    return;
  }

  responseApi(res, 404, "json", { error: "Not Found" });
}

function responseApi(res, status, type, payload) {
  if (type === "json") {
    res.writeHead(status, {
      "Content-Type": "application/json; charset=UTF-8",
    });
    res.end(JSON.stringify(payload));
  } else if (type === "text") {
    res.writeHead(status, { "Content-Type": "text/plain; charset=UTF-8" });
    res.end(payload);
  } else {
    res.writeHead(500);
    res.end("Unknown response type");
  }
}
