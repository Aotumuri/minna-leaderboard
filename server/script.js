import "dotenv/config";
import http from "http";
import fs from "fs";

import { apiServer } from "./handlers/api.js";
import { adminServer } from "./handlers/admin.js"

const SERVER_CONFIG_PATH = process.env.SERVER_CONFIG_PATH || "data/config.json";

const adminEnv = {
    SESSION_TTL: Number(process.env.SESSION_TTL) || 3600,
    ADMIN_LOGIN_HTML_PATH: process.env.ADMIN_LOGIN_HTML_PATH || "admin/login.html",
    ADMIN_LOGIN_JS_PATH: process.env.ADMIN_LOGIN_JS_PATH || "admin/login.js",
    ADMIN_CONTOL_PANEL_HTML_PATH: process.env.ADMIN_CONTOL_PANEL_HTML_PATH || "admin/control-panel.html"
}

// for stopping the servers (maintenance mode)
let servers = [];

export function startServer() {
  stopServers();

  const server_config = JSON.parse(
    fs.readFileSync(SERVER_CONFIG_PATH, "utf-8")
  ).server;

  for (const port_config of server_config) {
    // TODO: type によって分岐するようにする。
    const server = http.createServer((req, res) => {
      if (port_config.type === "api") {
        apiServer(req, res, port_config);
      } else if (port_config.type === "admin") {
        adminServer(req, res, port_config, adminEnv);
      } else {
        // TODO: admin / client を作る
        res.end("Hello HTTP");
      }
    });

    server.listen(port_config.port, () => {
      console.log(
        `${port_config.type} server at http://localhost:${port_config.port}`
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