import { setDecoy, resetLeaderBoard } from "../db.js";
import { response } from "../utils/response.js";
import { getSession, sessions } from "../utils/session.js";

export function apiServer(req, res, config) {
  const { url, method } = req;

  // === public ===

  if (url === "/health" && method === "GET") {
    response(res, 200, "json", { status: "ok" });
    return;
  }

  // === auth required ===

  if (url === "/debug") {
    if (requirePermission(req, res, config, "debug") === false) return;
    response(res, 200, "json", setDecoy());
    return;
  }

  if (url === "/reset") {
    if (requirePermission(req, res, config, "reset") === false) return;
    resetLeaderBoard();
    response(res, 200, "json", { status: "ok" });
    return;
  }

  // TODO: 管理者用APIが整ったら絶対に消す。
  if (url === "/session") {
    if (requirePermission(req, res, config, "session") === false) return;
    response(res, 200, "json", { sessions: sessions });
    return;
  }

  response(res, 404, "json", { error: "Not Found" });
}

function requirePermission(req, res, config, endpoint) {
  const session = getSession(req);
  if (session === undefined) {
    response(res, 401, "json", { error: "Unauthorized" });
    return false;
  }

  if (
    config
      .find((s) => s.type === "admin")
      .sites.find((s) => s.name === session.site)
      .permission.includes(endpoint) === false
  ) {
    response(res, 403, "json", { error: "Forbidden" });
    return false;
  }
  return true;
}
