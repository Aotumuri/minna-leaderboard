import "dotenv/config";
import http from "http";
import fs from "fs";

const SERVER_CONFIG_PATH = process.env.SERVER_CONFIG_PATH || "data/config.json";

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
      res.end("Hello HTTP");
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
