import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "prototype-db.json");
const port = 4176;

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:4175");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function sendJson(res, statusCode, payload) {
  setCors(res);
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
}

async function readDb() {
  const raw = await readFile(dbPath, "utf8");
  return JSON.parse(raw);
}

async function writeDb(db) {
  await writeFile(dbPath, JSON.stringify(db, null, 2));
}

async function parseBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function messageTime() {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date());
}

const server = createServer(async (req, res) => {
  const method = req.method ?? "GET";
  const requestUrl = new URL(req.url ?? "/", `http://${req.headers.host}`);
  const pathname = requestUrl.pathname;

  if (method === "OPTIONS") {
    setCors(res);
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    if (method === "GET" && pathname === "/api/health") {
      sendJson(res, 200, { ok: true });
      return;
    }

    if (method === "POST" && pathname === "/api/auth/login") {
      const { email, password } = await parseBody(req);
      const db = await readDb();
      const user = db.users.find(
        (entry) =>
          String(entry.email).toLowerCase() === String(email).trim().toLowerCase() &&
          entry.password === password
      );

      if (!user) {
        sendJson(res, 401, { error: "Invalid demo credentials. Use the provided login details." });
        return;
      }

      sendJson(res, 200, {
        token: `demo-session-${user.id}`,
        email: user.email,
        name: user.name,
        role: user.role
      });
      return;
    }

    if (method === "GET" && pathname === "/api/explore") {
      const db = await readDb();
      sendJson(res, 200, db.explore);
      return;
    }

    if (method === "POST" && pathname === "/api/explore/connect") {
      const { cardId } = await parseBody(req);
      const db = await readDb();
      const currentIds = db.explore.connectedCardIds ?? [];
      db.explore.connectedCardIds = currentIds.includes(cardId)
        ? currentIds.filter((id) => id !== cardId)
        : [...currentIds, cardId];
      await writeDb(db);
      sendJson(res, 200, { connectedCardIds: db.explore.connectedCardIds });
      return;
    }

    if (method === "GET" && pathname === "/api/chat") {
      const db = await readDb();
      sendJson(res, 200, db.chat);
      return;
    }

    if (method === "POST" && pathname.startsWith("/api/chat/conversations/") && pathname.endsWith("/messages")) {
      const parts = pathname.split("/");
      const conversationId = parts[4];
      const { body } = await parseBody(req);
      const db = await readDb();
      const conversation = db.chat.conversations.find((entry) => entry.id === conversationId);

      if (!conversation) {
        sendJson(res, 404, { error: "Conversation not found." });
        return;
      }

      const trimmedBody = String(body ?? "").trim();
      if (!trimmedBody) {
        sendJson(res, 400, { error: "Message body is required." });
        return;
      }

      const message = {
        id: `${conversationId}-${Date.now()}`,
        author: "self",
        body: trimmedBody,
        time: messageTime()
      };

      conversation.messages.push(message);
      conversation.snippet = trimmedBody;
      conversation.time = "Now";
      await writeDb(db);
      sendJson(res, 200, conversation);
      return;
    }

    if (method === "GET" && pathname === "/api/profile") {
      const db = await readDb();
      sendJson(res, 200, db.profile);
      return;
    }

    if (method === "PUT" && pathname === "/api/profile") {
      const { name, role, about } = await parseBody(req);
      const db = await readDb();
      db.profile.name = String(name ?? db.profile.name).trim() || db.profile.name;
      db.profile.role = String(role ?? db.profile.role).trim() || db.profile.role;
      db.profile.about = String(about ?? db.profile.about).trim() || db.profile.about;
      db.users[0].name = db.profile.name;
      db.users[0].role = db.profile.role;
      await writeDb(db);
      sendJson(res, 200, db.profile);
      return;
    }

    sendJson(res, 404, { error: "Route not found." });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Unexpected server error."
    });
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Volunteer prototype API running at http://127.0.0.1:${port}`);
});
