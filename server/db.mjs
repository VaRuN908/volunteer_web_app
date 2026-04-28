import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { PGlite } from "@electric-sql/pglite";
import { calculateMatch, extractNeeds } from "./matching.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.join(__dirname, "schema.sql");
const seedPath = path.join(__dirname, "prototype-db.json");
const dbPath = process.env.PGLITE_DATA_DIR || path.join(__dirname, ".pglite");

let dbPromise;

function parseJson(value, fallback) {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function serialize(value) {
  return JSON.stringify(value ?? []);
}

function createId(prefix) {
  return `${prefix}-${randomUUID()}`;
}

function nowIso() {
  return new Date().toISOString();
}

function relativeTimeLabel(timestamp) {
  const diff = Date.now() - Number(timestamp);

  if (diff < 60_000) {
    return "Now";
  }

  if (diff < 3_600_000) {
    return `${Math.floor(diff / 60_000)}m`;
  }

  if (diff < 86_400_000) {
    return `${Math.floor(diff / 3_600_000)}h`;
  }

  return `${Math.floor(diff / 86_400_000)}d`;
}

function messageTimeLabel(timestamp) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(Number(timestamp)));
}

function defaultProfileDetails(role, location) {
  return [
    { label: "Primary Role", value: role },
    { label: "Experience Level", value: "Intermediate" },
    { label: "Focus Area", value: "Community operations and outreach" },
    { label: "Coordination Style", value: "Reliable and action-oriented" },
    { label: "Active Region", value: location },
    { label: "Impact Tags", value: "#VolunteerOps #Community #Prototype" }
  ];
}

function defaultMetrics() {
  return [
    { label: "Projects", value: "1" },
    { label: "Connections", value: "12" },
    { label: "Rating", value: "4.7" }
  ];
}

function defaultCollections() {
  return [
    {
      id: createId("collection"),
      title: "Volunteer Toolkit",
      subtitle: "Starter resources",
      accent: "linear-gradient(135deg, #6d5efc, #1fb6ff)"
    }
  ];
}

async function seedDatabase(db) {
  const seedRaw = await readFile(seedPath, "utf8");
  const seed = JSON.parse(seedRaw);
  const existing = await db.query("SELECT COUNT(*)::int AS count FROM users");

  if ((existing.rows[0]?.count ?? 0) > 0) {
    return;
  }

  const primaryUser = seed.users[0];
  const userId = createId("user");
  const volunteerId = createId("volunteer");
  const passwordHash = await bcrypt.hash(primaryUser.password, 10);

  await db.query(
    `
      INSERT INTO users (
        id, email, password_hash, name, role, bio, location, availability, skills,
        metrics, profile_details, socials, support_links, collaborations, productions,
        collections, is_admin, created_at
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10::jsonb,$11::jsonb,$12::jsonb,$13::jsonb,$14::jsonb,$15::jsonb,$16::jsonb,$17,$18)
    `,
    [
      userId,
      primaryUser.email,
      passwordHash,
      seed.profile.name,
      seed.profile.role,
      seed.profile.about,
      "Mumbai, India",
      "Weekend and evening availability",
      serialize(seed.profile.skills),
      serialize(seed.profile.metrics),
      serialize(seed.profile.details),
      serialize(seed.profile.socials),
      serialize(seed.profile.supportLinks),
      serialize(seed.profile.collaborations),
      serialize(seed.profile.productions),
      serialize(seed.profile.collections),
      1,
      nowIso()
    ]
  );

  await db.query(
    `
      INSERT INTO volunteers (id, user_id, skills, location, availability, email, created_at)
      VALUES ($1,$2,$3::jsonb,$4,$5,$6,$7)
    `,
    [
      volunteerId,
      userId,
      serialize(seed.profile.skills),
      "Mumbai, India",
      "Weekend and evening availability",
      primaryUser.email,
      nowIso()
    ]
  );

  for (const category of seed.explore.categories) {
    await db.query(
      "INSERT INTO categories (id, label, tone, blurb) VALUES ($1,$2,$3,$4)",
      [category.id, category.label, category.tone, category.blurb]
    );
  }

  for (const community of seed.explore.suggested) {
    await db.query(
      `
        INSERT INTO communities (
          id, name, location, description, focus_role, impact, availability, tagline,
          action_label, initials, accent, category_ids, focus_areas, created_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,$13::jsonb,$14)
      `,
      [
        community.id,
        community.name,
        community.availability.includes("Remote") ? "Remote" : "India",
        community.tagline,
        community.role,
        community.impact,
        community.availability,
        community.tagline,
        community.actionLabel,
        community.initials,
        community.accent,
        serialize(community.categoryIds),
        serialize(community.focusAreas),
        nowIso()
      ]
    );
  }

  const taskSeedMeta = {
    "Mumbai Coastal Cleanup": {
      communityId: "swachh-bharat",
      needCategory: "environment",
      urgencyScore: 9,
      skillsRequired: ["Team Coordination", "Community Outreach", "Documentation"]
    },
    "Cyber Security Awareness Drive": {
      communityId: "mentor-circle",
      needCategory: "digital",
      urgencyScore: 7,
      skillsRequired: ["Volunteer Training", "Documentation", "Community Outreach"]
    },
    "Rural Education Support Camp": {
      communityId: "mentor-circle",
      needCategory: "education",
      urgencyScore: 8,
      skillsRequired: ["Volunteer Training", "Team Coordination", "Community Outreach"]
    }
  };

  for (const event of seed.explore.featuredEvents) {
    const meta = taskSeedMeta[event.title];
    await db.query(
      `
        INSERT INTO tasks (
          id, community_id, title, category_label, need_category, urgency_score, description,
          location, event_date, time_range, roles, actions, skills_required, accent, created_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,$12::jsonb,$13::jsonb,$14,$15)
      `,
      [
        createId("task"),
        meta.communityId,
        event.title,
        event.category,
        meta.needCategory,
        meta.urgencyScore,
        event.description,
        event.location,
        event.date,
        event.time,
        serialize(event.roleStats),
        serialize(event.actions),
        serialize(meta.skillsRequired),
        "linear-gradient(135deg, #8b6bf6, #b78cff)",
        nowIso()
      ]
    );
  }

  for (const trend of seed.explore.trending) {
    await db.query(
      "INSERT INTO trending_topics (id, label, momentum, summary) VALUES ($1,$2,$3,$4)",
      [trend.id, trend.label, trend.momentum, trend.summary]
    );
  }

  const surveySeeds = [
    {
      communityId: "swachh-bharat",
      rawText:
        "Urgent cleanup support is needed before the next rain spell. We need waste sorting volunteers, outreach helpers, and documentation support."
    },
    {
      communityId: "mentor-circle",
      rawText:
        "Students need weekend mentoring, digital literacy sessions, and volunteer coordinators who can manage learning groups."
    },
    {
      communityId: "asha-kitchen",
      rawText:
        "Food packing and route coordination support is needed for local families this week. Extra volunteers would help immediately."
    }
  ];

  for (const survey of surveySeeds) {
    const parsed = extractNeeds(survey.rawText);
    await db.query(
      "INSERT INTO survey_responses (id, community_id, raw_text, parsed_needs, created_at) VALUES ($1,$2,$3,$4::jsonb,$5)",
      [createId("survey"), survey.communityId, survey.rawText, serialize(parsed), nowIso()]
    );
  }

  const conversationSeeds = seed.chat.conversations;
  const timeOffsets = { Now: 0, "12m": 12 * 60 * 1000, "1h": 60 * 60 * 1000, "3h": 3 * 60 * 60 * 1000 };

  for (const conversation of conversationSeeds) {
    const updatedAt = Date.now() - (timeOffsets[conversation.time] ?? 0);
    await db.query(
      `
        INSERT INTO conversations (
          id, name, role, snippet, updated_label, badge, status, initials, accent,
          channel, kind, updated_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      `,
      [
        conversation.id,
        conversation.name,
        conversation.role,
        conversation.snippet,
        conversation.time,
        conversation.badge,
        conversation.status,
        conversation.initials,
        conversation.accent,
        conversation.channel,
        conversation.kind,
        updatedAt
      ]
    );

    let messageCursor = updatedAt - 5 * 60 * 1000;
    for (const message of conversation.messages) {
      messageCursor += 2 * 60 * 1000;
      await db.query(
        `
          INSERT INTO messages (
            id, conversation_id, author_user_id, author_name, body, time_label, sent_at
          )
          VALUES ($1,$2,$3,$4,$5,$6,$7)
        `,
        [
          message.id,
          conversation.id,
          message.author === "self" ? userId : null,
          message.author === "self" ? seed.profile.name : conversation.name,
          message.body,
          message.time,
          messageCursor
        ]
      );
    }
  }

  await recomputeAllMatches(db);
}

export async function getDb() {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = new PGlite(dbPath);
      const schema = await readFile(schemaPath, "utf8");
      await db.exec(schema);
      await seedDatabase(db);
      return db;
    })();
  }

  return dbPromise;
}

export async function getUserByEmail(email) {
  const db = await getDb();
  const result = await db.query("SELECT * FROM users WHERE lower(email) = lower($1) LIMIT 1", [email]);
  return result.rows[0] ?? null;
}

export async function getUserById(userId) {
  const db = await getDb();
  const result = await db.query("SELECT * FROM users WHERE id = $1 LIMIT 1", [userId]);
  return result.rows[0] ?? null;
}

export async function createUser(payload) {
  const db = await getDb();
  const userId = createId("user");
  const volunteerId = createId("volunteer");
  const passwordHash = await bcrypt.hash(payload.password, 10);
  const normalizedSkills = payload.skills.filter(Boolean);
  const metrics = defaultMetrics();
  const details = defaultProfileDetails(payload.role, payload.location);
  const socials = [
    { id: "yt", label: "YT", urlLabel: "YouTube" },
    { id: "ig", label: "IG", urlLabel: "Instagram" }
  ];

  await db.query(
    `
      INSERT INTO users (
        id, email, password_hash, name, role, bio, location, availability, skills,
        metrics, profile_details, socials, support_links, collaborations, productions,
        collections, is_admin, created_at
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10::jsonb,$11::jsonb,$12::jsonb,$13::jsonb,$14::jsonb,$15::jsonb,$16::jsonb,$17,$18)
    `,
    [
      userId,
      payload.email,
      passwordHash,
      payload.name,
      payload.role,
      "New volunteer profile created from the working prototype signup flow.",
      payload.location,
      payload.availability,
      serialize(normalizedSkills),
      serialize(metrics),
      serialize(details),
      serialize(socials),
      serialize(["Settings", "Privacy", "Help & Support"]),
      serialize([]),
      serialize([]),
      serialize(defaultCollections()),
      0,
      nowIso()
    ]
  );

  await db.query(
    `
      INSERT INTO volunteers (id, user_id, skills, location, availability, email, created_at)
      VALUES ($1,$2,$3::jsonb,$4,$5,$6,$7)
    `,
    [
      volunteerId,
      userId,
      serialize(normalizedSkills),
      payload.location,
      payload.availability,
      payload.email,
      nowIso()
    ]
  );

  await recomputeMatchesForUser(db, userId);
  return getUserById(userId);
}

async function getVolunteerByUserId(db, userId) {
  const result = await db.query("SELECT * FROM volunteers WHERE user_id = $1 LIMIT 1", [userId]);
  return result.rows[0] ?? null;
}

function mapProfile(user) {
  return {
    name: user.name,
    role: user.role,
    about: user.bio,
    metrics: parseJson(user.metrics, []),
    details: parseJson(user.profile_details, []),
    skills: parseJson(user.skills, []),
    socials: parseJson(user.socials, []),
    productions: parseJson(user.productions, []),
    collections: parseJson(user.collections, []),
    collaborations: parseJson(user.collaborations, []),
    supportLinks: parseJson(user.support_links, [])
  };
}

export async function getProfileByUserId(userId) {
  const user = await getUserById(userId);
  return user ? mapProfile(user) : null;
}

export async function updateProfileByUserId(userId, payload) {
  const db = await getDb();
  const current = await getUserById(userId);
  if (!current) {
    return null;
  }

  const nextName = payload.name?.trim() || current.name;
  const nextRole = payload.role?.trim() || current.role;
  const nextAbout = payload.about?.trim() || current.bio;
  const currentDetails = parseJson(current.profile_details, []);
  const nextDetails = currentDetails.map((detail) => {
    if (detail.label === "Primary Role") {
      return { ...detail, value: nextRole };
    }

    return detail;
  });

  await db.query(
    "UPDATE users SET name = $1, role = $2, bio = $3, profile_details = $4::jsonb WHERE id = $5",
    [nextName, nextRole, nextAbout, serialize(nextDetails), userId]
  );

  return getProfileByUserId(userId);
}

async function getSurveyNeedsByCommunity(db) {
  const result = await db.query("SELECT community_id, parsed_needs FROM survey_responses");
  const map = new Map();

  for (const row of result.rows) {
    const existing = map.get(row.community_id) ?? [];
    existing.push(parseJson(row.parsed_needs, {}));
    map.set(row.community_id, existing);
  }

  return map;
}

export async function recomputeMatchesForUser(db, userId) {
  const volunteer = await getVolunteerByUserId(db, userId);
  if (!volunteer) {
    return [];
  }

  await db.query("DELETE FROM matches WHERE volunteer_id = $1", [volunteer.id]);
  const tasksResult = await db.query("SELECT * FROM tasks");
  const surveyMap = await getSurveyNeedsByCommunity(db);
  const inserted = [];

  for (const task of tasksResult.rows) {
    const match = calculateMatch({
      volunteer: {
        skills: parseJson(volunteer.skills, []),
        location: volunteer.location,
        availability: volunteer.availability
      },
      task: {
        needCategory: task.need_category,
        urgencyScore: task.urgency_score,
        location: task.location,
        eventDate: task.event_date,
        timeRange: task.time_range,
        skillsRequired: parseJson(task.skills_required, [])
      },
      parsedNeeds: surveyMap.get(task.community_id) ?? []
    });

    await db.query(
      `
        INSERT INTO matches (id, volunteer_id, task_id, match_score, status, reasons, created_at)
        VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7)
      `,
      [
        createId("match"),
        volunteer.id,
        task.id,
        match.score,
        match.score >= 75 ? "recommended" : "review",
        serialize(match.reasons),
        nowIso()
      ]
    );
    inserted.push({ taskId: task.id, score: match.score, reasons: match.reasons });
  }

  return inserted;
}

export async function recomputeAllMatches(db) {
  const volunteers = await db.query("SELECT user_id FROM volunteers");
  for (const volunteer of volunteers.rows) {
    await recomputeMatchesForUser(db, volunteer.user_id);
  }
}

function mapCommunityCard(row, connectedIds, communityMatch) {
  return {
    id: row.id,
    name: row.name,
    role: row.focus_role,
    impact: row.impact,
    availability: row.availability,
    tagline: row.tagline,
    categoryIds: parseJson(row.category_ids, []),
    focusAreas: parseJson(row.focus_areas, []),
    actionLabel: connectedIds.includes(row.id) ? "Connected" : row.action_label,
    initials: row.initials,
    accent: row.accent,
    matchScore: communityMatch?.score ?? 0,
    matchReasons: communityMatch?.reasons ?? []
  };
}

export async function getExploreContentByUserId(userId) {
  const db = await getDb();
  await recomputeMatchesForUser(db, userId);
  const categoriesResult = await db.query("SELECT * FROM categories ORDER BY label ASC");
  const communitiesResult = await db.query("SELECT * FROM communities");
  const tasksResult = await db.query("SELECT * FROM tasks");
  const volunteer = await getVolunteerByUserId(db, userId);
  const connectionsResult = await db.query("SELECT community_id FROM user_connections WHERE user_id = $1", [userId]);
  const matchRows = volunteer
    ? (await db.query("SELECT * FROM matches WHERE volunteer_id = $1", [volunteer.id])).rows
    : [];
  const trendingRows = (await db.query("SELECT * FROM trending_topics")).rows;
  const connectedIds = connectionsResult.rows.map((row) => row.community_id);

  const matchMap = new Map(matchRows.map((row) => [row.task_id, { score: row.match_score, reasons: parseJson(row.reasons, []) }]));
  const featuredEvents = tasksResult.rows
    .map((task) => ({
      id: task.id,
      title: task.title,
      category: task.category_label,
      date: task.event_date,
      time: task.time_range,
      location: task.location,
      roleStats: parseJson(task.roles, []),
      description: task.description,
      actions: parseJson(task.actions, []),
      matchScore: matchMap.get(task.id)?.score ?? 0,
      matchReasons: matchMap.get(task.id)?.reasons ?? []
    }))
    .sort((left, right) => (right.matchScore ?? 0) - (left.matchScore ?? 0))
    .slice(0, 3);

  const communityMatchMap = new Map();
  for (const task of tasksResult.rows) {
    const existing = communityMatchMap.get(task.community_id);
    const taskMatch = matchMap.get(task.id) ?? { score: 0, reasons: [] };
    if (!existing || taskMatch.score > existing.score) {
      communityMatchMap.set(task.community_id, taskMatch);
    }
  }

  const suggested = communitiesResult.rows
    .map((row) => mapCommunityCard(row, connectedIds, communityMatchMap.get(row.id)))
    .sort((left, right) => (right.matchScore ?? 0) - (left.matchScore ?? 0));

  const spotlightTask = tasksResult.rows.sort((left, right) => right.urgency_score - left.urgency_score)[0];

  return {
    heading: "Explore Opportunities",
    subheading: "Live recommendations now use your saved skills, availability, and community needs.",
    searchPlaceholder: "Search for projects, causes, and locations...",
    categories: categoriesResult.rows.map((row) => ({
      id: row.id,
      label: row.label,
      tone: row.tone,
      blurb: row.blurb
    })),
    featuredEvents,
    suggested,
    connectedCardIds: connectedIds,
    spotlight: spotlightTask
      ? {
          title: spotlightTask.title,
          description: spotlightTask.description,
          cta: "Open urgent task"
        }
      : {
          title: "Volunteer Spotlight",
          description: "No urgent task yet.",
          cta: "View response plan"
        },
    trending: trendingRows.map((row) => ({
      id: row.id,
      label: row.label,
      momentum: row.momentum,
      summary: row.summary
    }))
  };
}

export async function toggleCommunityConnection(userId, communityId) {
  const db = await getDb();
  const existing = await db.query(
    "SELECT 1 FROM user_connections WHERE user_id = $1 AND community_id = $2 LIMIT 1",
    [userId, communityId]
  );

  if (existing.rows.length > 0) {
    await db.query("DELETE FROM user_connections WHERE user_id = $1 AND community_id = $2", [userId, communityId]);
  } else {
    await db.query("INSERT INTO user_connections (user_id, community_id) VALUES ($1, $2)", [userId, communityId]);
  }

  const refreshed = await db.query("SELECT community_id FROM user_connections WHERE user_id = $1", [userId]);
  return refreshed.rows.map((row) => row.community_id);
}

function mapConversationMessages(rows, userId) {
  return rows.map((row) => ({
    id: row.id,
    author: row.author_user_id === userId ? "self" : "other",
    body: row.body,
    time: row.time_label
  }));
}

async function mapConversation(db, conversationRow, userId) {
  const messagesResult = await db.query(
    "SELECT * FROM messages WHERE conversation_id = $1 ORDER BY sent_at ASC",
    [conversationRow.id]
  );

  return {
    id: conversationRow.id,
    name: conversationRow.name,
    role: conversationRow.role,
    snippet: conversationRow.snippet,
    time: conversationRow.updated_label,
    badge: conversationRow.badge,
    status: conversationRow.status,
    initials: conversationRow.initials,
    accent: conversationRow.accent,
    channel: conversationRow.channel,
    kind: conversationRow.kind,
    messages: mapConversationMessages(messagesResult.rows, userId)
  };
}

export async function getChatContentByUserId(userId) {
  const db = await getDb();
  const conversationsResult = await db.query("SELECT * FROM conversations ORDER BY updated_at DESC");
  const conversations = [];

  for (const conversation of conversationsResult.rows) {
    conversations.push(await mapConversation(db, conversation, userId));
  }

  return {
    heading: "Inbox",
    subheading: "Realtime volunteer coordination powered by live WebSocket updates.",
    searchPlaceholder: "Search conversations...",
    featuredRequest: {
      name: "Nida Rahman",
      role: "Relief Camp Coordinator",
      message:
        "Can you anchor the volunteer roster for tomorrow's medical camp? We need one person to manage check-in, routing, and urgent supply requests.",
      accent: "linear-gradient(135deg, #8b5cf6, #6366f1)",
      initials: "NR"
    },
    conversations
  };
}

export async function createConversationMessage(userId, conversationId, body) {
  const db = await getDb();
  const user = await getUserById(userId);
  if (!user) {
    throw new Error("User not found.");
  }

  const trimmedBody = body.trim();
  if (!trimmedBody) {
    throw new Error("Message body is required.");
  }

  const timestamp = Date.now();
  const messageId = createId("message");

  await db.query(
    `
      INSERT INTO messages (id, conversation_id, author_user_id, author_name, body, time_label, sent_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
    `,
    [messageId, conversationId, userId, user.name, trimmedBody, messageTimeLabel(timestamp), timestamp]
  );

  await db.query(
    "UPDATE conversations SET snippet = $1, updated_label = $2, updated_at = $3 WHERE id = $4",
    [trimmedBody, "Now", timestamp, conversationId]
  );

  const conversationRow = (
    await db.query("SELECT * FROM conversations WHERE id = $1 LIMIT 1", [conversationId])
  ).rows[0];

  if (!conversationRow) {
    throw new Error("Conversation not found.");
  }

  return mapConversation(db, conversationRow, userId);
}

export async function getAdminDashboardByUserId(userId) {
  const db = await getDb();
  const user = await getUserById(userId);

  if (!user || Number(user.is_admin) !== 1) {
    throw new Error("Admin access is required.");
  }

  await recomputeAllMatches(db);
  const communitiesRows = (await db.query("SELECT * FROM communities ORDER BY created_at DESC")).rows;
  const tasksRows = (
    await db.query(
      `
        SELECT tasks.*, communities.name AS community_name
        FROM tasks
        JOIN communities ON communities.id = tasks.community_id
        ORDER BY tasks.created_at DESC
      `
    )
  ).rows;
  const surveyRows = (
    await db.query(
      `
        SELECT survey_responses.*, communities.name AS community_name
        FROM survey_responses
        JOIN communities ON communities.id = survey_responses.community_id
        ORDER BY survey_responses.created_at DESC
      `
    )
  ).rows;
  const matchRows = (
    await db.query(
      `
        SELECT
          matches.*,
          users.name AS volunteer_name,
          tasks.title AS task_title,
          communities.name AS community_name
        FROM matches
        JOIN volunteers ON volunteers.id = matches.volunteer_id
        JOIN users ON users.id = volunteers.user_id
        JOIN tasks ON tasks.id = matches.task_id
        JOIN communities ON communities.id = tasks.community_id
        ORDER BY matches.match_score DESC
      `
    )
  ).rows;

  const bestMatchByTask = new Map();
  for (const row of matchRows) {
    const existing = bestMatchByTask.get(row.task_id);
    if (!existing || row.match_score > existing) {
      bestMatchByTask.set(row.task_id, row.match_score);
    }
  }

  return {
    stats: {
      communities: communitiesRows.length,
      tasks: tasksRows.length,
      surveys: surveyRows.length,
      matches: matchRows.length
    },
    communities: communitiesRows.map((row) => ({
      id: row.id,
      name: row.name,
      location: row.location,
      description: row.description,
      focusRole: row.focus_role,
      activeVolunteers: 1
    })),
    tasks: tasksRows.map((row) => ({
      id: row.id,
      title: row.title,
      communityName: row.community_name,
      needCategory: row.need_category,
      urgencyScore: row.urgency_score,
      description: row.description,
      location: row.location,
      eventDate: row.event_date,
      timeRange: row.time_range,
      skillsRequired: parseJson(row.skills_required, []),
      matchScore: bestMatchByTask.get(row.id) ?? 0
    })),
    surveys: surveyRows.map((row) => ({
      id: row.id,
      communityName: row.community_name,
      rawText: row.raw_text,
      parsedNeeds: parseJson(row.parsed_needs, {}),
      createdAt: row.created_at
    })),
    matches: matchRows.map((row) => ({
      id: row.id,
      volunteerName: row.volunteer_name,
      taskTitle: row.task_title,
      communityName: row.community_name,
      matchScore: row.match_score,
      status: row.status,
      reasons: parseJson(row.reasons, [])
    }))
  };
}

export async function createCommunityRecord(payload) {
  const db = await getDb();
  const id = createId("community");

  await db.query(
    `
      INSERT INTO communities (
        id, name, location, description, focus_role, impact, availability, tagline,
        action_label, initials, accent, category_ids, focus_areas, created_at
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,$13::jsonb,$14)
    `,
    [
      id,
      payload.name,
      payload.location,
      payload.description,
      payload.focusRole,
      "New community onboarded",
      "Flexible support welcome",
      payload.description,
      "Connect",
      payload.name
        .split(" ")
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase() ?? "")
        .join(""),
      "linear-gradient(135deg, #8b6bf6, #b78cff)",
      serialize(["local-projects"]),
      serialize(["Community", "Outreach"]),
      nowIso()
    ]
  );

  const row = (await db.query("SELECT * FROM communities WHERE id = $1", [id])).rows[0];
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    description: row.description,
    focusRole: row.focus_role,
    activeVolunteers: 1
  };
}

export async function createTaskRecord(payload) {
  const db = await getDb();
  await db.query(
    `
      INSERT INTO tasks (
        id, community_id, title, category_label, need_category, urgency_score, description,
        location, event_date, time_range, roles, actions, skills_required, accent, created_at
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,$12::jsonb,$13::jsonb,$14,$15)
    `,
    [
      createId("task"),
      payload.communityId,
      payload.title,
      payload.needCategory.replace(/-/g, " "),
      payload.needCategory,
      payload.urgencyScore,
      payload.description,
      payload.location,
      payload.eventDate,
      payload.timeRange,
      serialize([{ label: "Volunteer Slots", count: "Open" }]),
      serialize(["Register for Event", "Volunteer Now"]),
      serialize(payload.skillsRequired),
      "linear-gradient(135deg, #24406c, #3f5f92)",
      nowIso()
    ]
  );

  await recomputeAllMatches(db);
}

export async function createSurveyRecord(payload) {
  const db = await getDb();
  const parsed = extractNeeds(payload.rawText);
  await db.query(
    "INSERT INTO survey_responses (id, community_id, raw_text, parsed_needs, created_at) VALUES ($1,$2,$3,$4::jsonb,$5)",
    [createId("survey"), payload.communityId, payload.rawText, serialize(parsed), nowIso()]
  );
  await recomputeAllMatches(db);
  return parsed;
}
