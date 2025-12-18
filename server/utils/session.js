// session id of dictionary
export const sessions = {};

export function generateSessionId() {
  for (let i = 0; i < 10; i++) {
    let session = "";
    for (let j = 0; j < 5; j++) {
      session = session + Math.random().toString(32).substring(2);
    }
    if (sessions[session] === undefined) return session;
  }
  return;
}

export function createSession(sessionId, name, ttl_sec) {
  const createdAt = Date.now();
  const expiresAt = Date.now() + ttl_sec * 1000;
  return {
    sessionId: sessionId,
    createdAt: createdAt,
    expiresAt: expiresAt,
    site: name,
  };
}

export function getSession(req) {
  if (req.headers.cookie === undefined) return;
  const sessionCookie = req.headers.cookie
    .split("; ")
    .find((c) => c.startsWith("sessionId="));
  if (sessionCookie === undefined) return;
  const sessionId = sessionCookie.split("=")[1];
  const session = sessions[sessionId];
  if (session === undefined) return;
  if (session.expiresAt <= Date.now()) {
    delete sessions[sessionId];
    return;
  }
  return session;
}
