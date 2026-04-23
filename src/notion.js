// ─────────────────────────────────────────────────────────
//  Notion API helper — pure fetch, no SDK
// ─────────────────────────────────────────────────────────

const NOTION_BASE    = "https://api.notion.com/v1";
const AUTH_URL       = "https://api.notion.com/v1/oauth/authorize";
const TOKEN_URL      = "https://api.notion.com/v1/oauth/token";
const NOTION_VERSION = "2022-06-28";

// ── OAuth ──────────────────────────────────────────────────────────────────

export function getAuthUrl(state) {
  const params = new URLSearchParams({
    client_id:     process.env.NOTION_CLIENT_ID     || "",
    redirect_uri:  process.env.NOTION_REDIRECT_URI  || "",
    response_type: "code",
    owner:         "user",
    state,
  });
  return `${AUTH_URL}?${params}`;
}

export async function exchangeCode(code) {
  const clientId     = process.env.NOTION_CLIENT_ID     || "";
  const clientSecret = process.env.NOTION_CLIENT_SECRET || "";
  const redirectUri  = process.env.NOTION_REDIRECT_URI  || "";

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ grant_type: "authorization_code", code, redirect_uri: redirectUri }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.error || "Token exchange failed");
  return data;
}

// Notion OAuth tokens don't expire — just return stored token
export function getAccessToken(integration) {
  return integration.accessToken;
}

// ── Notion API ─────────────────────────────────────────────────────────────

function notionHeaders(accessToken) {
  return {
    "Authorization":  `Bearer ${accessToken}`,
    "Content-Type":   "application/json",
    "Notion-Version": NOTION_VERSION,
  };
}

async function notionFetch(accessToken, path, opts = {}) {
  const res = await fetch(`${NOTION_BASE}${path}`, {
    ...opts,
    headers: { ...notionHeaders(accessToken), ...(opts.headers || {}) },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || `Notion API error ${res.status}`);
  }
  return res.json();
}

// Get current user / workspace info
export async function getNotionUser(accessToken) {
  return notionFetch(accessToken, "/users/me");
}

// Search pages and databases
export async function searchPages(accessToken, query = "", filter = "page") {
  const body = {
    page_size: 30,
    filter: { value: filter, property: "object" },
  };
  if (query) body.query = query;
  const data = await notionFetch(accessToken, "/search", { method: "POST", body: JSON.stringify(body) });
  return data.results || [];
}

// Search both pages and databases
export async function searchAll(accessToken, query = "") {
  const body = { page_size: 30 };
  if (query) body.query = query;
  const data = await notionFetch(accessToken, "/search", { method: "POST", body: JSON.stringify(body) });
  return data.results || [];
}

// Get a single page's metadata
export async function getPage(accessToken, pageId) {
  return notionFetch(accessToken, `/pages/${pageId}`);
}

// Get page block children (content)
export async function getPageBlocks(accessToken, blockId) {
  const data = await notionFetch(accessToken, `/blocks/${blockId}/children?page_size=50`);
  return data.results || [];
}

function extractNotionId(input) {
  if (!input) return null;
  const uuidMatch = input.match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i);
  if (uuidMatch) return uuidMatch[0];
  const hexMatch = input.match(/[a-f0-9]{32}/i);
  if (hexMatch) {
    const h = hexMatch[0];
    return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
  }
  return null;
}

// Create a new page
export async function createPage(accessToken, { parentPageId, parentDatabaseId, title, content = "" }) {
  const cleanPageId = extractNotionId(parentPageId);
  const cleanDbId   = extractNotionId(parentDatabaseId);

  let parent;
  if (cleanDbId)   parent = { database_id: cleanDbId };
  else if (cleanPageId) parent = { page_id: cleanPageId };
  else             parent = { workspace: true };

  const body = {
    parent,
    properties: {
      title: {
        title: [{ type: "text", text: { content: title || "Untitled" } }],
      },
    },
  };

  if (content) {
    body.children = content.split("\n\n").filter(Boolean).map(para => ({
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [{ type: "text", text: { content: para.slice(0, 2000) } }],
      },
    }));
  }

  return notionFetch(accessToken, "/pages", { method: "POST", body: JSON.stringify(body) });
}

// Query a database
export async function queryDatabase(accessToken, databaseId, { pageSize = 20 } = {}) {
  const data = await notionFetch(accessToken, `/databases/${databaseId}/query`, {
    method: "POST",
    body: JSON.stringify({ page_size: pageSize }),
  });
  return data.results || [];
}

// Get database schema (properties)
export async function getDatabase(accessToken, databaseId) {
  const id = extractNotionId(databaseId) || databaseId;
  return notionFetch(accessToken, `/databases/${id}`);
}

// Create a ticket/entry in a database with flexible property mapping
export async function createTicket(accessToken, databaseId, { title, status, priority, dueDate, description } = {}) {
  const dbId = extractNotionId(databaseId) || databaseId;

  // Fetch schema to find correct property names & types
  const db = await getDatabase(accessToken, dbId);
  const props = db.properties || {};

  // Find title property (type === "title")
  const titleKey = Object.keys(props).find(k => props[k].type === "title") || "Name";

  // Find status property (type === "status" or "select" with status-like name)
  const statusKey = Object.keys(props).find(k =>
    props[k].type === "status" || (props[k].type === "select" && /status/i.test(k))
  );

  // Find priority property (type === "select" with priority-like name)
  const priorityKey = Object.keys(props).find(k =>
    props[k].type === "select" && /priority/i.test(k)
  );

  // Find date property
  const dateKey = Object.keys(props).find(k => props[k].type === "date");

  // Build properties object
  const properties = {
    [titleKey]: { title: [{ text: { content: title || "Untitled" } }] },
  };

  if (status && statusKey) {
    const type = props[statusKey].type;
    properties[statusKey] = type === "status"
      ? { status: { name: status } }
      : { select: { name: status } };
  }

  if (priority && priorityKey) {
    properties[priorityKey] = { select: { name: priority } };
  }

  if (dueDate && dateKey) {
    properties[dateKey] = { date: { start: dueDate } };
  }

  const body = {
    parent:     { database_id: dbId },
    properties,
  };

  if (description) {
    body.children = [{
      object: "block", type: "paragraph",
      paragraph: { rich_text: [{ type: "text", text: { content: description.slice(0, 2000) } }] },
    }];
  }

  return notionFetch(accessToken, "/pages", { method: "POST", body: JSON.stringify(body) });
}

// ── Formatters ─────────────────────────────────────────────────────────────

export function getPageTitle(page) {
  if (!page?.properties) return page?.title?.[0]?.plain_text || "(Untitled)";
  const titleProp = Object.values(page.properties).find(p => p.type === "title");
  return titleProp?.title?.map(t => t.plain_text).join("") || "(Untitled)";
}

export function getPageEmoji(page) {
  return page?.icon?.emoji || null;
}

export function formatLastEdited(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch { return iso; }
}

export function pagesToText(pages) {
  if (!pages.length) return "No pages found.";
  return pages.slice(0, 20).map((p, i) => {
    const title   = getPageTitle(p);
    const emoji   = getPageEmoji(p);
    const edited  = formatLastEdited(p.last_edited_time);
    const type    = p.object === "database" ? "Database" : "Page";
    return `[${i + 1}] ${emoji ? emoji + " " : ""}${title}
  Type: ${type}  Last edited: ${edited}
  ID: ${p.id}`.trim();
  }).join("\n\n");
}

export function blocksToText(blocks) {
  if (!blocks.length) return "";
  const lines = [];
  for (const block of blocks) {
    const text = extractRichText(block);
    if (text) lines.push(text);
  }
  return lines.join("\n").slice(0, 4000);
}

function extractRichText(block) {
  const type = block.type;
  const data = block[type];
  if (!data) return "";
  const rt = data.rich_text;
  if (!rt?.length) return "";
  const plain = rt.map(t => t.plain_text).join("");
  if (!plain) return "";
  if (type === "heading_1") return `# ${plain}`;
  if (type === "heading_2") return `## ${plain}`;
  if (type === "heading_3") return `### ${plain}`;
  if (type === "bulleted_list_item") return `• ${plain}`;
  if (type === "numbered_list_item") return `1. ${plain}`;
  if (type === "quote") return `> ${plain}`;
  if (type === "code") return `\`\`\`\n${plain}\n\`\`\``;
  return plain;
}
