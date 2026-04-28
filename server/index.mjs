import { existsSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { WebSocketServer, WebSocket } from "ws";
import {
  createCommunityRecord,
  createSurveyRecord,
  createTaskRecord,
  createUser,
  createConversationMessage,
  getAdminDashboardByUserId,
  getChatContentByUserId,
  getExploreContentByUserId,
  getProfileByUserId,
  getUserByEmail,
  getUserById,
  toggleCommunityConnection,
  updateProfileByUserId
} from "./db.mjs";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });
const PORT = Number(process.env.PORT || 4177);
const HOST = process.env.HOST || "0.0.0.0";
const JWT_SECRET = process.env.JWT_SECRET || "volunteer-connect-prototype-secret";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, "../dist");
const distIndexFile = path.join(distDir, "index.html");
const hasBuiltFrontend = existsSync(distIndexFile);
const allowVercelPreviews = process.env.ALLOW_VERCEL_PREVIEWS !== "false";
const allowedOrigins = new Set(
  [
    "http://127.0.0.1:4175",
    "http://localhost:4175",
    "http://127.0.0.1:4177",
    "http://localhost:4177",
    ...(process.env.ALLOWED_ORIGINS ?? "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  ].map((origin) => origin.replace(/\/$/, ""))
);

function isAllowedOrigin(origin) {
  if (!origin) {
    return true;
  }

  const normalizedOrigin = origin.replace(/\/$/, "");
  if (allowedOrigins.has(normalizedOrigin)) {
    return true;
  }

  try {
    const { hostname } = new URL(normalizedOrigin);
    return allowVercelPreviews && hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin ?? "unknown"} is not allowed by CORS.`));
    },
    credentials: true
  })
);
app.use(express.json());
app.use(express.static(distDir));

function createSession(user) {
  const payload = {
    userId: user.id,
    email: user.email,
    isAdmin: Number(user.is_admin) === 1
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "12h" });

  return {
    token,
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isAdmin: Number(user.is_admin) === 1
  };
}

function getBearerToken(req) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return null;
  }

  return header.slice("Bearer ".length);
}

async function authRequired(req, res, next) {
  const token = getBearerToken(req);

  if (!token) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await getUserById(decoded.userId);

    if (!user) {
      res.status(401).json({ error: "Session is no longer valid." });
      return;
    }

    req.user = {
      userId: user.id,
      email: user.email,
      isAdmin: Number(user.is_admin) === 1
    };
    next();
  } catch {
    res.status(401).json({ error: "Authentication token is invalid or expired." });
  }
}

function adminRequired(req, res, next) {
  if (!req.user?.isAdmin) {
    res.status(403).json({ error: "Admin access is required." });
    return;
  }

  next();
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    frontendReady: hasBuiltFrontend,
    websocketReady: true,
    deployment: hasBuiltFrontend ? "combined" : "api-only"
  });
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, role, location, availability, skills } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: "Name, email, and password are required." });
      return;
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      res.status(409).json({ error: "An account with this email already exists." });
      return;
    }

    const user = await createUser({
      name,
      email,
      password,
      role: role || "Volunteer Contributor",
      location: location || "India",
      availability: availability || "Flexible",
      skills: Array.isArray(skills) ? skills : []
    });

    res.status(201).json(createSession(user));
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Registration failed." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await getUserByEmail(email || "");

    if (!user) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const validPassword = await bcrypt.compare(password || "", user.password_hash);
    if (!validPassword) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    res.json(createSession(user));
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Login failed." });
  }
});

app.post("/api/auth/logout", authRequired, (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/explore", authRequired, async (req, res) => {
  try {
    const data = await getExploreContentByUserId(req.user.userId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Could not load explore data." });
  }
});

app.post("/api/explore/connect", authRequired, async (req, res) => {
  try {
    const { cardId } = req.body;
    const connectedCardIds = await toggleCommunityConnection(req.user.userId, cardId);
    res.json({ connectedCardIds });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Could not update connection." });
  }
});

app.get("/api/chat", authRequired, async (req, res) => {
  try {
    const data = await getChatContentByUserId(req.user.userId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Could not load chat data." });
  }
});

app.post("/api/chat/conversations/:conversationId/messages", authRequired, async (req, res) => {
  try {
    const conversation = await createConversationMessage(
      req.user.userId,
      req.params.conversationId,
      String(req.body.body ?? "")
    );
    res.json(conversation);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Could not send the message." });
  }
});

app.get("/api/profile", authRequired, async (req, res) => {
  try {
    const profile = await getProfileByUserId(req.user.userId);
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Could not load profile." });
  }
});

app.put("/api/profile", authRequired, async (req, res) => {
  try {
    const profile = await updateProfileByUserId(req.user.userId, req.body);
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Could not save profile." });
  }
});

app.get("/api/admin/dashboard", authRequired, adminRequired, async (req, res) => {
  try {
    const dashboard = await getAdminDashboardByUserId(req.user.userId);
    res.json(dashboard);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Could not load admin dashboard." });
  }
});

app.post("/api/admin/communities", authRequired, adminRequired, async (req, res) => {
  try {
    const community = await createCommunityRecord(req.body);
    res.status(201).json(community);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Could not create community." });
  }
});

app.post("/api/admin/tasks", authRequired, adminRequired, async (req, res) => {
  try {
    await createTaskRecord(req.body);
    res.status(201).json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Could not create task." });
  }
});

app.post("/api/admin/surveys", authRequired, adminRequired, async (req, res) => {
  try {
    const parsed = await createSurveyRecord(req.body);
    res.status(201).json({ ok: true, parsed });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Could not save survey response." });
  }
});

app.use((req, res, next) => {
  if (req.method !== "GET") {
    next();
    return;
  }

  if (req.path.startsWith("/api") || req.path.startsWith("/ws")) {
    next();
    return;
  }

  if (hasBuiltFrontend) {
    res.sendFile(distIndexFile);
    return;
  }

  res.status(200).send(
    "Volunteer Connect API is running. The frontend is deployed separately. Check /api/health for service status."
  );
});

function verifySocket(requestUrl) {
  const url = new URL(requestUrl, "http://127.0.0.1");
  const token = url.searchParams.get("token");
  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function broadcast(payload) {
  const encoded = JSON.stringify(payload);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(encoded);
    }
  }
}

wss.on("connection", async (socket, request) => {
  const session = verifySocket(request.url ?? "");

  if (!session?.userId) {
    socket.close(1008, "Unauthorized");
    return;
  }

  socket.userId = session.userId;
  socket.send(JSON.stringify({ type: "socket:ready" }));

  socket.on("message", async (rawMessage) => {
    try {
      const payload = JSON.parse(rawMessage.toString());
      if (payload.type !== "chat:message") {
        return;
      }

      const body = String(payload.body ?? "").trim();
      if (!body) {
        return;
      }

      await createConversationMessage(socket.userId, payload.conversationId, body);
      const timestamp = Date.now();

      broadcast({
        type: "chat:message",
        conversationId: payload.conversationId,
        senderUserId: socket.userId,
        message: {
          id: `${payload.conversationId}-${timestamp}`,
          body,
          time: new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            minute: "2-digit"
          }).format(new Date(timestamp))
        },
        snippet: body,
        updatedLabel: "Now"
      });
    } catch {
      socket.send(JSON.stringify({ type: "socket:error", message: "Could not process chat message." }));
    }
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Volunteer Connect backend running at http://${HOST}:${PORT}`);
});
