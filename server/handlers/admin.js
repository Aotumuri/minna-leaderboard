import { generateSessionId, createSession, getSession, sessions } from "../utils/session.js";
import { response } from "../utils/response.js";
import { getBody } from "../utils/request.js";

export async function adminServer(req, res, config, env) {
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
      response(res, 200, "html", env.ADMIN_LOGIN_HTML_PATH);
    } else {
      res.writeHead(303, { Location: `/${path[1]}/control` });
      res.end();
    }
    return;
  }
  if (path[2] === "login.js" && method === "GET") {
    response(res, 200, "js", env.ADMIN_LOGIN_JS_PATH);
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

      const session = createSession(sessionId, site_config.name, env.SESSION_TTL);
      sessions[sessionId] = session;

      const cookie = {
        "Set-Cookie": `sessionId=${sessionId}; HttpOnly; Max-Age=${env.SESSION_TTL}; Path=/; SameSite=Lax`,
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
      response(res, 200, "html", env.ADMIN_CONTOL_PANEL_HTML_PATH);
    }
    return;
  }

  response(res, 404, "text", "Not Found");
}