// ─────────────────────────────────────────────────────────
//  Google Calendar API helper — pure fetch, no SDK
// ─────────────────────────────────────────────────────────

const CALENDAR_BASE = "https://www.googleapis.com/calendar/v3";
const TOKEN_URL     = "https://oauth2.googleapis.com/token";
const AUTH_URL      = "https://accounts.google.com/o/oauth2/v2/auth";
const USERINFO_URL  = "https://www.googleapis.com/oauth2/v2/userinfo";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/userinfo.email",
].join(" ");

// ── OAuth ──────────────────────────────────────────────────────────────────

export function getAuthUrl(state) {
  const params = new URLSearchParams({
    client_id:     process.env.GOOGLE_CLIENT_ID    || "",
    redirect_uri:  process.env.GOOGLE_GCAL_REDIRECT_URI || "",
    response_type: "code",
    scope:         SCOPES,
    access_type:   "offline",
    prompt:        "consent",
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
      client_id:     process.env.GOOGLE_CLIENT_ID    || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirect_uri:  process.env.GOOGLE_GCAL_REDIRECT_URI || "",
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
      client_id:      process.env.GOOGLE_CLIENT_ID    || "",
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
  if (!res.ok) throw new Error("Failed to fetch user info");
  return res.json();
}

export async function getValidAccessToken(integration, updateFn) {
  const expiresAt = integration.expiresAt ? new Date(integration.expiresAt) : null;
  const isExpired = !expiresAt || expiresAt < new Date(Date.now() + 60_000);
  if (!isExpired) return integration.accessToken;
  const tokens   = await refreshToken(integration.refreshToken);
  const newExpiry = new Date(Date.now() + tokens.expires_in * 1000);
  await updateFn({ accessToken: tokens.access_token, expiresAt: newExpiry });
  return tokens.access_token;
}

// ── Calendar API ───────────────────────────────────────────────────────────

async function gcalFetch(accessToken, path, opts = {}) {
  const res = await fetch(`${CALENDAR_BASE}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Calendar API error ${res.status}`);
  }
  return res.json();
}

// List user's calendars
export async function listCalendars(accessToken) {
  const data = await gcalFetch(accessToken, "/users/me/calendarList");
  return data.items || [];
}

// List upcoming events (default: primary calendar, next 30 days)
export async function listEvents(accessToken, {
  calendarId = "primary",
  maxResults = 20,
  timeMin,
  timeMax,
  q = "",
} = {}) {
  const now   = new Date();
  const later = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

  const params = new URLSearchParams({
    maxResults:   String(maxResults),
    orderBy:      "startTime",
    singleEvents: "true",
    timeMin:      (timeMin || now).toISOString(),
    timeMax:      (timeMax || later).toISOString(),
  });
  if (q) params.set("q", q);

  const data = await gcalFetch(accessToken, `/calendars/${encodeURIComponent(calendarId)}/events?${params}`);
  return data.items || [];
}

// Create an event
export async function createEvent(accessToken, {
  calendarId = "primary",
  summary,
  description = "",
  location = "",
  start,       // { dateTime: ISO string, timeZone }  OR  { date: "YYYY-MM-DD" }
  end,
  attendees = [],
} = {}) {
  const body = { summary, description, location, start, end };
  if (attendees.length) body.attendees = attendees.map(e => ({ email: e }));

  return gcalFetch(accessToken, `/calendars/${encodeURIComponent(calendarId)}/events`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// Update an event
export async function updateEvent(accessToken, calendarId = "primary", eventId, patch) {
  return gcalFetch(accessToken, `/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

// Delete an event
export async function deleteEvent(accessToken, calendarId = "primary", eventId) {
  const res = await fetch(`${CALENDAR_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok && res.status !== 204) throw new Error(`Delete failed: ${res.status}`);
  return { ok: true };
}

// Format events as readable text for AI context
export function eventsToText(events) {
  if (!events.length) return "No upcoming events in the next 30 days.";
  return events.slice(0, 15).map((e, i) => {
    const start = e.start?.dateTime || e.start?.date || "";
    const end   = e.end?.dateTime   || e.end?.date   || "";
    return `[${i + 1}] ${e.summary || "(no title)"}
  When: ${formatEventTime(start)} → ${formatEventTime(end)}
  ${e.location ? `Location: ${e.location}` : ""}
  ${e.description ? `Note: ${e.description.slice(0, 100)}` : ""}`.trim();
  }).join("\n\n");
}

function formatEventTime(iso) {
  if (!iso) return "?";
  try {
    if (iso.length === 10) return iso; // all-day date
    return new Date(iso).toLocaleString("en-US", {
      weekday: "short", month: "short", day: "numeric",
      hour: "numeric", minute: "2-digit", hour12: true,
    });
  } catch { return iso; }
}
