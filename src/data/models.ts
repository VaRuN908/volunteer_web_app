export type NavItem = {
  path: "/app" | "/app/chat" | "/app/profile" | "/app/admin";
  label: string;
};

export type CategoryChip = {
  id: string;
  label: string;
  tone: "violet" | "mint" | "amber" | "rose";
  blurb: string;
};

export type VolunteerCard = {
  id: string;
  name: string;
  role: string;
  impact: string;
  availability: string;
  tagline: string;
  categoryIds: string[];
  focusAreas: string[];
  actionLabel: string;
  initials: string;
  accent: string;
  matchScore?: number;
  matchReasons?: string[];
};

export type TrendingTopic = {
  id: string;
  label: string;
  momentum: string;
  summary: string;
};

export type FeaturedEventRole = {
  label: string;
  count: string;
};

export type FeaturedEvent = {
  id?: string;
  title: string;
  category: string;
  date: string;
  time: string;
  location: string;
  roleStats: FeaturedEventRole[];
  description: string;
  actions: string[];
  matchScore?: number;
  matchReasons?: string[];
};

export type ChatMessage = {
  id: string;
  author: "self" | "other";
  body: string;
  time: string;
};

export type ConversationPreview = {
  id: string;
  name: string;
  role: string;
  snippet: string;
  time: string;
  badge: "request" | "private" | "group" | "community";
  status: "online" | "review" | "quiet";
  initials: string;
  accent: string;
  channel: "private" | "group" | "community";
  kind: "message" | "request";
  messages: ChatMessage[];
};

export type ProfileMetric = {
  label: string;
  value: string;
};

export type CollaborationItem = {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  status: string;
  accent: string;
};

export type ProfileDetailItem = {
  label: string;
  value: string;
};

export type SocialPlatform = {
  id: string;
  label: string;
  urlLabel: string;
};

export type ProductionItem = {
  id: string;
  title: string;
  handle: string;
  length: string;
  reach: string;
  accent: string;
};

export type CollectionItem = {
  id: string;
  title: string;
  subtitle: string;
  accent: string;
};

export type AppContent = {
  shell: {
    title: string;
    tagline: string;
    desktopHighlights: string[];
    missionStats: { label: string; value: string }[];
  };
  explore: {
    heading: string;
    subheading: string;
    searchPlaceholder: string;
    categories: CategoryChip[];
    featuredEvents: FeaturedEvent[];
    suggested: VolunteerCard[];
    connectedCardIds?: string[];
    spotlight: {
      title: string;
      description: string;
      cta: string;
    };
    trending: TrendingTopic[];
  };
  chat: {
    heading: string;
    subheading: string;
    searchPlaceholder: string;
    featuredRequest: {
      name: string;
      role: string;
      message: string;
      accent: string;
      initials: string;
    };
    conversations: ConversationPreview[];
  };
  profile: {
    name: string;
    role: string;
    about: string;
    metrics: ProfileMetric[];
    details: ProfileDetailItem[];
    skills: string[];
    socials: SocialPlatform[];
    productions: ProductionItem[];
    collections: CollectionItem[];
    collaborations: CollaborationItem[];
    supportLinks: string[];
  };
};

export type SessionUser = {
  token: string;
  userId: string;
  email: string;
  name: string;
  role: string;
  isAdmin: boolean;
};

export type ManagedCommunity = {
  id: string;
  name: string;
  location: string;
  description: string;
  focusRole: string;
  activeVolunteers: number;
};

export type ManagedTask = {
  id: string;
  title: string;
  communityName: string;
  needCategory: string;
  urgencyScore: number;
  description: string;
  location: string;
  eventDate: string;
  timeRange: string;
  skillsRequired: string[];
  matchScore: number;
};

export type SurveyInsight = {
  id: string;
  communityName: string;
  rawText: string;
  parsedNeeds: {
    categories: string[];
    keywords: string[];
    urgency: number;
    summary: string;
  };
  createdAt: string;
};

export type MatchInsight = {
  id: string;
  volunteerName: string;
  taskTitle: string;
  communityName: string;
  matchScore: number;
  status: string;
  reasons: string[];
};

export type AdminDashboard = {
  stats: {
    communities: number;
    tasks: number;
    surveys: number;
    matches: number;
  };
  communities: ManagedCommunity[];
  tasks: ManagedTask[];
  surveys: SurveyInsight[];
  matches: MatchInsight[];
};
