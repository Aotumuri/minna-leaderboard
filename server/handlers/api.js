import { setDecoy, resetLeaderBoard } from "../db.js";
import { response } from "../utils/response.js";
import { sessions } from "../utils/session.js";

export function apiServer(req, res, config) {
  const { url, method } = req;
  if (url === "/health" && method === "GET") {
    response(res, 200, "json", { status: "ok" });
    return;
  }

  if (url === "/debug") {
    response(res, 200, "json", setDecoy());
    return;
  }

  if (url === "/reset") {
    resetLeaderBoard();
    response(res, 200, "json", { status: "ok" });
    return;
  }

  // TODO: 管理者用APIが整ったら絶対に消す。
  if (url === "/session") {
    response(res, 200, "json", { sessions: sessions });
    return;
  }

  response(res, 404, "json", { error: "Not Found" });
}