import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ── Users ──────────────────────────────────────────────────────────────────
export async function createUser({ name, email, passwordHash }) {
  const normalizedEmail = String(email || "").toLowerCase().trim();
  try {
    return await prisma.user.create({
      data: { name: String(name || "").trim(), email: normalizedEmail, passwordHash },
    });
  } catch (err) {
    if (err.code === "P2002") throw new Error("Email already registered");
    throw err;
  }
}

export async function findUserByEmail(email) {
  return prisma.user.findUnique({
    where: { email: String(email || "").toLowerCase().trim() },
  }) ?? null;
}

export async function findUserById(id) {
  return prisma.user.findUnique({ where: { id } }) ?? null;
}

// ── Conversations ──────────────────────────────────────────────────────────
export async function getOrCreateConversation(userId, agentId) {
  return prisma.conversation.upsert({
    where:  { userId_agentId: { userId, agentId } },
    update: {},
    create: { userId, agentId, messages: [] },
  });
}

export async function getConversation(userId, agentId) {
  return prisma.conversation.findUnique({
    where: { userId_agentId: { userId, agentId } },
  }) ?? null;
}

export async function appendMessages(userId, agentId, newMessages) {
  const conv = await getOrCreateConversation(userId, agentId);
  const existing = Array.isArray(conv.messages) ? conv.messages : [];
  const updated = [...existing, ...newMessages];

  return prisma.conversation.update({
    where: { userId_agentId: { userId, agentId } },
    data: { messages: updated },
  });
}

export async function clearConversation(userId, agentId) {
  return prisma.conversation.updateMany({
    where: { userId, agentId },
    data: { messages: [] },
  });
}

export async function getUserConversations(userId) {
  return prisma.conversation.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
}

// ── Brain AI ───────────────────────────────────────────────────────────────
export async function getBrainEntries(userId) {
  return prisma.brainEntry.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function addBrainEntry(userId, { title, content, type = "text", source = "" }) {
  return prisma.brainEntry.create({
    data: {
      userId,
      title: String(title || "").trim(),
      content: String(content || "").trim(),
      type: String(type || "text"),
      source: String(source || ""),
    },
  });
}

export async function deleteBrainEntry(userId, entryId) {
  return prisma.brainEntry.deleteMany({
    where: { id: entryId, userId },
  });
}

export async function getBrainContext(userId) {
  const entries = await prisma.brainEntry.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { title: true, content: true, type: true },
  });
  if (!entries.length) return "";
  const parts = entries.map(e => `[${e.type.toUpperCase()}] ${e.title}:\n${e.content}`);
  const joined = parts.join("\n\n---\n\n");
  return joined.length > 2000 ? joined.slice(0, 2000) + "…" : joined;
}

// ── Integrations (OAuth tokens) ────────────────────────────────────────────
export async function getIntegration(userId, provider) {
  return prisma.integration.findUnique({
    where: { userId_provider: { userId, provider } },
  }) ?? null;
}

export async function upsertIntegration(userId, provider, data) {
  return prisma.integration.upsert({
    where:  { userId_provider: { userId, provider } },
    update: { ...data, updatedAt: new Date() },
    create: { userId, provider, ...data },
  });
}

export async function updateIntegrationTokens(userId, provider, { accessToken, expiresAt }) {
  return prisma.integration.update({
    where: { userId_provider: { userId, provider } },
    data:  { accessToken, expiresAt },
  });
}

export async function deleteIntegration(userId, provider) {
  return prisma.integration.deleteMany({ where: { userId, provider } });
}

export async function getUserIntegrations(userId) {
  return prisma.integration.findMany({
    where:  { userId },
    select: { provider: true, email: true, createdAt: true },
  });
}
