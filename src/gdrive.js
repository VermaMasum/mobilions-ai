// ─────────────────────────────────────────────────────────
//  Google Drive API helper — pure fetch, no SDK
// ─────────────────────────────────────────────────────────

const DRIVE_BASE    = "https://www.googleapis.com/drive/v3";
const UPLOAD_BASE   = "https://www.googleapis.com/upload/drive/v3";
const TOKEN_URL     = "https://oauth2.googleapis.com/token";
const AUTH_URL      = "https://accounts.google.com/o/oauth2/v2/auth";
const USERINFO_URL  = "https://www.googleapis.com/oauth2/v2/userinfo";

const SCOPES = [
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/userinfo.email",
].join(" ");

// ── OAuth ──────────────────────────────────────────────────────────────────

export function getAuthUrl(state) {
  const params = new URLSearchParams({
    client_id:     process.env.GOOGLE_CLIENT_ID          || "",
    redirect_uri:  process.env.GOOGLE_GDRIVE_REDIRECT_URI || "",
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
      client_id:     process.env.GOOGLE_CLIENT_ID          || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET       || "",
      redirect_uri:  process.env.GOOGLE_GDRIVE_REDIRECT_URI || "",
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

// ── Drive API ──────────────────────────────────────────────────────────────

async function driveFetch(accessToken, path, opts = {}) {
  const res = await fetch(`${DRIVE_BASE}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Drive API error ${res.status}`);
  }
  return res.json();
}

const FILE_FIELDS = "id,name,mimeType,size,modifiedTime,createdTime,webViewLink,iconLink,owners,shared,parents,description,thumbnailLink";

// List recent files
export async function listFiles(accessToken, { maxResults = 30, query = "", pageToken = "" } = {}) {
  const q = query
    ? `fullText contains '${query.replace(/'/g, "\\'")}' and trashed=false`
    : "trashed=false";

  const params = new URLSearchParams({
    pageSize: String(maxResults),
    orderBy:  "modifiedTime desc",
    fields:   `nextPageToken,files(${FILE_FIELDS})`,
    q,
  });
  if (pageToken) params.set("pageToken", pageToken);

  const data = await driveFetch(accessToken, `/files?${params}`);
  return { files: data.files || [], nextPageToken: data.nextPageToken || null };
}

// Get single file metadata
export async function getFile(accessToken, fileId) {
  return driveFetch(accessToken, `/files/${fileId}?fields=${FILE_FIELDS}`);
}

// Export Google Workspace files (Docs, Sheets, Slides) as plain text
export async function exportFileAsText(accessToken, fileId, mimeType) {
  const exportMime = getExportMime(mimeType);
  if (!exportMime) return null;

  const res = await fetch(`${DRIVE_BASE}/files/${fileId}/export?mimeType=${encodeURIComponent(exportMime)}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  const text = await res.text();
  return text.slice(0, 5000); // cap at 5k chars for AI context
}

// Download raw file content (for plain text files)
export async function downloadFile(accessToken, fileId) {
  const res = await fetch(`${DRIVE_BASE}/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  const text = await res.text();
  return text.slice(0, 5000);
}

function getExportMime(mimeType) {
  const map = {
    "application/vnd.google-apps.document":     "text/plain",
    "application/vnd.google-apps.spreadsheet":  "text/csv",
    "application/vnd.google-apps.presentation": "text/plain",
    "application/vnd.google-apps.drawing":      "image/svg+xml",
  };
  return map[mimeType] || null;
}

// Format file list as readable text for AI context
export function filesToText(files) {
  if (!files.length) return "No files found.";
  return files.slice(0, 20).map((f, i) => {
    const size    = f.size ? `${Math.round(f.size / 1024)}KB` : "—";
    const modified = f.modifiedTime ? new Date(f.modifiedTime).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "?";
    return `[${i + 1}] ${f.name}
  Type: ${friendlyType(f.mimeType)}  Size: ${size}  Modified: ${modified}
  Link: ${f.webViewLink || "—"}`.trim();
  }).join("\n\n");
}

export function friendlyType(mimeType = "") {
  if (mimeType.includes("google-apps.document"))     return "Google Doc";
  if (mimeType.includes("google-apps.spreadsheet"))  return "Google Sheet";
  if (mimeType.includes("google-apps.presentation")) return "Google Slides";
  if (mimeType.includes("google-apps.folder"))       return "Folder";
  if (mimeType.includes("google-apps.form"))         return "Google Form";
  if (mimeType.includes("pdf"))                      return "PDF";
  if (mimeType.includes("image"))                    return "Image";
  if (mimeType.includes("video"))                    return "Video";
  if (mimeType.includes("audio"))                    return "Audio";
  if (mimeType.includes("zip") || mimeType.includes("compressed")) return "Archive";
  if (mimeType.includes("text"))                     return "Text file";
  if (mimeType.includes("spreadsheet"))              return "Spreadsheet";
  if (mimeType.includes("wordprocessing"))           return "Document";
  return "File";
}
