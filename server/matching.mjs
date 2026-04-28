const NEED_KEYWORDS = {
  environment: ["cleanup", "shoreline", "waste", "lake", "green", "coastal", "environment"],
  education: ["student", "school", "mentor", "teaching", "education", "tutor", "learning"],
  relief: ["relief", "flood", "emergency", "response", "rescue", "urgent", "disaster"],
  health: ["health", "medical", "blood", "clinic", "camp", "medicine"],
  food: ["meal", "food", "kitchen", "hunger", "ration", "packing"],
  digital: ["digital", "cyber", "tech", "coding", "online", "security", "device"],
  community: ["community", "outreach", "local", "neighborhood", "volunteer"]
};

const URGENCY_TERMS = ["urgent", "asap", "immediately", "emergency", "critical", "tonight", "today"];

function normalizeWords(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function extractNeeds(rawText) {
  const words = normalizeWords(rawText);
  const categories = new Set();
  const keywords = new Set();

  for (const [category, terms] of Object.entries(NEED_KEYWORDS)) {
    for (const term of terms) {
      if (words.some((word) => word.includes(term) || term.includes(word))) {
        categories.add(category);
        keywords.add(term);
      }
    }
  }

  const urgencyHits = URGENCY_TERMS.filter((term) =>
    words.some((word) => word.includes(term) || term.includes(word))
  ).length;

  const urgency = Math.min(10, Math.max(categories.size > 0 ? 4 : 2, urgencyHits * 3 + 2));
  const categoryList = Array.from(categories);
  const keywordList = Array.from(keywords);

  return {
    categories: categoryList.length > 0 ? categoryList : ["community"],
    keywords: keywordList,
    urgency,
    summary:
      categoryList.length > 0
        ? `Detected ${categoryList.join(", ")} needs with urgency ${urgency}/10.`
        : `Detected general community-support needs with urgency ${urgency}/10.`
  };
}

function overlapScore(requiredSkills, volunteerSkills) {
  if (requiredSkills.length === 0) {
    return 0.5;
  }

  const required = new Set(requiredSkills.map((skill) => skill.toLowerCase()));
  const available = new Set(volunteerSkills.map((skill) => skill.toLowerCase()));
  let matches = 0;

  for (const skill of required) {
    if (available.has(skill)) {
      matches += 1;
    }
  }

  return matches / required.size;
}

function locationScore(userLocation, taskLocation) {
  const userWords = normalizeWords(userLocation);
  const taskWords = normalizeWords(taskLocation);

  if (userWords.length === 0 || taskWords.length === 0) {
    return 0.4;
  }

  const shared = userWords.filter((word) => taskWords.includes(word));
  return shared.length > 0 ? 1 : 0.35;
}

function availabilityScore(availability, eventDate, timeRange) {
  const text = `${availability} ${eventDate} ${timeRange}`.toLowerCase();

  if (text.includes("flex")) {
    return 1;
  }

  if (text.includes("weekend") && (text.includes("saturday") || text.includes("sunday"))) {
    return 1;
  }

  if (text.includes("remote")) {
    return 0.85;
  }

  return 0.6;
}

export function calculateMatch({ volunteer, task, parsedNeeds }) {
  const volunteerSkills = volunteer.skills ?? [];
  const taskSkills = task.skillsRequired ?? [];
  const needCategories = parsedNeeds.flatMap((entry) => entry.categories ?? []);
  const skillScore = overlapScore(taskSkills, volunteerSkills);
  const geoScore = locationScore(volunteer.location ?? "", task.location ?? "");
  const scheduleScore = availabilityScore(volunteer.availability ?? "", task.eventDate ?? "", task.timeRange ?? "");
  const categoryScore = needCategories.includes(task.needCategory) ? 1 : 0.45;
  const urgencyScore = Math.min(1, Number(task.urgencyScore ?? 0) / 10);

  const score = Math.round(
    skillScore * 45 +
      geoScore * 15 +
      scheduleScore * 15 +
      categoryScore * 15 +
      urgencyScore * 10
  );

  const reasons = [];

  if (skillScore >= 0.5) {
    reasons.push("Strong skill overlap");
  }

  if (geoScore >= 1) {
    reasons.push("Location aligns well");
  }

  if (scheduleScore >= 0.85) {
    reasons.push("Availability fits the event window");
  }

  if (categoryScore >= 1) {
    reasons.push("Matches recent community needs");
  }

  if (urgencyScore >= 0.8) {
    reasons.push("High-urgency task");
  }

  return {
    score,
    reasons: reasons.length > 0 ? reasons : ["General volunteer fit"]
  };
}
