import type { AppContent, NavItem } from "./models";

export const navItems: NavItem[] = [
  { path: "/app", label: "Explore" },
  { path: "/app/chat", label: "Inbox" },
  { path: "/app/profile", label: "Profile" }
];

export const appContent: AppContent = {
  shell: {
    title: "Volunteer Connect",
    tagline: "Prototype sprint for tomorrow's submission",
    desktopHighlights: [
      "Match volunteers with campaigns, NGOs, and urgent local needs.",
      "Keep the experience mobile-first while still feeling premium on desktop.",
      "Swap in PDF content later through one typed mock-data layer."
    ],
    missionStats: [
      { label: "Open campaigns", value: "18" },
      { label: "Weekly volunteer hours", value: "420h" },
      { label: "Cities activated", value: "9" }
    ]
  },
  explore: {
    heading: "Explore Opportunities",
    subheading: "Find your next volunteer mission and register in minutes.",
    searchPlaceholder: "Search for projects, causes, and locations...",
    categories: [
      {
        id: "local-projects",
        label: "Local Projects",
        tone: "violet",
        blurb: "Volunteer near your city with neighborhood and NGO teams."
      },
      {
        id: "global-causes",
        label: "Global Causes",
        tone: "mint",
        blurb: "Cross-border campaigns, digital efforts, and advocacy work."
      },
      {
        id: "skill-based",
        label: "Skill-Based",
        tone: "amber",
        blurb: "Design, tech, writing, and planning support for impact teams."
      },
      {
        id: "disaster-relief",
        label: "Disaster Relief",
        tone: "rose",
        blurb: "Urgent coordination, relief logistics, and response planning."
      },
      {
        id: "short-time",
        label: "Short Time Tasks",
        tone: "violet",
        blurb: "Quick contributions for busy schedules and remote volunteering."
      }
    ],
    featuredEvents: [
      {
        title: "Mumbai Coastal Cleanup",
        category: "Coastal Restoration",
        date: "Saturday Nov 9, 2024",
        time: "7:00 AM - 11:00 AM IST",
        location: "Juhu Beach, Mumbai",
        roleStats: [
          { label: "Water Patrol", count: "40" },
          { label: "Sorting Station", count: "35" },
          { label: "Waste Management", count: "25" }
        ],
        description:
          "Join a hands-on weekend cleanup to remove shoreline waste, guide visitors, and help protect the Mumbai coastline ecosystem.",
        actions: ["Register for Event", "Volunteer Now"]
      },
      {
        title: "Cyber Security Awareness Drive",
        category: "Digital Literacy",
        date: "Sunday Nov 10, 2024",
        time: "10:00 AM - 2:00 PM IST",
        location: "Delhi Tech Park, New Delhi",
        roleStats: [
          { label: "Mentors", count: "20" },
          { label: "Registration Desk", count: "10" },
          { label: "Tech Support", count: "15" }
        ],
        description:
          "Help educate local communities and small businesses on basic digital hygiene, safe online practices, and scam prevention.",
        actions: ["Register for Event", "Join as Mentor"]
      },
      {
        title: "Rural Education Support Camp",
        category: "Skill-Based",
        date: "Saturday Nov 16, 2024",
        time: "9:00 AM - 1:00 PM IST",
        location: "Pune District Schools, Maharashtra",
        roleStats: [
          { label: "Teaching Assistants", count: "30" },
          { label: "Resource Coordinators", count: "15" },
          { label: "Activity Leaders", count: "20" }
        ],
        description:
          "Provide weekend tutoring in mathematics and English, and help organize extracurricular learning activities for rural students.",
        actions: ["Register for Event", "Sign Up for Tasks"]
      }
    ],
    suggested: [
      {
        id: "asha-kitchen",
        name: "Asha Kitchen Network",
        role: "Community Meal Coordinator",
        impact: "8,600 meals served across Delhi NCR",
        availability: "Needs weekend volunteers",
        tagline: "Help with food packing, route support, and beneficiary check-ins.",
        categoryIds: ["local-projects", "short-time"],
        focusAreas: ["Food Security", "Operations"],
        actionLabel: "Join Drive",
        initials: "AK",
        accent: "linear-gradient(135deg, #f59e0b, #fb7185)"
      },
      {
        id: "swachh-bharat",
        name: "Swachh Bharat Collective",
        role: "Neighborhood Clean-Up Lead",
        impact: "12 wards activated in Bangalore",
        availability: "Saturday 7:00 AM",
        tagline: "Lead micro-teams for cleanup, sorting, and awareness booths.",
        categoryIds: ["local-projects", "disaster-relief"],
        focusAreas: ["Environment", "Community"],
        actionLabel: "Connect",
        initials: "SB",
        accent: "linear-gradient(135deg, #34d399, #22c55e)"
      },
      {
        id: "mentor-circle",
        name: "Rural Tech Mentors",
        role: "Student Mentor Program",
        impact: "440 first-gen learners onboarded",
        availability: "Remote-friendly",
        tagline: "Offer weekly guidance in coding, English, and interview prep to rural students.",
        categoryIds: ["skill-based", "global-causes"],
        focusAreas: ["Education", "Career"],
        actionLabel: "Volunteer",
        initials: "RT",
        accent: "linear-gradient(135deg, #818cf8, #a855f7)"
      }
    ],
    spotlight: {
      title: "Chennai Floods Relief",
      description:
        "A flood support team needs 14 volunteers for relief kit packing and live helpline updates before 9 PM.",
      cta: "View response plan"
    },
    trending: [
      {
        id: "kit-packing",
        label: "#MumbaiMonsoon",
        momentum: "1.8k signups in 24h",
        summary: "Local neighborhood projects are organizing preemptive flood relief supplies."
      },
      {
        id: "teach-saturday",
        label: "#DigitalIndia",
        momentum: "620 mentor hours pledged",
        summary: "Remote campaign teams are onboarding specialists for regional language digital support."
      },
      {
        id: "blood-camp",
        label: "#BloodDonationDelhi",
        momentum: "6 hospitals synced",
        summary: "High-impact response teams need coordinators for the city-wide blood donation drive."
      },
      {
        id: "lake-revival",
        label: "#LakeRevivalBLR",
        momentum: "3 wards joined",
        summary: "Short-time expert tasks for environmental planning and community mobilization."
      }
    ]
  },
  chat: {
    heading: "Inbox",
    subheading: "Your conversations, requests, and live volunteer coordination.",
    searchPlaceholder: "Search conversations...",
    featuredRequest: {
      name: "Nida Rahman",
      role: "Relief Camp Coordinator",
      message:
        "Can you anchor the volunteer roster for tomorrow's medical camp? We need one person to manage check-in, routing, and urgent supply requests.",
      accent: "linear-gradient(135deg, #8b5cf6, #6366f1)",
      initials: "NR"
    },
    conversations: [
      {
        id: "conv-1",
        name: "Asha Kitchen",
        role: "Meal Route Ops",
        snippet: "We added one more delivery route near JP Nagar. Can you take the lead?",
        time: "Now",
        badge: "request",
        status: "online",
        initials: "AK",
        accent: "linear-gradient(135deg, #f59e0b, #f97316)",
        channel: "private",
        kind: "request",
        messages: [
          {
            id: "m-1",
            author: "other",
            body: "We added one more delivery route near JP Nagar. Can you take the lead?",
            time: "10:02"
          },
          {
            id: "m-2",
            author: "self",
            body: "Yes, I can handle the route if I get two more packing volunteers.",
            time: "10:05"
          },
          {
            id: "m-3",
            author: "other",
            body: "Perfect. I am looping in two first-time volunteers now.",
            time: "10:06"
          }
        ]
      },
      {
        id: "conv-2",
        name: "Green Streets Crew",
        role: "Ward 4 Core Team",
        snippet: "Rain tomorrow. Should we shift the cleanup briefing indoors?",
        time: "12m",
        badge: "group",
        status: "review",
        initials: "GS",
        accent: "linear-gradient(135deg, #22c55e, #14b8a6)",
        channel: "group",
        kind: "message",
        messages: [
          {
            id: "m-4",
            author: "other",
            body: "Rain tomorrow. Should we shift the cleanup briefing indoors?",
            time: "09:41"
          },
          {
            id: "m-5",
            author: "self",
            body: "Yes. Let's move the briefing to the community hall and keep the sorting station outside if the rain eases.",
            time: "09:47"
          }
        ]
      },
      {
        id: "conv-3",
        name: "Mentor Circle",
        role: "Career Prep Pod",
        snippet: "Three students asked for mock interview slots this week.",
        time: "1h",
        badge: "community",
        status: "quiet",
        initials: "MC",
        accent: "linear-gradient(135deg, #818cf8, #a855f7)",
        channel: "community",
        kind: "message",
        messages: [
          {
            id: "m-6",
            author: "other",
            body: "Three students asked for mock interview slots this week.",
            time: "08:16"
          },
          {
            id: "m-7",
            author: "self",
            body: "I can take two of them on Thursday evening. Share the profiles and I will prepare role-specific questions.",
            time: "08:27"
          }
        ]
      },
      {
        id: "conv-4",
        name: "Health Camp Desk",
        role: "Operations Bulletin",
        snippet: "Registration tablets are charged and volunteer IDs are printed.",
        time: "3h",
        badge: "private",
        status: "online",
        initials: "HC",
        accent: "linear-gradient(135deg, #fb7185, #f43f5e)",
        channel: "private",
        kind: "message",
        messages: [
          {
            id: "m-8",
            author: "other",
            body: "Registration tablets are charged and volunteer IDs are printed.",
            time: "06:40"
          },
          {
            id: "m-9",
            author: "self",
            body: "Great. I will arrive 30 minutes early to check the check-in flow.",
            time: "06:44"
          }
        ]
      }
    ]
  },
  profile: {
    name: "Riya Sharma",
    role: "Volunteer Lead and Community Builder",
    about:
      "I enjoy building calm, reliable systems for high-energy volunteer teams. My sweet spot is coordinating people, simplifying handoffs, and turning one-time contributors into long-term community members.",
    metrics: [
      { label: "Projects", value: "24" },
      { label: "Connections", value: "1.2k" },
      { label: "Rating", value: "4.9" }
    ],
    details: [
      { label: "Primary Role", value: "Volunteer Systems Lead" },
      { label: "Experience Level", value: "Advanced" },
      { label: "Focus Area", value: "Community operations and outreach" },
      { label: "Coordination Style", value: "Calm, reliable, and structured" },
      { label: "Active Region", value: "Mumbai, India" },
      { label: "Impact Tags", value: "#VolunteerOps #Outreach #Coordination" }
    ],
    skills: [
      "Team Coordination",
      "Event Ops",
      "Volunteer Training",
      "Community Outreach",
      "Crisis Response",
      "Documentation"
    ],
    socials: [
      { id: "yt", label: "YT", urlLabel: "YouTube" },
      { id: "ig", label: "IG", urlLabel: "Instagram" },
      { id: "tt", label: "TT", urlLabel: "TikTok" }
    ],
    productions: [
      {
        id: "prod-1",
        title: "Neighborhood Relief Sprint",
        handle: "riyasharma",
        length: "2:24",
        reach: "48,052 views",
        accent: "linear-gradient(135deg, #6d5efc, #1fb6ff)"
      },
      {
        id: "prod-2",
        title: "Lost Colony Supply Drive",
        handle: "riyasharma",
        length: "3:18",
        reach: "40,654 views",
        accent: "linear-gradient(135deg, #fde68a, #f97316)"
      },
      {
        id: "prod-3",
        title: "Vast Response Network",
        handle: "riyasharma",
        length: "7:36",
        reach: "46,108 views",
        accent: "linear-gradient(135deg, #a78bfa, #f472b6)"
      }
    ],
    collections: [
      {
        id: "collection-1",
        title: "Relief Planning Board",
        subtitle: "Operations reference",
        accent: "linear-gradient(135deg, #6d5efc, #1fb6ff)"
      },
      {
        id: "collection-2",
        title: "Volunteer Toolkit",
        subtitle: "Training resources",
        accent: "linear-gradient(135deg, #fde68a, #f59e0b)"
      },
      {
        id: "collection-3",
        title: "Outreach Templates",
        subtitle: "Campaign support",
        accent: "linear-gradient(135deg, #4338ca, #f472b6)"
      },
      {
        id: "collection-4",
        title: "Community Playbook",
        subtitle: "Local activation guide",
        accent: "linear-gradient(135deg, #0f766e, #60a5fa)"
      },
      {
        id: "collection-5",
        title: "Partner Directory",
        subtitle: "NGO and campus network",
        accent: "linear-gradient(135deg, #065f46, #22c55e)"
      },
      {
        id: "collection-6",
        title: "Volunteer Stories",
        subtitle: "Community highlights",
        accent: "linear-gradient(135deg, #fca5a5, #f97316)"
      }
    ],
    collaborations: [
      {
        id: "col-1",
        title: "Monsoon Relief Sprint",
        subtitle: "Lead Volunteer Coordinator",
        meta: "14 volunteers confirmed",
        status: "Active",
        accent: "linear-gradient(135deg, #8b5cf6, #4f46e5)"
      },
      {
        id: "col-2",
        title: "Teach Forward",
        subtitle: "Mentor Scheduling Lead",
        meta: "Finished 2 weeks ago",
        status: "Complete",
        accent: "linear-gradient(135deg, #14b8a6, #22c55e)"
      },
      {
        id: "col-3",
        title: "Health Camp Drive",
        subtitle: "Check-In Operations",
        meta: "Starts this Sunday",
        status: "Upcoming",
        accent: "linear-gradient(135deg, #f97316, #ef4444)"
      }
    ],
    supportLinks: ["Settings", "Privacy", "Help & Support"]
  }
};
