import "dotenv/config";
import http from "http";
import fs from "fs";

import { setDecoy, resetLeaderBoard } from "./db.js";

const SESSION_TTL = Number(process.env.SESSION_TTL) || 3600;
const SERVER_CONFIG_PATH = process.env.SERVER_CONFIG_PATH || "data/config.json";
const ADMIN_LOGIN_HTML_PATH =
  process.env.ADMIN_LOGIN_HTML_PATH || "admin/login.html";
const ADMIN_LOGIN_JS_PATH = process.env.ADMIN_LOGIN_JS_PATH || "admin/login.js";
const ADMIN_CONTOL_PANEL_HTML_PATH =
  process.env.ADMIN_CONTOL_PANEL_HTML_PATH || "admin/control-panel.html";

// for stopping the servers (maintenance mode)
let servers = [];

// session id of dictionary
let sessions = {};

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
        adminServer(req, res, port_config);
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

function apiServer(req, res, config) {
  const { url, method } = req;
  if (url.startsWith("/health") && method === "GET") {
    response(res, 200, "json", { status: "ok" });
    return;
  }

  if (url.startsWith("/debug")) {
    response(res, 200, "json", setDecoy());
    return;
  }

  if (url.startsWith("/reset")) {
    resetLeaderBoard();
    response(res, 200, "json", { status: "ok" });
    return;
  }

  // TODO: 管理者用APIが整ったら絶対に消す。
  if (url.startsWith("/session")) {
    response(res, 200, "json", { sessions: sessions });
    return;
  }

  response(res, 404, "json", { error: "Not Found" });
}

function response(res, status, type, payload, extraHeaders) {
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

async function adminServer(req, res, config) {
  const { url, method } = req;
  const path = url.split("/");
  const site_config = config.sites.find((s) => s.name === path[1]);
  if (!site_config) {
    response(res, 404, "text", "Not Found");
    return;
  }

  // login
  if (path[2] === "login" && method === "GET") {
    const session = getSession(req);
    if (session === undefined || session.site !== path[1]) {
      response(res, 200, "html", ADMIN_LOGIN_HTML_PATH);
    } else {
      res.writeHead(303, { Location: `/${path[1]}/control` });
      res.end();
    }
    return;
  }
  if (path[2] === "login.js" && method === "GET") {
    response(res, 200, "js", ADMIN_LOGIN_JS_PATH);
    return;
  }
  if (path[2] === "login" && method === "POST") {
    const body = await getBody(req);
    if (site_config.password === body.password) {
      let sessionId = generateSessionId();
      if (!sessionId) {
        response(res, 500, "json", { error: "Internal Server Error" });
        return;
      }

      const session = createSession(sessionId, site_config.name);
      sessions[sessionId] = session;

      const cookie = {
        "Set-Cookie": `sessionId=${sessionId}; HttpOnly; Max-Age=${SESSION_TTL}`,
      };

      response(res, 200, "json", { status: "ok" }, cookie);
    } else {
      response(res, 401, "json", { error: "Unauthorized" });
    }
    return;
  }

  // control-panel
  if (path[2] === "control" && method === "GET") {
    const session = getSession(req);
    if (session === undefined || session.site !== path[1]) {
      res.writeHead(303, { Location: `/${path[1]}/login` });
      res.end();
    } else {
      response(res, 200, "html", ADMIN_CONTOL_PANEL_HTML_PATH);
    }
    return;
  }

  response(res, 404, "text", "Not Found");
}

async function getBody(req) {
  let data = "";
  for await (const chunk of req) {
    data += chunk;
  }
  return JSON.parse(data);
}

function generateSessionId() {
  for (let i = 0; i < 10; i++) {
    let session = "";
    for (let j = 0; j < 5; j++) {
      session = session + Math.random().toString(32).substring(2);
    }
    if (sessions[session] === undefined) return session;
  }
  return;
}

function createSession(sessionId, name) {
  const createdAt = Date.now();
  const expiresAt = Date.now() + SESSION_TTL * 1000;
  return {
    sessionId: sessionId,
    createdAt: createdAt,
    expiresAt: expiresAt,
    site: name,
  };
}

function getSession(req) {
  if (req.headers.cookie === undefined) return;
  const sessionCookie = req.headers.cookie
    .split("; ")
    .find((c) => c.startsWith("sessionId="));
  if (sessionCookie === undefined) return;
  const sessionId = sessionCookie.split("=")[1];
  const session = sessions[sessionId];
  if (!session) return;
  if (session.expiresAt <= Date.now()) {
    delete sessions[sessionId];
    return;
  }
  return session;
}
