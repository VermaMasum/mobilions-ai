// ─────────────────────────────────────────────────────────
//  LinkedIn mock helper — demo data, no real API calls
// ─────────────────────────────────────────────────────────

export const MOCK_PROFILE = {
  name:        "Alex Johnson",
  headline:    "Senior Product Manager at TechCorp | SaaS | Growth | AI",
  location:    "San Francisco, CA",
  connections: 1842,
  followers:   2310,
  profileUrl:  "https://linkedin.com/in/alexjohnson",
  avatar:      "AJ",
  email:       "alex.johnson@techcorp.com",
};

export const MOCK_POSTS = [
  {
    id: "p1",
    text: "🚀 Excited to share that our team just shipped a major AI-powered feature that reduced customer support tickets by 40%!\n\nThe key insight? Instead of replacing humans, we used AI to give our support team superpowers. Here's what we learned:\n\n1. AI handles the repetitive 80% instantly\n2. Humans focus on complex, high-value cases\n3. Customer satisfaction scores went UP by 22%\n\nThe future of work isn't AI replacing people — it's AI making people extraordinary.\n\n#ProductManagement #AI #Growth #SaaS",
    likes: 847,
    comments: 63,
    shares: 112,
    date: "2025-04-18",
    impressions: 24300,
  },
  {
    id: "p2",
    text: "After 10 years in product, here's the one framework that never fails me:\n\nBefore building ANYTHING, answer these 3 questions:\n✅ Who has this problem?\n✅ How painful is it (1-10)?\n✅ Will they pay to fix it?\n\nIf you can't answer all 3 with data — you're building on assumptions.\n\nSaved our team from 3 wrong pivots last quarter alone.\n\n#ProductStrategy #StartupTips #BuildInPublic",
    likes: 1203,
    comments: 89,
    shares: 241,
    date: "2025-04-12",
    impressions: 41800,
  },
  {
    id: "p3",
    text: "Hot take: Most product roadmaps are fiction.\n\nThey're written to make stakeholders feel good, not to ship value to customers.\n\nWhat actually works:\n→ Outcomes over features\n→ Rolling 6-week cycles instead of annual plans\n→ Kill meetings that don't drive decisions\n\nWe cut our roadmap to 3 outcomes this quarter. Shipped more than ever.\n\nAgreee? Drop a 🔥 below.\n\n#ProductManagement #Agile #Leadership",
    likes: 512,
    comments: 44,
    shares: 78,
    date: "2025-04-05",
    impressions: 18600,
  },
  {
    id: "p4",
    text: "Just hit 1,800 connections here on LinkedIn 🎉\n\nTo everyone who has shared advice, opportunities, and perspectives over the years — thank you.\n\nIf you're a PM, designer, or founder and want to connect — my DMs are open. Always happy to chat about product, AI, and building things people love.\n\n#Grateful #ProductCommunity",
    likes: 329,
    comments: 127,
    shares: 12,
    date: "2025-03-28",
    impressions: 9400,
  },
];

export const MOCK_ANALYTICS = {
  profileViews:    284,
  searchAppearances: 1037,
  postImpressions: 94100,
  followerGrowth:  "+127 this month",
};

// ── Formatters ─────────────────────────────────────────────────────────────

export function profileToText(profile) {
  return `LinkedIn Profile: ${profile.name}
Headline: ${profile.headline}
Location: ${profile.location}
Connections: ${profile.connections.toLocaleString()}
Followers: ${profile.followers.toLocaleString()}`;
}

export function postsToText(posts) {
  return posts.map((p, i) => {
    return `[Post ${i + 1}] ${new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
${p.text.slice(0, 200)}…
Likes: ${p.likes} · Comments: ${p.comments} · Shares: ${p.shares} · Impressions: ${p.impressions.toLocaleString()}`;
  }).join("\n\n");
}

export function analyticsToText(a) {
  return `Profile Views (last 90 days): ${a.profileViews}
Search Appearances: ${a.searchAppearances}
Total Post Impressions: ${a.postImpressions.toLocaleString()}
Follower Growth: ${a.followerGrowth}`;
}
