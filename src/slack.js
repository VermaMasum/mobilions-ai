// ─────────────────────────────────────────────────────────
//  Slack API helper — pure fetch, no SDK
// ─────────────────────────────────────────────────────────

const SLACK_API   = "https://slack.com/api";
const AUTH_URL    = "https://slack.com/oauth/v2/authorize";
const TOKEN_URL   = "https://slack.com/api/oauth.v2.access";

// User-level scopes for reading/writing
const USER_SCOPES = [
  "channels:read",
  "channels:history",
  "groups:read",
  "groups:history",
  "chat:write",
  "users:read",
].join(",");

// ── OAuth ──────────────────────────────────────────────────────────────────

export function getAuthUrl(state) {
  const params = new URLSearchParams({
    client_id:    process.env.SLACK_CLIENT_ID    || "",
    redirect_uri: process.env.SLACK_REDIRECT_URI || "",
    user_scope:   USER_SCOPES,
    state,
  });
  return `${AUTH_URL}?${params}`;
}

export async function exchangeCode(code) {
  const clientId     = process.env.SLACK_CLIENT_ID     || "";
  const clientSecret = process.env.SLACK_CLIENT_SECRET || "";
  const redirectUri  = process.env.SLACK_REDIRECT_URI  || "";

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type":  "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ code, redirect_uri: redirectUri }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Token exchange failed");
  return data;
}

// Slack tokens don't expire — return stored token
export function getAccessToken(integration) {
  return integration.accessToken;
}

// ── Slack API ──────────────────────────────────────────────────────────────

async function slackGet(token, method, params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${SLACK_API}/${method}${qs ? "?" + qs : ""}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || `Slack API error: ${method}`);
  return data;
}

async function slackPost(token, method, body = {}) {
  const res = await fetch(`${SLACK_API}/${method}`, {
    method:  "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || `Slack API error: ${method}`);
  return data;
}

// Verify token + get workspace/user info
export async function authTest(token) {
  return slackGet(token, "auth.test");
}

// List channels (public + private the user is in)
export async function listChannels(token, { limit = 30 } = {}) {
  const data = await slackGet(token, "conversations.list", {
    types: "public_channel,private_channel",
    exclude_archived: "true",
    limit: String(limit),
  });
  return data.channels || [];
}

// Get recent messages from a channel
export async function getMessages(token, channelId, { limit = 20 } = {}) {
  const data = await slackGet(token, "conversations.history", {
    channel: channelId,
    limit:   String(limit),
  });
  return data.messages || [];
}

// Send a message
export async function sendMessage(token, channelId, text) {
  return slackPost(token, "chat.postMessage", { channel: channelId, text });
}

// Get user display name
export async function getUserName(token, userId) {
  try {
    const data = await slackGet(token, "users.info", { user: userId });
    return data.user?.real_name || data.user?.name || userId;
  } catch {
    return userId;
  }
}

// ── Formatters ─────────────────────────────────────────────────────────────

export function channelDisplayName(ch) {
  return ch.is_im ? "DM" : `#${ch.name}`;
}

export function formatTs(ts) {
  if (!ts) return "";
  try {
    return new Date(parseFloat(ts) * 1000).toLocaleString("en-US", {
      month: "short", day: "numeric",
      hour: "numeric", minute: "2-digit", hour12: true,
    });
  } catch { return ""; }
}

export function messagesToText(messages, channelName = "") {
  if (!messages.length) return "No recent messages.";
  const header = channelName ? `Recent messages in ${channelName}:\n` : "";
  return header + messages.slice(0, 15).map((m, i) => {
    const time = formatTs(m.ts);
    const user = m.user || "bot";
    return `[${i + 1}] <${user}> ${m.text || "(no text)"}  (${time})`;
  }).join("\n");
}
