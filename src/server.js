import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { AGENTS, AGENT_LIST } from "./agents.js";
import { POWERUPS, POWERUPS_MAP } from "./powerups.js";
import {
  createUser, findUserByEmail, findUserById,
  getOrCreateConversation, getConversation,
  appendMessages, clearConversation, getUserConversations,
  getBrainEntries, addBrainEntry, deleteBrainEntry, getBrainContext,
  getIntegration, upsertIntegration, updateIntegrationTokens,
  deleteIntegration, getUserIntegrations,
} from "./db.js";
import {
  getAuthUrl, exchangeCode, getGoogleUserInfo, getValidAccessToken,
  getInbox, getMessageFull, sendEmail, createDraft, inboxToText,
} from "./gmail.js";
import {
  getAuthUrl as gcalGetAuthUrl,
  exchangeCode as gcalExchangeCode,
  getGoogleUserInfo as gcalGetUserInfo,
  getValidAccessToken as gcalGetValidToken,
  listEvents, createEvent, deleteEvent, eventsToText,
} from "./gcal.js";
import {
  getAuthUrl as gdriveGetAuthUrl,
  exchangeCode as gdriveExchangeCode,
  getGoogleUserInfo as gdriveGetUserInfo,
  getValidAccessToken as gdriveGetValidToken,
  listFiles, getFile, exportFileAsText, downloadFile, filesToText, friendlyType,
} from "./gdrive.js";
import {
  getAuthUrl as slackGetAuthUrl,
  exchangeCode as slackExchangeCode,
  getAccessToken as slackGetAccessToken,
  authTest as slackAuthTest,
  listChannels, getMessages, sendMessage, getUserName,
  channelDisplayName, formatTs, messagesToText,
} from "./slack.js";
import {
  getAuthUrl as notionGetAuthUrl,
  exchangeCode as notionExchangeCode,
  getAccessToken as notionGetAccessToken,
  getNotionUser,
  searchAll, searchPages, getPage, getPageBlocks, createPage,
  getDatabase, createTicket, queryDatabase,
  getPageTitle, getPageEmoji, formatLastEdited, pagesToText, blocksToText,
} from "./notion.js";
import {
  MOCK_PROFILE, MOCK_POSTS, MOCK_ANALYTICS,
  profileToText, postsToText, analyticsToText,
} from "./linkedin.js";

const scryptAsync = promisify(scrypt);
const __dirname   = resolve(fileURLToPath(import.meta.url), "..");
const rootDir     = resolve(__dirname, "..");
const publicDir   = resolve(rootDir, "public");

await loadEnvFile(resolve(rootDir, ".env"));

const aiBaseUrl = process.env.AI_BASE_URL || "https://api.groq.com/openai/v1";
const aiModel   = process.env.AI_MODEL    || "llama-3.3-70b-versatile";
const aiApiKey  = process.env.AI_API_KEY  || "";
const jwtSecret = process.env.JWT_SECRET  || "mobilions-dev-secret-change-me";
const port      = Number(process.env.PORT || 4000);

// ──────────────────────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

  try {
    // ── Auth routes ────────────────────────────────────────────────────────
    if (req.method === "POST" && url.pathname === "/api/auth/signup") {
      const { name, email, password } = await readJsonBody(req);
      if (!email || !password) return sendJson(res, 400, { error: "Email and password required" });
      if (String(password).length < 6) return sendJson(res, 400, { error: "Password must be at least 6 characters" });
      const passwordHash = await hashPassword(String(password));
      let user;
      try { user = await createUser({ name: String(name || ""), email: String(email).trim(), passwordHash }); }
      catch (err) { return sendJson(res, 409, { error: err.message }); }
      return sendJson(res, 201, { user: safeUser(user), token: signToken({ userId: user.id }) });
    }

    if (req.method === "POST" && url.pathname === "/api/auth/login") {
      const { email, password } = await readJsonBody(req);
      if (!email || !password) return sendJson(res, 400, { error: "Email and password required" });
      const user = await findUserByEmail(String(email).trim());
      if (!user || !(await verifyPassword(String(password), user.passwordHash)))
        return sendJson(res, 401, { error: "Invalid email or password" });
      return sendJson(res, 200, { user: safeUser(user), token: signToken({ userId: user.id }) });
    }

    if (req.method === "GET" && url.pathname === "/api/auth/me") {
      const user = await requireAuth(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });
      return sendJson(res, 200, { user: safeUser(user) });
    }

    // ── Agent routes ───────────────────────────────────────────────────────
    if (req.method === "GET" && url.pathname === "/api/agents") {
      return sendJson(res, 200, { agents: AGENT_LIST.map(publicAgent) });
    }

    const agentByIdMatch = url.pathname.match(/^\/api\/agents\/([^/]+)$/);
    if (req.method === "GET" && agentByIdMatch) {
      const agent = AGENTS[agentByIdMatch[1]];
      if (!agent) return sendJson(res, 404, { error: "Agent not found" });
      return sendJson(res, 200, { agent: publicAgent(agent) });
    }

    // ── Power-Ups routes ───────────────────────────────────────────────────
    if (req.method === "GET" && url.pathname === "/api/powerups") {
      return sendJson(res, 200, { powerups: POWERUPS.map(p => {
        const { buildPrompt, ...pub } = p;
        return pub;
      })});
    }

    const powerupByIdMatch = url.pathname.match(/^\/api\/powerups\/([^/]+)$/);
    if (req.method === "GET" && powerupByIdMatch) {
      const pu = POWERUPS_MAP[powerupByIdMatch[1]];
      if (!pu) return sendJson(res, 404, { error: "Power-up not found" });
      const { buildPrompt, ...pub } = pu;
      return sendJson(res, 200, { powerup: pub });
    }

    const powerupRunMatch = url.pathname.match(/^\/api\/powerups\/([^/]+)\/run$/);
    if (req.method === "POST" && powerupRunMatch) {
      const user = await requireAuth(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });

      const pu = POWERUPS_MAP[powerupRunMatch[1]];
      if (!pu) return sendJson(res, 404, { error: "Power-up not found" });

      if (!aiApiKey) return sendJson(res, 503, { error: "AI not configured — set AI_API_KEY in .env" });

      const fields = await readJsonBody(req);
      const agent = AGENTS[pu.agentId];
      if (!agent) return sendJson(res, 500, { error: "Agent not found for this power-up" });

      const brainContext = await getBrainContext(user.id);
      const userPrompt = pu.buildPrompt(fields);
      const systemContent = brainContext
        ? `${agent.systemPrompt}\n\nBrain AI Context (your business knowledge):\n${brainContext}`
        : agent.systemPrompt;

      const messages = [
        { role: "system", content: systemContent },
        { role: "user", content: userPrompt },
      ];

      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*",
      });

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 60000);

        const aiRes = await fetch(`${aiBaseUrl}/chat/completions`, {
          method: "POST",
          headers: { Authorization: `Bearer ${aiApiKey}`, "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({ model: aiModel, messages, stream: true, temperature: 0.7, max_tokens: 2000 }),
        }).finally(() => clearTimeout(timeout));

        if (!aiRes.ok) {
          res.write(`data: ${JSON.stringify({ error: `AI error: ${aiRes.status}` })}\n\n`);
          res.end(); return;
        }

        const reader = aiRes.body.getReader();
        const decoder = new TextDecoder();
        let lineBuffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          lineBuffer += decoder.decode(value, { stream: true });
          const lines = lineBuffer.split("\n");
          lineBuffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data: ")) continue;
            const data = trimmed.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content ?? "";
              if (delta) res.write(`data: ${JSON.stringify({ delta })}\n\n`);
            } catch { /* ignore */ }
          }
        }
        reader.releaseLock();
      } catch (err) {
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      }

      res.write("data: [DONE]\n\n");
      res.end();
      return;
    }

    // ── Brain AI routes ────────────────────────────────────────────────────
    if (req.method === "GET" && url.pathname === "/api/brain") {
      const user = await requireAuth(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });
      const entries = await getBrainEntries(user.id);
      return sendJson(res, 200, { entries });
    }

    if (req.method === "POST" && url.pathname === "/api/brain") {
      const user = await requireAuth(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });
      const { title, content, type, source } = await readJsonBody(req);
      if (!title || !content) return sendJson(res, 400, { error: "Title and content required" });
      const entry = await addBrainEntry(user.id, { title, content, type, source });
      return sendJson(res, 201, { entry });
    }

    const brainEntryMatch = url.pathname.match(/^\/api\/brain\/([^/]+)$/);
    if (req.method === "DELETE" && brainEntryMatch) {
      const user = await requireAuth(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });
      await deleteBrainEntry(user.id, brainEntryMatch[1]);
      return sendJson(res, 200, { ok: true });
    }

    // ── Chat — streaming SSE ───────────────────────────────────────────────
    const chatMatch = url.pathname.match(/^\/api\/chat\/([^/]+)$/);
    if (req.method === "POST" && chatMatch) {
      const user = await requireAuth(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });

      const agentId = chatMatch[1];
      const agent = AGENTS[agentId];
      if (!agent) return sendJson(res, 404, { error: "Agent not found" });

      const { message } = await readJsonBody(req);
      if (!String(message || "").trim()) return sendJson(res, 400, { error: "Message required" });
      const userMessage = String(message).trim();

      if (!aiApiKey) return sendJson(res, 503, { error: "AI not configured — set AI_API_KEY in .env" });

      // Get history (last 20 messages = 10 exchanges)
      const conv = await getOrCreateConversation(user.id, agentId);
      const history = (Array.isArray(conv.messages) ? conv.messages : []).slice(-20);

      // Inject brain context into system prompt
      const brainContext = await getBrainContext(user.id);
      const systemContent = brainContext
        ? `${agent.systemPrompt}\n\nBrain AI Context (your business knowledge):\n${brainContext}`
        : agent.systemPrompt;

      const messages = [
        { role: "system", content: systemContent },
        ...history.map(m => ({ role: m.role, content: m.content })),
        { role: "user", content: userMessage },
      ];

      // Stream response via SSE
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*",
      });

      let fullContent = "";
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);

        const aiRes = await fetch(`${aiBaseUrl}/chat/completions`, {
          method: "POST",
          headers: { Authorization: `Bearer ${aiApiKey}`, "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({ model: aiModel, messages, stream: true, temperature: 0.7, max_tokens: 1200 }),
        }).finally(() => clearTimeout(timeout));

        if (!aiRes.ok) {
          const errText = await aiRes.text();
          res.write(`data: ${JSON.stringify({ error: `AI error: ${aiRes.status}` })}\n\n`);
          res.end();
          return;
        }

        const reader = aiRes.body.getReader();
        const decoder = new TextDecoder();
        let lineBuffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          lineBuffer += decoder.decode(value, { stream: true });
          const lines = lineBuffer.split("\n");
          lineBuffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data: ")) continue;
            const data = trimmed.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content ?? "";
              if (delta) {
                fullContent += delta;
                res.write(`data: ${JSON.stringify({ delta })}\n\n`);
              }
            } catch { /* ignore parse errors */ }
          }
        }
        reader.releaseLock();
      } catch (err) {
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      }

      // Save exchange to DB
      if (fullContent) {
        await appendMessages(user.id, agentId, [
          { role: "user",      content: userMessage,  timestamp: new Date().toISOString() },
          { role: "assistant", content: fullContent,   timestamp: new Date().toISOString() },
        ]);
      }

      res.write("data: [DONE]\n\n");
      res.end();
      return;
    }

    // ── Conversation history ───────────────────────────────────────────────
    const historyMatch = url.pathname.match(/^\/api\/chat\/([^/]+)\/history$/);

    if (req.method === "GET" && historyMatch) {
      const user = await requireAuth(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });
      const agentId = historyMatch[1];
      const conv = await getConversation(user.id, agentId);
      return sendJson(res, 200, { messages: Array.isArray(conv?.messages) ? conv.messages : [] });
    }

    if (req.method === "DELETE" && historyMatch) {
      const user = await requireAuth(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });
      await clearConversation(user.id, historyMatch[1]);
      return sendJson(res, 200, { ok: true });
    }

    // ── All conversations summary ──────────────────────────────────────────
    if (req.method === "GET" && url.pathname === "/api/conversations") {
      const user = await requireAuth(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });
      const convs = await getUserConversations(user.id);
      const summary = convs.map(c => {
        const msgs = Array.isArray(c.messages) ? c.messages : [];
        const last = msgs[msgs.length - 1];
        return {
          agentId: c.agentId,
          messageCount: msgs.length,
          lastMessage: last ? { role: last.role, content: String(last.content || "").slice(0, 100), timestamp: last.timestamp } : null,
          updatedAt: c.updatedAt,
        };
      });
      return sendJson(res, 200, { conversations: summary });
    }

    // ── Integrations: list connected ──────────────────────────────────────
    if (req.method === "GET" && url.pathname === "/api/integrations") {
      const user = await requireAuth(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });
      const integrations = await getUserIntegrations(user.id);
      return sendJson(res, 200, { integrations });
    }

    // ── Gmail: start OAuth ─────────────────────────────────────────────────
    if (req.method === "GET" && url.pathname === "/api/integrations/gmail/connect") {
      // Accept token from query param (browser redirect) or Authorization header
      const qToken = url.searchParams.get("token");
      const user = qToken
        ? await (async () => { const p = verifyToken(qToken); return p?.userId ? findUserById(p.userId) : null; })()
        : await requireAuth(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });
      if (!process.env.GOOGLE_CLIENT_ID) {
        res.writeHead(302, { Location: "/integrations?error=no_google_credentials" });
        return res.end();
      }
      const state = signToken({ userId: user.id, purpose: "gmail-oauth" });
      const authUrl = getAuthUrl(state);
      res.writeHead(302, { Location: authUrl });
      return res.end();
    }

    // ── Gmail: OAuth callback ─────────────────────────────────────────────
    if (req.method === "GET" && url.pathname === "/api/integrations/gmail/callback") {
      const code  = url.searchParams.get("code");
      const state = url.searchParams.get("state");
      const error = url.searchParams.get("error");

      if (error) {
        res.writeHead(302, { Location: `/integrations?error=${encodeURIComponent(error)}` });
        return res.end();
      }
      if (!code || !state) {
        res.writeHead(302, { Location: "/integrations?error=missing_params" });
        return res.end();
      }

      let userId;
      try {
        const payload = verifyToken(state);
        if (payload?.purpose !== "gmail-oauth") throw new Error("bad state");
        userId = payload.userId;
      } catch {
        res.writeHead(302, { Location: "/integrations?error=invalid_state" });
        return res.end();
      }

      try {
        const tokens   = await exchangeCode(code);
        const userInfo = await getGoogleUserInfo(tokens.access_token);
        const expiresAt = new Date(Date.now() + (tokens.expires_in || 3600) * 1000);
        await upsertIntegration(userId, "gmail", {
          accessToken:  tokens.access_token,
          refreshToken: tokens.refresh_token || "",
          expiresAt,
          email: userInfo.email || "",
        });
        res.writeHead(302, { Location: "/integrations?connected=gmail" });
      } catch (err) {
        console.error("[gmail oauth error]", err.message);
        res.writeHead(302, { Location: `/integrations?error=${encodeURIComponent(err.message)}` });
      }
      return res.end();
    }

    // ── Gmail: disconnect ─────────────────────────────────────────────────
    if (req.method === "DELETE" && url.pathname === "/api/integrations/gmail") {
      const user = await requireAuth(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });
      await deleteIntegration(user.id, "gmail");
      return sendJson(res, 200, { ok: true });
    }

    // ── Gmail: get inbox ──────────────────────────────────────────────────
    if (req.method === "GET" && url.pathname === "/api/integrations/gmail/inbox") {
      const user = await requireAuth(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });
      const integration = await getIntegration(user.id, "gmail");
      if (!integration) return sendJson(res, 404, { error: "Gmail not connected" });
      const accessToken = await getValidAccessToken(integration,
        (data) => updateIntegrationTokens(user.id, "gmail", data));
      const maxResults = Number(url.searchParams.get("max") || 20);
      const emails = await getInbox(accessToken, maxResults);
      return sendJson(res, 200, { emails, connectedEmail: integration.email });
    }

    // ── Gmail: get single message (full body) ─────────────────────────────
    const gmailMsgMatch = url.pathname.match(/^\/api\/integrations\/gmail\/message\/([^/]+)$/);
    if (req.method === "GET" && gmailMsgMatch) {
      const user = await requireAuth(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });
      const integration = await getIntegration(user.id, "gmail");
      if (!integration) return sendJson(res, 404, { error: "Gmail not connected" });
      const accessToken = await getValidAccessToken(integration,
        (data) => updateIntegrationTokens(user.id, "gmail", data));
      const message = await getMessageFull(accessToken, gmailMsgMatch[1]);
      return sendJson(res, 200, { message });
    }

    // ── Gmail: send email ─────────────────────────────────────────────────
    if (req.method === "POST" && url.pathname === "/api/integrations/gmail/send") {
      const user = await requireAuth(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });
      const integration = await getIntegration(user.id, "gmail");
      if (!integration) return sendJson(res, 404, { error: "Gmail not connected" });
      const { to, subject, body, replyToMsgId, threadId } = await readJsonBody(req);
      if (!to || !subject || !body) return sendJson(res, 400, { error: "to, subject, body required" });
      const accessToken = await getValidAccessToken(integration,
        (data) => updateIntegrationTokens(user.id, "gmail", data));
      const result = await sendEmail(accessToken, { to, subject, body, replyToMsgId, threadId });
      return sendJson(res, 200, { ok: true, messageId: result.id });
    }

    // ── Gmail: create draft ───────────────────────────────────────────────
    if (req.method === "POST" && url.pathname === "/api/integrations/gmail/draft") {
      const user = await requireAuth(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });
      const integration = await getIntegration(user.id, "gmail");
      if (!integration) return sendJson(res, 404, { error: "Gmail not connected" });
      const { to, subject, body } = await readJsonBody(req);
      if (!to || !subject || !body) return sendJson(res, 400, { error: "to, subject, body required" });
      const accessToken = await getValidAccessToken(integration,
        (data) => updateIntegrationTokens(user.id, "gmail", data));
      const draft = await createDraft(accessToken, { to, subject, body });
      return sendJson(res, 200, { ok: true, draftId: draft.id });
    }

    // ── Gmail: ask AI about inbox (streaming) ─────────────────────────────
    if (req.method === "POST" && url.pathname === "/api/integrations/gmail/ask") {
      const user = await requireAuth(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });
      const integration = await getIntegration(user.id, "gmail");
      if (!integration) return sendJson(res, 404, { error: "Gmail not connected" });
      if (!aiApiKey) return sendJson(res, 503, { error: "AI not configured" });

      const { message, emailId } = await readJsonBody(req);
      if (!message?.trim()) return sendJson(res, 400, { error: "Message required" });

      const accessToken = await getValidAccessToken(integration,
        (data) => updateIntegrationTokens(user.id, "gmail", data));

      // Get context: either specific email or inbox summary
      let emailContext = "";
      if (emailId) {
        const fullMsg = await getMessageFull(accessToken, emailId);
        emailContext = `Email from: ${fullMsg.from}\nSubject: ${fullMsg.subject}\nDate: ${fullMsg.date}\n\n${fullMsg.body}`;
      } else {
        const emails = await getInbox(accessToken, 10);
        emailContext = inboxToText(emails);
      }

      const systemPrompt = `You are Flow, Mobilions AI's expert Virtual Assistant with access to the user's Gmail inbox.

Current inbox data:
---
${emailContext}
---

Help the user manage their emails. You can:
- Summarize emails
- Draft replies (when asked, write the full email text)
- Identify important/urgent emails
- Help compose new emails
- Analyze email patterns

When drafting a reply or new email, always write the complete email text ready to send.`;

      const messages = [
        { role: "system", content: systemPrompt },
        { role: "user",   content: message.trim() },
      ];

      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*",
      });

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);
        const aiRes = await fetch(`${aiBaseUrl}/chat/completions`, {
          method: "POST",
          headers: { Authorization: `Bearer ${aiApiKey}`, "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({ model: aiModel, messages, stream: true, temperature: 0.6, max_tokens: 1200 }),
        }).finally(() => clearTimeout(timeout));

        if (!aiRes.ok) { res.write(`data: ${JSON.stringify({ error: `AI error: ${aiRes.status}` })}\n\n`); res.end(); return; }

        const reader = aiRes.body.getReader();
        const decoder = new TextDecoder();
        let lineBuffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          lineBuffer += decoder.decode(value, { stream: true });
          const lines = lineBuffer.split("\n");
          lineBuffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data: ")) continue;
            const data = trimmed.slice(6);
            if (data === "[DONE]") continue;
            try {
              const delta = JSON.parse(data).choices?.[0]?.delta?.content ?? "";
              if (delta) res.write(`data: ${JSON.stringify({ delta })}\n\n`);
            } catch { /* ignore */ }
          }
        }
        reader.releaseLock();
      } catch (err) {
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      }
      res.write("data: [DONE]\n\n");
      res.end();
      return;
    }

    // ── Google Calendar: start OAuth ──────────────────────────────────────
    if (req.method === "GET" && url.pathname === "/api/integrations/gcal/connect") {
      const qToken = url.searchParams.get("token");
      const user = qToken
        ? await (async () => { const p = verifyToken(qToken); return p?.userId ? findUserById(p.userId) : null; })()
        : await requireAuth(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });
      if (!process.env.GOOGLE_CLIENT_ID) {
        res.writeHead(302, { Location: "/integrations?error=no_google_credentials" });
        return res.end();
      }
      const state = signToken({ userId: user.id, purpose: "gcal-oauth" });
      const authUrl = gcalGetAuthUrl(state);
      res.writeHead(302, { Location: authUrl });
      return res.end();
    }

    // ── Google Calendar: OAuth callback ───────────────────────────────────
    if (req.method === "GET" && url.pathname === "/api/integrations/gcal/callback") {
      const code  = url.searchParams.get("code");
      const state = url.searchParams.get("state");
      const error = url.searchParams.get("error");

      if (error) { res.writeHead(302, { Location: `/integrations?error=${encodeURIComponent(error)}` }); return res.end(); }
      if (!code || !state) { res.writeHead(302, { Location: "/integrations?error=missing_params" }); return res.end(); }

      let userId;
      try {
        const payload = verifyToken(state);
        if (payload?.purpose !== "gcal-oauth") throw new Error("bad state");
        userId = payload.userId;
      } catch {
        res.writeHead(302, { Location: "/integrations?error=invalid_state" });
        return res.end();
      }

      try {
        const tokens   = await gcalExchangeCode(code);
        const userInfo = await gcalGetUserInfo(tokens.access_token);
        const expiresAt = new Date(Date.now() + (tokens.expires_in || 3600) * 1000);
        await upsertIntegration(userId, "gcal", {
          accessToken:  tokens.access_token,
          refreshToken: tokens.refresh_token || "",
          expiresAt,
          email: userInfo.email || "",
        });
        res.writeHead(302, { Location: "/integrations?connected=gcal" });
      } catch (err) {
        console.error("[gcal oauth error]", err.message);
        res.writeHead(302, { Location: `/integrations?error=${encodeURIComponent(err.message)}` });
      }
      return res.end();
    }

    // ── Google Calendar: disconnect ───────────────────────────────────────
    if (req.method === "DELETE" && url.pathname === "/api/integrations/gcal") {
      const user = await requireAuth(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });
      await deleteIntegration(user.id, "gcal");
      return sendJson(res, 200, { ok: true });
    }

    // ── Google Calendar: list events ──────────────────────────────────────
    if (req.method === "GET" && url.pathname === "/api/integrations/gcal/events") {
      const user = await requireAuth(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });
      const integration = await getIntegration(user.id, "gcal");
      if (!integration) return sendJson(res, 404, { error: "Google Calendar not connected" });
      const accessToken = await gcalGetValidToken(integration, d => updateIntegrationTokens(user.id, "gcal", d));
      const maxResults = Number(url.searchParams.get("max") || 20);
      const events = await listEvents(accessToken, { maxResults });
      return sendJson(res, 200, { events, connectedEmail: integration.email });
    }

    // ── Google Calendar: create event ─────────────────────────────────────
    if (req.method === "POST" && url.pathname === "/api/integrations/gcal/events") {
      const user = await requireAuth(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });
      const integration = await getIntegration(user.id, "gcal");
      if (!integration) return sendJson(res, 404, { error: "Google Calendar not connected" });
      const { summary, description, location, start, end, attendees } = await readJsonBody(req);
      if (!summary || !start || !end) return sendJson(res, 400, { error: "summary, start, end required" });
      const accessToken = await gcalGetValidToken(integration, d => updateIntegrationTokens(user.id, "gcal", d));
      const event = await createEvent(accessToken, { summary, description, location, start, end, attendees });
      return sendJson(res, 201, { event });
    }

    // ── Google Calendar: delete event ─────────────────────────────────────
    const gcalEventDelMatch = url.pathname.match(/^\/api\/integrations\/gcal\/events\/([^/]+)$/);
    if (req.method === "DELETE" && gcalEventDelMatch) {
      const user = await requireAuth(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });
      const integration = await getIntegration(user.id, "gcal");
      if (!integration) return sendJson(res, 404, { error: "Google Calendar not connected" });
      const accessToken = await gcalGetValidToken(integration, d => updateIntegrationTokens(user.id, "gcal", d));
      await deleteEvent(accessToken, "primary", gcalEventDelMatch[1]);
      return sendJson(res, 200, { ok: true });
    }

    // ── Google Calendar: AI assistant (streaming) ─────────────────────────
    if (req.method === "POST" && url.pathname === "/api/integrations/gcal/ask") {
      const user = await requireAuth(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });
      const integration = await getIntegration(user.id, "gcal");
      if (!integration) return sendJson(res, 404, { error: "Google Calendar not connected" });
      if (!aiApiKey) return sendJson(res, 503, { error: "AI not configured" });

      const { message } = await readJsonBody(req);
      if (!String(message || "").trim()) return sendJson(res, 400, { error: "Message required" });

      const accessToken = await gcalGetValidToken(integration, d => updateIntegrationTokens(user.id, "gcal", d));
      const events = await listEvents(accessToken, { maxResults: 15 });
      const calendarContext = eventsToText(events);
      const now = new Date().toISOString();

      const systemPrompt = `You are Kira, Mobilions AI's scheduling expert with access to the user's Google Calendar.

Today's date/time: ${now}

Upcoming events:
---
${calendarContext}
---

You can help the user:
- View and understand their schedule
- Create new events (respond with JSON block when asked to create)
- Find free time slots
- Suggest meeting times
- Reschedule or describe events

When the user asks to CREATE an event, always respond with a JSON block like this (in addition to your message):
\`\`\`json
{
  "action": "create_event",
  "summary": "Event title",
  "description": "Optional description",
  "location": "Optional location",
  "start": { "dateTime": "2025-01-15T14:00:00", "timeZone": "Asia/Kolkata" },
  "end":   { "dateTime": "2025-01-15T15:00:00", "timeZone": "Asia/Kolkata" },
  "attendees": []
}
\`\`\`

Use the user's local timezone. Today is ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.`;

      const messages = [
        { role: "system", content: systemPrompt },
        { role: "user",   content: message.trim() },
      ];

      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*",
      });

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);
        const aiRes = await fetch(`${aiBaseUrl}/chat/completions`, {
          method: "POST",
          headers: { Authorization: `Bearer ${aiApiKey}`, "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({ model: aiModel, messages, stream: true, temperature: 0.5, max_tokens: 1200 }),
        }).finally(() => clearTimeout(timeout));

        if (!aiRes.ok) { res.write(`data: ${JSON.stringify({ error: `AI error: ${aiRes.status}` })}\n\n`); res.end(); return; }

        const reader = aiRes.body.getReader();
        const decoder = new TextDecoder();
        let lineBuffer = "";
        let fullText = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          lineBuffer += decoder.decode(value, { stream: true });
          const lines = lineBuffer.split("\n");
          lineBuffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data: ")) continue;
            const data = trimmed.slice(6);
            if (data === "[DONE]") continue;
            try {
              const delta = JSON.parse(data).choices?.[0]?.delta?.content ?? "";
              if (delta) { fullText += delta; res.write(`data: ${JSON.stringify({ delta })}\n\n`); }
            } catch { /* ignore */ }
          }
        }
        reader.releaseLock();

        // Check if AI wants to create an event
        const jsonMatch = fullText.match(/```json\s*([\s\S]*?)```/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[1]);
            if (parsed.action === "create_event") {
              const newEvent = await createEvent(accessToken, parsed);
              res.write(`data: ${JSON.stringify({ eventCreated: { id: newEvent.id, summary: newEvent.summary, htmlLink: newEvent.htmlLink } })}\n\n`);
            }
          } catch (e) { console.error("[gcal create event error]", e.message); }
        }
      } catch (err) {
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      }
      res.write("data: [DONE]\n\n");
      res.end();
      return;
    }

    // ── Google Drive: start OAuth ─────────────────────────────────────────
    if (req.method === "GET" && url.pathname === "/api/integrations/gdrive/connect") {
      const qToken = url.searchParams.get("token");
      const user = qToken
        ? await (async () => { const p = verifyToken(qToken); return p?.userId ? findUserById(p.userId) : null; })()
        : await requireAuth(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });
      if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_GDRIVE_REDIRECT_URI) {
        res.writeHead(302, { Location: "/integrations?error=no_google_credentials" });
        return res.end();
      }
      const state = signToken({ userId: user.id, purpose: "gdrive-oauth" });
      const authUrl = gdriveGetAuthUrl(state);
      res.writeHead(302, { Location: authUrl });
      return res.end();
    }

    // ── Google Drive: OAuth callback ──────────────────────────────────────
    if (req.method === "GET" && url.pathname === "/api/integrations/gdrive/callback") {
      const { code, state, error } = Object.fromEntries(url.searchParams);
      if (error) {
        res.writeHead(302, { Location: `/integrations?error=${encodeURIComponent(error)}` });
        return res.end();
      }
      if (!code || !state) {
        res.writeHead(302, { Location: "/integrations?error=missing_params" });
        return res.end();
      }
      try {
        const payload = verifyToken(state);
        if (payload?.purpose !== "gdrive-oauth") throw new Error("bad state");
        const userId = payload.userId;
        const tokens   = await gdriveExchangeCode(code);
        const userInfo = await gdriveGetUserInfo(tokens.access_token);
        await upsertIntegration(userId, "gdrive", {
          accessToken:  tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt:    new Date(Date.now() + tokens.expires_in * 1000),
          email:        userInfo.email,
        });
        res.writeHead(302, { Location: "/integrations?connected=gdrive" });
      } catch (err) {
        console.error("[gdrive oauth error]", err.message);
        res.writeHead(302, { Location: `/integrations?error=${encodeURIComponent(err.message)}` });
      }
      return res.end();
    }

    // ── Google Drive: disconnect ──────────────────────────────────────────
    if (req.method === "DELETE" && url.pathname === "/api/integrations/gdrive") {
      const user = await requireAuth(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });
      await deleteIntegration(user.id, "gdrive");
      return sendJson(res, 200, { ok: true });
    }

    // ── Google Drive: list files ──────────────────────────────────────────
    if (req.method === "GET" && url.pathname === "/api/integrations/gdrive/files") {
      const user = await requireAuth(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });
      const integration = await getIntegration(user.id, "gdrive");
      if (!integration) return sendJson(res, 404, { error: "Google Drive not connected" });
      const accessToken = await gdriveGetValidToken(integration, d => updateIntegrationTokens(user.id, "gdrive", d));
      const q   = url.searchParams.get("q") || "";
      const max = parseInt(url.searchParams.get("max") || "30", 10);
      const { files, nextPageToken } = await listFiles(accessToken, { query: q, maxResults: max });
      return sendJson(res, 200, { files, nextPageToken, connectedEmail: integration.email });
    }

    // ── Google Drive: get file metadata ───────────────────────────────────
    const gdriveFileMatch = url.pathname.match(/^\/api\/integrations\/gdrive\/files\/([^/]+)$/);
    if (req.method === "GET" && gdriveFileMatch) {
      const user = await requireAuth(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });
      const integration = await getIntegration(user.id, "gdrive");
      if (!integration) return sendJson(res, 404, { error: "Google Drive not connected" });
      const accessToken = await gdriveGetValidToken(integration, d => updateIntegrationTokens(user.id, "gdrive", d));
      const file = await getFile(accessToken, gdriveFileMatch[1]);
      // Try to get text content for supported types
      let content = null;
      if (file.mimeType?.includes("google-apps")) {
        content = await exportFileAsText(accessToken, file.id, file.mimeType);
      } else if (file.mimeType?.startsWith("text/")) {
        content = await downloadFile(accessToken, file.id);
      }
      return sendJson(res, 200, { file, content });
    }

    // ── Google Drive: AI assistant (streaming) ────────────────────────────
    if (req.method === "POST" && url.pathname === "/api/integrations/gdrive/ask") {
      const user = await requireAuth(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });
      const integration = await getIntegration(user.id, "gdrive");
      if (!integration) return sendJson(res, 404, { error: "Google Drive not connected" });
      if (!aiApiKey) return sendJson(res, 503, { error: "AI not configured" });

      const { message } = await readJsonBody(req);
      if (!String(message || "").trim()) return sendJson(res, 400, { error: "Message required" });

      const accessToken = await gdriveGetValidToken(integration, d => updateIntegrationTokens(user.id, "gdrive", d));
      const { files } = await listFiles(accessToken, { maxResults: 20 });
      const driveContext = filesToText(files);

      const systemPrompt = `You are Nova, Mobilions AI's expert file and document assistant with access to the user's Google Drive.

Recent files (most recently modified first):
---
${driveContext}
---

You can help the user:
- Find specific files or documents
- Summarize what's in their Drive
- Identify recently modified files
- Answer questions about their documents
- Suggest ways to organize files

Today: ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`;

      const messages = [
        { role: "system", content: systemPrompt },
        { role: "user",   content: message.trim() },
      ];

      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*",
      });

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);
        const aiRes = await fetch(`${aiBaseUrl}/chat/completions`, {
          method: "POST",
          headers: { Authorization: `Bearer ${aiApiKey}`, "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({ model: aiModel, messages, stream: true, temperature: 0.5, max_tokens: 1000 }),
        }).finally(() => clearTimeout(timeout));

        if (!aiRes.ok) { res.write(`data: ${JSON.stringify({ error: `AI error: ${aiRes.status}` })}\n\n`); res.end(); return; }

        const reader = aiRes.body.getReader();
        const decoder = new TextDecoder();
        let lineBuffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          lineBuffer += decoder.decode(value, { stream: true });
          const lines = lineBuffer.split("\n");
          lineBuffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data: ")) continue;
            const data = trimmed.slice(6);
            if (data === "[DONE]") continue;
            try {
              const delta = JSON.parse(data).choices?.[0]?.delta?.content ?? "";
              if (delta) res.write(`data: ${JSON.stringify({ delta })}\n\n`);
            } catch { /* ignore */ }
          }
        }
        reader.releaseLock();
      } catch (err) {
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      }
      res.write("data: [DONE]\n\n");
      res.end();
      return;
    }

    // ── Slack: start OAuth ────────────────────────────────────────────────
    if (req.method === "GET" && url.pathname === "/api/integrations/slack/connect") {
      const qToken = url.searchParams.get("token");
      const user = qToken
        ? await (async () => { const p = verifyToken(qToken); return p?.userId ? findUserById(p.userId) : null; })()
        : await requireAuth(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });
      if (!process.env.SLACK_CLIENT_ID || !process.env.SLACK_REDIRECT_URI) {
        res.writeHead(302, { Location: "/integrations?error=no_slack_credentials" });
        return res.end();
      }
      const state = signToken({ userId: user.id, purpose: "slack-oauth" });
      res.writeHead(302, { Location: slackGetAuthUrl(state) });
      return res.end();
    }

    // ── Slack: OAuth callback ─────────────────────────────────────────────
    if (req.method === "GET" && url.pathname === "/api/integrations/slack/callback") {
      const { code, state, error } = Object.fromEntries(url.searchParams);
      if (error) { res.writeHead(302, { Location: `/integrations?error=${encodeURIComponent(error)}` }); return res.end(); }
      if (!code || !state) { res.writeHead(302, { Location: "/integrations?error=missing_params" }); return res.end(); }
      try {
        const payload = verifyToken(state);
        if (payload?.purpose !== "slack-oauth") throw new Error("bad state");
        const tokens    = await slackExchangeCode(code);
        const userToken = tokens.authed_user?.access_token || tokens.access_token;
        const info      = await slackAuthTest(userToken);
        await upsertIntegration(payload.userId, "slack", {
          accessToken:  userToken,
          refreshToken: "",
          expiresAt:    null,
          email:        info.user || info.team || "",
        });
        res.writeHead(302, { Location: "/integrations?connected=slack" });
      } catch (err) {
        console.error("[slack oauth error]", err.message);
        res.writeHead(302, { Location: `/integrations?error=${encodeURIComponent(err.message)}` });
      }
      return res.end();
    }

    // ── Slack: disconnect ─────────────────────────────────────────────────
    if (req.method === "DELETE" && url.pathname === "/api/integrations/slack") {
      const user = await requireAuth(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });
      await deleteIntegration(user.id, "slack");
      return sendJson(res, 200, { ok: true });
    }

    // ── Slack: list channels ──────────────────────────────────────────────
    if (req.method === "GET" && url.pathname === "/api/integrations/slack/channels") {
      const user = await requireAuth(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });
      const integration = await getIntegration(user.id, "slack");
      if (!integration) return sendJson(res, 404, { error: "Slack not connected" });
      const token    = slackGetAccessToken(integration);
      const channels = await listChannels(token);
      return sendJson(res, 200, { channels, connectedEmail: integration.email });
    }

    // ── Slack: get channel messages ───────────────────────────────────────
    const slackMsgMatch = url.pathname.match(/^\/api\/integrations\/slack\/channels\/([^/]+)\/messages$/);
    if (req.method === "GET" && slackMsgMatch) {
      const user = await requireAuth(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });
      const integration = await getIntegration(user.id, "slack");
      if (!integration) return sendJson(res, 404, { error: "Slack not connected" });
      const token    = slackGetAccessToken(integration);
      const messages = await getMessages(token, slackMsgMatch[1], { limit: 30 });
      return sendJson(res, 200, { messages });
    }

    // ── Slack: send message ───────────────────────────────────────────────
    if (req.method === "POST" && url.pathname === "/api/integrations/slack/send") {
      const user = await requireAuth(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });
      const integration = await getIntegration(user.id, "slack");
      if (!integration) return sendJson(res, 404, { error: "Slack not connected" });
      const token = slackGetAccessToken(integration);
      const { channelId, text } = await readJsonBody(req);
      if (!channelId || !text) return sendJson(res, 400, { error: "channelId and text required" });
      const result = await sendMessage(token, channelId, text);
      return sendJson(res, 200, { ok: true, ts: result.ts });
    }

    // ── Slack: AI assistant (streaming) ──────────────────────────────────
    if (req.method === "POST" && url.pathname === "/api/integrations/slack/ask") {
      const user = await requireAuth(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });
      const integration = await getIntegration(user.id, "slack");
      if (!integration) return sendJson(res, 404, { error: "Slack not connected" });
      if (!aiApiKey) return sendJson(res, 503, { error: "AI not configured" });

      const { message, channelId, channelName } = await readJsonBody(req);
      if (!String(message || "").trim()) return sendJson(res, 400, { error: "Message required" });

      const token = slackGetAccessToken(integration);
      let slackContext = "";
      if (channelId) {
        try {
          const msgs = await getMessages(token, channelId, { limit: 20 });
          slackContext = messagesToText(msgs, channelName || channelId);
        } catch {}
      }
      if (!slackContext) {
        const channels = await listChannels(token, { limit: 20 });
        slackContext = `Your Slack channels:\n${channels.map(c => `• ${channelDisplayName(c)} (${c.num_members || 0} members)`).join("\n")}`;
      }

      const systemPrompt = `You are Aria, Mobilions AI's expert Slack assistant.

${slackContext}

You can help the user:
- Summarize channel conversations
- Draft messages to send
- Identify important discussions
- Answer questions about their workspace
- Suggest replies

Today: ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`;

      const messages = [
        { role: "system", content: systemPrompt },
        { role: "user",   content: message.trim() },
      ];

      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection":    "keep-alive",
        "Access-Control-Allow-Origin": "*",
      });

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);
        const aiRes = await fetch(`${aiBaseUrl}/chat/completions`, {
          method: "POST",
          headers: { Authorization: `Bearer ${aiApiKey}`, "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({ model: aiModel, messages, stream: true, temperature: 0.6, max_tokens: 1200 }),
        }).finally(() => clearTimeout(timeout));

        if (!aiRes.ok) { res.write(`data: ${JSON.stringify({ error: `AI error: ${aiRes.status}` })}\n\n`); res.end(); return; }

        const reader = aiRes.body.getReader();
        const decoder = new TextDecoder();
        let lineBuffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          lineBuffer += decoder.decode(value, { stream: true });
          const lines = lineBuffer.split("\n");
          lineBuffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data: ")) continue;
            const data = trimmed.slice(6);
            if (data === "[DONE]") continue;
            try {
              const delta = JSON.parse(data).choices?.[0]?.delta?.content ?? "";
              if (delta) res.write(`data: ${JSON.stringify({ delta })}\n\n`);
            } catch { /* ignore */ }
          }
        }
        reader.releaseLock();
      } catch (err) {
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      }
      res.write("data: [DONE]\n\n");
      res.end();
      return;
    }

    // ── LinkedIn: connect (mock — no real OAuth) ──────────────────────────
    if (req.method === "GET" && url.pathname === "/api/integrations/linkedin/connect") {
      const qToken = url.searchParams.get("token");
      const user = qToken
        ? await (async () => { const p = verifyToken(qToken); return p?.userId ? findUserById(p.userId) : null; })()
        : await requireAuth(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });
      await upsertIntegration(user.id, "linkedin", {
        accessToken:  "mock-linkedin-token",
        refreshToken: "",
        expiresAt:    null,
        email:        MOCK_PROFILE.email,
      });
      res.writeHead(302, { Location: "/integrations?connected=linkedin" });
      return res.end();
    }

    // ── LinkedIn: disconnect ──────────────────────────────────────────────
    if (req.method === "DELETE" && url.pathname === "/api/integrations/linkedin") {
      const user = await requireAuth(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });
      await deleteIntegration(user.id, "linkedin");
      return sendJson(res, 200, { ok: true });
    }

    // ── LinkedIn: profile ─────────────────────────────────────────────────
    if (req.method === "GET" && url.pathname === "/api/integrations/linkedin/profile") {
      const user = await requireAuth(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });
      const integration = await getIntegration(user.id, "linkedin");
      if (!integration) return sendJson(res, 404, { error: "LinkedIn not connected" });
      return sendJson(res, 200, { profile: MOCK_PROFILE, analytics: MOCK_ANALYTICS });
    }

    // ── LinkedIn: posts ───────────────────────────────────────────────────
    if (req.method === "GET" && url.pathname === "/api/integrations/linkedin/posts") {
      const user = await requireAuth(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });
      const integration = await getIntegration(user.id, "linkedin");
      if (!integration) return sendJson(res, 404, { error: "LinkedIn not connected" });
      return sendJson(res, 200, { posts: MOCK_POSTS });
    }

    // ── LinkedIn: create post (mock) ──────────────────────────────────────
    if (req.method === "POST" && url.pathname === "/api/integrations/linkedin/post") {
      const user = await requireAuth(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });
      const integration = await getIntegration(user.id, "linkedin");
      if (!integration) return sendJson(res, 404, { error: "LinkedIn not connected" });
      const { text } = await readJsonBody(req);
      if (!String(text || "").trim()) return sendJson(res, 400, { error: "Text required" });
      const newPost = {
        id:          `p${Date.now()}`,
        text:        text.trim(),
        likes:       0,
        comments:    0,
        shares:      0,
        date:        new Date().toISOString().split("T")[0],
        impressions: 0,
        isNew:       true,
      };
      return sendJson(res, 200, { ok: true, post: newPost });
    }

    // ── LinkedIn: AI assistant (streaming) ───────────────────────────────
    if (req.method === "POST" && url.pathname === "/api/integrations/linkedin/ask") {
      const user = await requireAuth(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });
      const integration = await getIntegration(user.id, "linkedin");
      if (!integration) return sendJson(res, 404, { error: "LinkedIn not connected" });
      if (!aiApiKey) return sendJson(res, 503, { error: "AI not configured" });

      const { message } = await readJsonBody(req);
      if (!String(message || "").trim()) return sendJson(res, 400, { error: "Message required" });

      const systemPrompt = `You are Aria, Mobilions AI's expert LinkedIn and personal branding assistant.

${profileToText(MOCK_PROFILE)}

Recent Posts:
${postsToText(MOCK_POSTS)}

Analytics (last 90 days):
${analyticsToText(MOCK_ANALYTICS)}

You can help the user:
- Write compelling LinkedIn posts and threads
- Suggest hashtags and optimal posting times
- Analyze post performance and engagement
- Craft outreach messages and connection requests
- Build a thought leadership content strategy
- Rewrite or improve existing posts

Keep advice actionable and specific to their profile and audience.
Today: ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`;

      const messages = [
        { role: "system", content: systemPrompt },
        { role: "user",   content: message.trim() },
      ];

      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection":    "keep-alive",
        "Access-Control-Allow-Origin": "*",
      });

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);
        const aiRes = await fetch(`${aiBaseUrl}/chat/completions`, {
          method: "POST",
          headers: { Authorization: `Bearer ${aiApiKey}`, "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({ model: aiModel, messages, stream: true, temperature: 0.7, max_tokens: 1200 }),
        }).finally(() => clearTimeout(timeout));

        if (!aiRes.ok) { res.write(`data: ${JSON.stringify({ error: `AI error: ${aiRes.status}` })}\n\n`); res.end(); return; }

        const reader = aiRes.body.getReader();
        const decoder = new TextDecoder();
        let lineBuffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          lineBuffer += decoder.decode(value, { stream: true });
          const lines = lineBuffer.split("\n");
          lineBuffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data: ")) continue;
            const data = trimmed.slice(6);
            if (data === "[DONE]") continue;
            try {
              const delta = JSON.parse(data).choices?.[0]?.delta?.content ?? "";
              if (delta) res.write(`data: ${JSON.stringify({ delta })}\n\n`);
            } catch { /* ignore */ }
          }
        }
        reader.releaseLock();
      } catch (err) {
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      }
      res.write("data: [DONE]\n\n");
      res.end();
      return;
    }

    // ── Notion: start OAuth ───────────────────────────────────────────────
    if (req.method === "GET" && url.pathname === "/api/integrations/notion/connect") {
      const qToken = url.searchParams.get("token");
      const user = qToken
        ? await (async () => { const p = verifyToken(qToken); return p?.userId ? findUserById(p.userId) : null; })()
        : await requireAuth(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });
      if (!process.env.NOTION_CLIENT_ID || !process.env.NOTION_REDIRECT_URI) {
        res.writeHead(302, { Location: "/integrations?error=no_notion_credentials" });
        return res.end();
      }
      const state = signToken({ userId: user.id, purpose: "notion-oauth" });
      const authUrl = notionGetAuthUrl(state);
      res.writeHead(302, { Location: authUrl });
      return res.end();
    }

    // ── Notion: OAuth callback ────────────────────────────────────────────
    if (req.method === "GET" && url.pathname === "/api/integrations/notion/callback") {
      const { code, state, error } = Object.fromEntries(url.searchParams);
      if (error) {
        res.writeHead(302, { Location: `/integrations?error=${encodeURIComponent(error)}` });
        return res.end();
      }
      if (!code || !state) {
        res.writeHead(302, { Location: "/integrations?error=missing_params" });
        return res.end();
      }
      try {
        const payload = verifyToken(state);
        if (payload?.purpose !== "notion-oauth") throw new Error("bad state");
        const userId  = payload.userId;
        const tokens  = await notionExchangeCode(code);
        const email = tokens.owner?.user?.person?.email || tokens.owner?.user?.name || tokens.workspace_name || "";
        await upsertIntegration(userId, "notion", {
          accessToken:  tokens.access_token,
          refreshToken: "",
          expiresAt:    null,
          email,
        });
        res.writeHead(302, { Location: "/integrations?connected=notion" });
      } catch (err) {
        console.error("[notion oauth error]", err.message);
        res.writeHead(302, { Location: `/integrations?error=${encodeURIComponent(err.message)}` });
      }
      return res.end();
    }

    // ── Notion: disconnect ────────────────────────────────────────────────
    if (req.method === "DELETE" && url.pathname === "/api/integrations/notion") {
      const user = await requireAuth(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });
      await deleteIntegration(user.id, "notion");
      return sendJson(res, 200, { ok: true });
    }

    // ── Notion: search pages / databases ─────────────────────────────────
    if (req.method === "GET" && url.pathname === "/api/integrations/notion/search") {
      const user = await requireAuth(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });
      const integration = await getIntegration(user.id, "notion");
      if (!integration) return sendJson(res, 404, { error: "Notion not connected" });
      const accessToken = notionGetAccessToken(integration);
      const q = url.searchParams.get("q") || "";
      const results = await searchAll(accessToken, q);
      return sendJson(res, 200, { results, connectedEmail: integration.email });
    }

    // ── Notion: get page content (blocks) ─────────────────────────────────
    const notionPageMatch = url.pathname.match(/^\/api\/integrations\/notion\/pages\/([^/]+)$/);
    if (req.method === "GET" && notionPageMatch) {
      const user = await requireAuth(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });
      const integration = await getIntegration(user.id, "notion");
      if (!integration) return sendJson(res, 404, { error: "Notion not connected" });
      const accessToken = notionGetAccessToken(integration);
      const page   = await getPage(accessToken, notionPageMatch[1]);
      const blocks = await getPageBlocks(accessToken, notionPageMatch[1]);
      return sendJson(res, 200, { page, blocks });
    }

    // ── Notion: create page ───────────────────────────────────────────────
    if (req.method === "POST" && url.pathname === "/api/integrations/notion/pages") {
      const user = await requireAuth(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });
      const integration = await getIntegration(user.id, "notion");
      if (!integration) return sendJson(res, 404, { error: "Notion not connected" });
      const accessToken = notionGetAccessToken(integration);
      const { title, content, parentPageId, parentDatabaseId } = await readJsonBody(req);
      if (!title) return sendJson(res, 400, { error: "Title required" });
      const page = await createPage(accessToken, { title, content, parentPageId, parentDatabaseId });
      return sendJson(res, 200, { page });
    }

    // ── Notion: get database schema ───────────────────────────────────────
    const notionDbMatch = url.pathname.match(/^\/api\/integrations\/notion\/databases\/([^/]+)$/);
    if (req.method === "GET" && notionDbMatch) {
      const user = await requireAuth(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });
      const integration = await getIntegration(user.id, "notion");
      if (!integration) return sendJson(res, 404, { error: "Notion not connected" });
      const accessToken = notionGetAccessToken(integration);
      const db = await getDatabase(accessToken, notionDbMatch[1]);
      return sendJson(res, 200, { db });
    }

    // ── Notion: query database rows ───────────────────────────────────────
    const notionDbQueryMatch = url.pathname.match(/^\/api\/integrations\/notion\/databases\/([^/]+)\/query$/);
    if (req.method === "GET" && notionDbQueryMatch) {
      const user = await requireAuth(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });
      const integration = await getIntegration(user.id, "notion");
      if (!integration) return sendJson(res, 404, { error: "Notion not connected" });
      const accessToken = notionGetAccessToken(integration);
      const rows = await queryDatabase(accessToken, notionDbQueryMatch[1]);
      return sendJson(res, 200, { rows });
    }

    // ── Notion: create ticket in database ─────────────────────────────────
    const notionTicketMatch = url.pathname.match(/^\/api\/integrations\/notion\/databases\/([^/]+)\/tickets$/);
    if (req.method === "POST" && notionTicketMatch) {
      const user = await requireAuth(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });
      const integration = await getIntegration(user.id, "notion");
      if (!integration) return sendJson(res, 404, { error: "Notion not connected" });
      const accessToken = notionGetAccessToken(integration);
      const { title, status, priority, dueDate, description } = await readJsonBody(req);
      if (!title) return sendJson(res, 400, { error: "Title required" });

      let dbId = notionTicketMatch[1];

      // Resolve the ID — handle page-wrapping-a-database and not-shared errors
      try {
        await getDatabase(accessToken, dbId);
      } catch (err) {
        if (err.message.includes("is a page, not a database")) {
          // The URL points to a page — look for an inline database inside it
          const blocks = await getPageBlocks(accessToken, dbId);
          const dbBlock = blocks.find(b => b.type === "child_database");
          if (dbBlock) {
            dbId = dbBlock.id;
          } else {
            return sendJson(res, 400, { error: "That URL points to a page with no database inside. Open Task Tracker as a full page in Notion and copy that URL." });
          }
        } else if (err.message.includes("Could not find database") || err.message.includes("Make sure the relevant")) {
          return sendJson(res, 400, { error: "Database not shared with integration. In Notion: open Task Tracker → click '...' → Connections → connect 'mobilions ai'." });
        } else {
          throw err;
        }
      }

      const page = await createTicket(accessToken, dbId, { title, status, priority, dueDate, description });
      return sendJson(res, 200, { page });
    }

    // ── Notion: AI assistant (streaming) ─────────────────────────────────
    if (req.method === "POST" && url.pathname === "/api/integrations/notion/ask") {
      const user = await requireAuth(req);
      if (!user) return sendJson(res, 401, { error: "Unauthorized" });
      const integration = await getIntegration(user.id, "notion");
      if (!integration) return sendJson(res, 404, { error: "Notion not connected" });
      if (!aiApiKey) return sendJson(res, 503, { error: "AI not configured" });

      const { message, pageId } = await readJsonBody(req);
      if (!String(message || "").trim()) return sendJson(res, 400, { error: "Message required" });

      const accessToken = notionGetAccessToken(integration);
      let notionContext = "";
      if (pageId) {
        try {
          const blocks = await getPageBlocks(accessToken, pageId);
          notionContext = `Current page content:\n---\n${blocksToText(blocks)}\n---\n`;
        } catch {}
      }
      if (!notionContext) {
        const results = await searchAll(accessToken, "");
        notionContext = `Your Notion workspace pages:\n---\n${pagesToText(results)}\n---\n`;
      }

      const systemPrompt = `You are Aria, Mobilions AI's expert Notion assistant with access to the user's Notion workspace.

${notionContext}

You can help the user:
- Find and summarize pages or databases
- Draft content for new pages
- Answer questions about their workspace
- Suggest how to organize information
- Summarize or rewrite existing content

When asked to create a page, respond with the content ready to use.
Today: ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`;

      const messages = [
        { role: "system", content: systemPrompt },
        { role: "user",   content: message.trim() },
      ];

      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection":    "keep-alive",
        "Access-Control-Allow-Origin": "*",
      });

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);
        const aiRes = await fetch(`${aiBaseUrl}/chat/completions`, {
          method: "POST",
          headers: { Authorization: `Bearer ${aiApiKey}`, "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({ model: aiModel, messages, stream: true, temperature: 0.6, max_tokens: 1200 }),
        }).finally(() => clearTimeout(timeout));

        if (!aiRes.ok) { res.write(`data: ${JSON.stringify({ error: `AI error: ${aiRes.status}` })}\n\n`); res.end(); return; }

        const reader = aiRes.body.getReader();
        const decoder = new TextDecoder();
        let lineBuffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          lineBuffer += decoder.decode(value, { stream: true });
          const lines = lineBuffer.split("\n");
          lineBuffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data: ")) continue;
            const data = trimmed.slice(6);
            if (data === "[DONE]") continue;
            try {
              const delta = JSON.parse(data).choices?.[0]?.delta?.content ?? "";
              if (delta) res.write(`data: ${JSON.stringify({ delta })}\n\n`);
            } catch { /* ignore */ }
          }
        }
        reader.releaseLock();
      } catch (err) {
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      }
      res.write("data: [DONE]\n\n");
      res.end();
      return;
    }

    // ── Page routes → serve HTML ───────────────────────────────────────────
    const pageRoutes = {
      "/login": "login.html",
      "/signup": "signup.html",
      "/dashboard": "dashboard.html",
      "/chat": "chat.html",
      "/power-ups": "power-ups.html",
      "/brain": "brain.html",
      "/integrations": "integrations.html",
      "/agents": "agent-page.html",
      "/gmail":   "gmail.html",
      "/gcal":    "gcal.html",
      "/gdrive":  "gdrive.html",
      "/notion":  "notion.html",
      "/slack":      "slack.html",
      "/linkedin":   "linkedin.html",
          };
    if (req.method === "GET" && pageRoutes[url.pathname]) {
      const data = await readFile(join(publicDir, pageRoutes[url.pathname]));
      return sendFile(res, 200, data, ".html");
    }

    // ── Static files ───────────────────────────────────────────────────────
    return serveStatic(url.pathname, res);

  } catch (err) {
    console.error("[server error]", err);
    return sendJson(res, 500, { error: err.message || "Internal server error" });
  }
});

server.listen(port, () => {
  console.log(`\n  🚀  Mobilions AI running at http://localhost:${port}`);
  console.log(`  📊  Dashboard  → http://localhost:${port}/dashboard`);
  console.log(`  🤖  Agents API → http://localhost:${port}/api/agents\n`);
});

// ── Static file serving ────────────────────────────────────────────────────
async function serveStatic(pathname, res) {
  const safePath = pathname === "/" ? "/index.html" : pathname;
  const filePath = resolve(publicDir, `.${safePath}`);
  if (!filePath.startsWith(publicDir)) return sendText(res, 403, "Forbidden");
  try {
    const data = await readFile(filePath);
    return sendFile(res, 200, data, extname(filePath));
  } catch {
    return sendText(res, 404, "Not found");
  }
}

function sendFile(res, status, data, ext) {
  const mimeTypes = {
    ".html": "text/html; charset=utf-8",
    ".css":  "text/css; charset=utf-8",
    ".js":   "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png":  "image/png",
    ".svg":  "image/svg+xml",
    ".ico":  "image/x-icon",
  };
  const type = mimeTypes[ext] || "application/octet-stream";
  const headers = { "Content-Type": type };
  if (ext === ".html") Object.assign(headers, { "Cache-Control": "no-cache, no-store, must-revalidate" });
  res.writeHead(status, headers);
  res.end(data);
}

function sendText(res, status, text) {
  res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(text);
}

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString("utf8");
  return text ? JSON.parse(text) : {};
}

// ── Auth helpers ───────────────────────────────────────────────────────────
function signToken(payload) {
  const header  = b64u(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body    = b64u(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000) }));
  const sig     = createHmac("sha256", jwtSecret).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${sig}`;
}

function verifyToken(token) {
  try {
    const [header, body, sig] = String(token || "").split(".");
    const expected = createHmac("sha256", jwtSecret).update(`${header}.${body}`).digest("base64url");
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch { return null; }
}

async function requireAuth(req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload?.userId) return null;
  return findUserById(payload.userId);
}

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = await scryptAsync(password, salt, 64);
  return `${salt}:${hash.toString("hex")}`;
}

async function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(":");
  const derived = await scryptAsync(password, salt, 64);
  return timingSafeEqual(Buffer.from(hash, "hex"), derived);
}

function b64u(str) { return Buffer.from(str).toString("base64url"); }
function safeUser(u) { return { id: u.id, name: u.name, email: u.email, createdAt: u.createdAt }; }
function publicAgent(a) {
  const { systemPrompt, ...pub } = a;
  return pub;
}

// ── .env loader ────────────────────────────────────────────────────────────
async function loadEnvFile(path) {
  try {
    const text = await readFile(path, "utf8");
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
      if (key && !(key in process.env)) process.env[key] = val;
    }
  } catch { /* .env optional */ }
}
