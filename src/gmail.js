// ─────────────────────────────────────────────────────────
//  Gmail API helper  — pure fetch, no SDK required
// ─────────────────────────────────────────────────────────

const GMAIL_BASE  = "https://gmail.googleapis.com/gmail/v1/users/me";
const TOKEN_URL   = "https://oauth2.googleapis.com/token";
const AUTH_URL    = "https://accounts.google.com/o/oauth2/v2/auth";
const USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.compose",
  "https://www.googleapis.com/auth/userinfo.email",
].join(" ");

// ── OAuth URLs & token exchange ────────────────────────────────────────────

export function getAuthUrl(state) {
  const params = new URLSearchParams({
    client_id:     process.env.GOOGLE_CLIENT_ID     || "",
    redirect_uri:  process.env.GOOGLE_REDIRECT_URI  || "",
    response_type: "code",
    scope:         SCOPES,
    access_type:   "offline",
    prompt:        "consent",   // force refresh_token on every connect
    state,
  });
  return `${AUTH_URL}?${params}`;
}

export async function exchangeCode(code) {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id:     process.env.GOOGLE_CLIENT_ID     || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirect_uri:  process.env.GOOGLE_REDIRECT_URI  || "",
      grant_type:    "authorization_code",
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.error || "Token exchange failed");
  return data;
}

export async function refreshToken(refreshTokenStr) {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token:  refreshTokenStr,
      client_id:      process.env.GOOGLE_CLIENT_ID     || "",
      client_secret:  process.env.GOOGLE_CLIENT_SECRET || "",
      grant_type:     "refresh_token",
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.error || "Token refresh failed");
  return data;
}

export async function getGoogleUserInfo(accessToken) {
  const res = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Failed to fetch Google user info");
  return res.json();
}

// ── Token validity helper ──────────────────────────────────────────────────
// Returns a valid access token, refreshing if needed.
// updateFn is called with { accessToken, expiresAt } when refreshed.
export async function getValidAccessToken(integration, updateFn) {
  const expiresAt = integration.expiresAt ? new Date(integration.expiresAt) : null;
  const isExpired = !expiresAt || expiresAt < new Date(Date.now() + 60_000);

  if (!isExpired) return integration.accessToken;

  // Refresh
  const tokens = await refreshToken(integration.refreshToken);
  const newExpiry = new Date(Date.now() + tokens.expires_in * 1000);
  await updateFn({ accessToken: tokens.access_token, expiresAt: newExpiry });
  return tokens.access_token;
}

// ── Gmail API calls ────────────────────────────────────────────────────────

async function gmailFetch(accessToken, path, opts = {}) {
  const res = await fetch(`${GMAIL_BASE}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gmail API error ${res.status}`);
  }
  return res.json();
}

// List messages from inbox
export async function listMessages(accessToken, { maxResults = 20, q = "" } = {}) {
  const params = new URLSearchParams({
    maxResults: String(maxResults),
    labelIds: "INBOX",
  });
  if (q) params.set("q", q);
  const data = await gmailFetch(accessToken, `/messages?${params}`);
  return data.messages || [];
}

// Get message metadata (fast)
export async function getMessageMeta(accessToken, messageId) {
  const msg = await gmailFetch(accessToken, `/messages/${messageId}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Date`);
  const headers = msg.payload?.headers || [];
  const h = (name) => headers.find(x => x.name.toLowerCase() === name.toLowerCase())?.value || "";
  return {
    id:       msg.id,
    threadId: msg.threadId,
    subject:  h("Subject") || "(no subject)",
    from:     h("From"),
    to:       h("To"),
    date:     h("Date"),
    snippet:  msg.snippet || "",
    isUnread: (msg.labelIds || []).includes("UNREAD"),
    labelIds: msg.labelIds || [],
  };
}

// Get full message with body (slower but includes text)
export async function getMessageFull(accessToken, messageId) {
  const msg = await gmailFetch(accessToken, `/messages/${messageId}?format=full`);
  const headers = msg.payload?.headers || [];
  const h = (name) => headers.find(x => x.name.toLowerCase() === name.toLowerCase())?.value || "";

  // Recursively extract plain text body
  let bodyText = "";
  const extractBody = (part) => {
    if (!part) return;
    if (part.mimeType === "text/plain" && part.body?.data) {
      bodyText = Buffer.from(part.body.data, "base64url").toString("utf-8");
    } else if (part.parts?.length) {
      part.parts.forEach(extractBody);
    }
  };
  extractBody(msg.payload);

  return {
    id:       msg.id,
    threadId: msg.threadId,
    subject:  h("Subject") || "(no subject)",
    from:     h("From"),
    to:       h("To"),
    date:     h("Date"),
    snippet:  msg.snippet || "",
    body:     bodyText || msg.snippet || "",
    isUnread: (msg.labelIds || []).includes("UNREAD"),
  };
}

// Get inbox — list + metadata for each message
export async function getInbox(accessToken, maxResults = 20) {
  const messages = await listMessages(accessToken, { maxResults });
  if (!messages.length) return [];
  const details = await Promise.all(messages.map(m => getMessageMeta(accessToken, m.id)));
  return details;
}

// Send an email
export async function sendEmail(accessToken, { to, subject, body, replyToMsgId, threadId } = {}) {
  const headerLines = [
    `To: ${to}`,
    `Subject: ${subject}`,
    "Content-Type: text/plain; charset=utf-8",
    "MIME-Version: 1.0",
  ];
  if (replyToMsgId) headerLines.push(`In-Reply-To: ${replyToMsgId}`);

  const rawEmail = [...headerLines, "", body].join("\r\n");
  const encoded  = Buffer.from(rawEmail).toString("base64url");

  const payload = { raw: encoded };
  if (threadId) payload.threadId = threadId;

  return gmailFetch(accessToken, "/messages/send", {
    method: "POST",
    body:   JSON.stringify(payload),
  });
}

// Create a draft (doesn't send)
export async function createDraft(accessToken, { to, subject, body } = {}) {
  const headerLines = [
    `To: ${to}`,
    `Subject: ${subject}`,
    "Content-Type: text/plain; charset=utf-8",
    "MIME-Version: 1.0",
  ];
  const rawEmail = [...headerLines, "", body].join("\r\n");
  const encoded  = Buffer.from(rawEmail).toString("base64url");

  return gmailFetch(accessToken, "/drafts", {
    method: "POST",
    body:   JSON.stringify({ message: { raw: encoded } }),
  });
}

// Format inbox as readable text for AI context
export function inboxToText(emails) {
  return emails.slice(0, 10).map((e, i) =>
    `[${i + 1}] From: ${e.from}\nSubject: ${e.subject}\nDate: ${e.date}\nPreview: ${e.snippet}`
  ).join("\n\n");
}
