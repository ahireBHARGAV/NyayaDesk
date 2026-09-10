import cors from "cors";
import express from "express";
import { randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

const hashPassword = (password) => {
  const salt = randomUUID();
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
};
const passwordMatches = (password, stored) => {
  const [salt, expected] = stored.split(":");
  const actual = scryptSync(password, salt, 64).toString("hex");
  return timingSafeEqual(
    Buffer.from(expected, "hex"),
    Buffer.from(actual, "hex"),
  );
};
const publicUser = ({ passwordHash, ...user }) => user;

const requireAuth = async (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ detail: "Authentication required." });
  
  const session = await prisma.session.findUnique({ where: { token }, include: { user: true } });
  if (!session || !session.user)
    return res.status(401).json({ detail: "Authentication required." });
    
  req.user = session.user;
  return next();
};

app.get("/api/health/", (_req, res) =>
  res.json({ status: "ok", mode: "prisma-neon" }),
);

// ----- CASES -----
app.get("/api/cases/", async (_req, res) => {
  const cases = await prisma.case.findMany();
  res.json(cases.map(c => ({
    id: c.externalCaseId || c.id,
    title: c.title,
    type: c.type,
    court: c.court,
    judge: c.judge,
    next: c.nextHearingDate,
    status: c.status,
  })));
});

app.post("/api/cases/", async (req, res) => {
  if (!req.body.id || !req.body.title)
    return res.status(400).json({ detail: "Case number and title are required." });
  
  const newItem = await prisma.case.create({
    data: {
      externalCaseId: req.body.id,
      caseNumber: req.body.id,
      title: req.body.title,
      type: req.body.type || 'Civil',
      court: req.body.court || 'District Court',
      judge: req.body.judge || 'Unassigned',
      nextHearingDate: req.body.next || "Not scheduled",
      status: "Active",
      source: "local"
    }
  });
  
  return res.status(201).json({
    id: newItem.externalCaseId || newItem.id,
    title: newItem.title,
    type: newItem.type,
    court: newItem.court,
    judge: newItem.judge,
    next: newItem.nextHearingDate,
    status: newItem.status,
  });
});

app.get("/api/cases/search", async (req, res) => {
  const query = req.query.q || '';
  const cases = await prisma.case.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { externalCaseId: { contains: query, mode: 'insensitive' } },
        { court: { contains: query, mode: 'insensitive' } }
      ]
    }
  });
  
  res.json(cases.map(c => ({
    id: c.externalCaseId || c.id,
    title: c.title,
    type: c.type,
    court: c.court,
    judge: c.judge,
    next: c.nextHearingDate,
    status: c.status,
  })));
});

app.get("/api/cases/:id/", async (req, res) => {
  const id = decodeURIComponent(req.params.id);
  const c = await prisma.case.findFirst({
    where: { OR: [{ externalCaseId: id }, { id: id }] }
  });
  if (!c) return res.status(404).json({ detail: "Case not found" });
  
  return res.json({
    id: c.externalCaseId || c.id,
    title: c.title,
    type: c.type,
    court: c.court,
    judge: c.judge,
    next: c.nextHearingDate,
    status: c.status,
  });
});

app.delete("/api/cases/:id/", async (req, res) => {
  const id = decodeURIComponent(req.params.id);
  const c = await prisma.case.findFirst({
    where: { OR: [{ externalCaseId: id }, { id: id }] }
  });
  if (!c) return res.status(404).json({ detail: "Case not found" });
  
  await prisma.hearing.deleteMany({ where: { caseId: c.id } });
  await prisma.case.delete({ where: { id: c.id } });
  
  return res.json({ id: c.externalCaseId || c.id, title: c.title });
});

// ----- HEARINGS -----
app.get("/api/hearings/", async (_req, res) => {
  const hearings = await prisma.hearing.findMany({ include: { case: true } });
  res.json(hearings.map(h => ({
    id: h.id,
    date: h.date,
    time: h.time,
    case: h.case?.title || "Unknown Case",
    room: h.room,
    judge: h.judge,
    status: h.status
  })));
});

app.post("/api/hearings/", async (req, res) => {
  if (!req.body.date || !req.body.time || !req.body.case || !req.body.room)
    return res.status(400).json({ detail: "Date, time, case, and courtroom are required." });

  let relatedCase = await prisma.case.findFirst({ where: { title: req.body.case }});
  if (!relatedCase) {
    relatedCase = await prisma.case.create({
      data: {
        title: req.body.case,
        type: 'Unknown', court: 'Unknown', judge: req.body.judge || 'Unknown', status: 'Active'
      }
    });
  }

  const h = await prisma.hearing.create({
    data: {
      caseId: relatedCase.id,
      date: req.body.date,
      time: req.body.time,
      room: req.body.room,
      judge: req.body.judge || "Unassigned",
      status: "Scheduled"
    }
  });
  
  return res.status(201).json({
    id: h.id,
    date: h.date,
    time: h.time,
    case: relatedCase.title,
    room: h.room,
    judge: h.judge,
    status: h.status
  });
});

app.delete("/api/hearings/:id/", async (req, res) => {
  const h = await prisma.hearing.findUnique({ where: { id: req.params.id } });
  if (!h) return res.status(404).json({ detail: "Hearing not found" });
  await prisma.hearing.delete({ where: { id: req.params.id } });
  return res.json({ id: h.id });
});

// ----- COURTROOMS -----
app.get("/api/courtrooms/", async (_req, res) => {
  const courtrooms = await prisma.courtroom.findMany();
  res.json(courtrooms.map(c => ({
    room: c.room,
    judge: c.judge,
    status: c.status,
    current: c.currentCase || "No case assigned"
  })));
});

app.post("/api/courtrooms/", async (req, res) => {
  if (!req.body.room) return res.status(400).json({ detail: "Courtroom is required." });
  
  const c = await prisma.courtroom.upsert({
    where: { room: req.body.room },
    update: {
      judge: req.body.judge || "Unassigned",
      status: "Updated",
      currentCase: req.body.current || "No case assigned"
    },
    create: {
      room: req.body.room,
      judge: req.body.judge || "Unassigned",
      status: "Updated",
      currentCase: req.body.current || "No case assigned"
    }
  });
  
  return res.status(201).json({
    room: c.room, judge: c.judge, status: c.status, current: c.currentCase
  });
});

app.patch("/api/courtrooms/:room/", async (req, res) => {
  const room = decodeURIComponent(req.params.room);
  let c = await prisma.courtroom.findUnique({ where: { room } });
  if (!c) return res.status(404).json({ detail: "Courtroom not found" });
  
  c = await prisma.courtroom.update({
    where: { room },
    data: {
      judge: req.body.judge !== undefined ? req.body.judge : c.judge,
      status: req.body.status !== undefined ? req.body.status : c.status,
      currentCase: req.body.current !== undefined ? req.body.current : c.currentCase,
    }
  });
  
  return res.json({
    room: c.room, judge: c.judge, status: c.status, current: c.currentCase
  });
});

app.delete("/api/courtrooms/:room/", async (req, res) => {
  const room = decodeURIComponent(req.params.room);
  const c = await prisma.courtroom.findUnique({ where: { room } });
  if (!c) return res.status(404).json({ detail: "Courtroom not found" });
  
  await prisma.courtroom.delete({ where: { room } });
  return res.json({ room: c.room });
});

app.get("/api/judges/", async (_req, res) => {
  const courtrooms = await prisma.courtroom.findMany();
  res.json(courtrooms.map(c => ({
    judge: c.judge, courtroom: c.room, status: c.status
  })));
});

app.post("/api/assignments/", async (req, res) => {
  const room = req.body.courtroom;
  if (room) {
    const c = await prisma.courtroom.findUnique({ where: { room } });
    if (c) {
      await prisma.courtroom.update({
        where: { room },
        data: {
          judge: req.body.judge || c.judge,
          currentCase: req.body.caseNumber || c.currentCase,
          status: "Updated"
        }
      });
    }
  }
  return res.status(201).json({ id: Date.now(), ...req.body, status: "Assigned" });
});

// ----- NOTIFICATIONS -----
app.get("/api/notifications/", async (_req, res) => {
  const notifications = await prisma.notification.findMany();
  res.json(notifications.map(n => ({
    id: n.id, type: n.type, message: n.message, read: n.read
  })));
});

app.patch("/api/notifications/:id/", async (req, res) => {
  let n = await prisma.notification.findUnique({ where: { id: req.params.id } });
  if (!n) return res.status(404).json({ detail: "Notification not found" });
  
  n = await prisma.notification.update({
    where: { id: req.params.id },
    data: { read: req.body.read ?? true }
  });
  return res.json({ id: n.id, type: n.type, message: n.message, read: n.read });
});

// ----- DOCUMENTS -----
app.get("/api/documents/", async (_req, res) => {
  const docs = await prisma.document.findMany();
  res.json(docs);
});

app.post("/api/documents/", async (req, res) => {
  const doc = await prisma.document.create({
    data: {
      date: new Date().toLocaleDateString("en-GB"),
      status: "Uploaded",
      name: req.body.name || "Untitled",
      caseNumber: req.body.caseNumber || null,
      type: req.body.type || null
    }
  });
  return res.status(201).json(doc);
});

app.delete("/api/documents/:id/", async (req, res) => {
  const doc = await prisma.document.findUnique({ where: { id: req.params.id } });
  if (!doc) return res.status(404).json({ detail: "Document not found" });
  await prisma.document.delete({ where: { id: req.params.id } });
  return res.json(doc);
});

// ----- FILINGS -----
app.get("/api/filings/", async (_req, res) => {
  const filings = await prisma.filing.findMany();
  res.json(filings);
});

app.post("/api/filings/", async (req, res) => {
  const filing = await prisma.filing.create({
    data: {
      status: "Submitted",
      title: req.body.title || req.body.name || "Untitled",
      caseNumber: req.body.caseNumber || null,
      type: req.body.type || null
    }
  });
  return res.status(201).json(filing);
});

app.delete("/api/filings/:id/", async (req, res) => {
  const filing = await prisma.filing.findUnique({ where: { id: req.params.id } });
  if (!filing) return res.status(404).json({ detail: "Filing not found" });
  await prisma.filing.delete({ where: { id: req.params.id } });
  return res.json(filing);
});

// ----- PROFILES -----
app.get("/api/profiles/:role/", async (req, res) => {
  const profile = await prisma.profile.findUnique({ where: { role: req.params.role } });
  return profile ? res.json(profile) : res.status(404).json({ detail: "Profile not found" });
});

app.put("/api/profiles/:role/", async (req, res) => {
  let profile = await prisma.profile.findUnique({ where: { role: req.params.role } });
  if (!profile) return res.status(404).json({ detail: "Profile not found" });
  
  profile = await prisma.profile.update({
    where: { role: req.params.role },
    data: {
      name: req.body.name !== undefined ? req.body.name : profile.name,
      profileId: req.body.id !== undefined ? req.body.id : profile.profileId,
      phone: req.body.phone !== undefined ? req.body.phone : profile.phone,
      court: req.body.court !== undefined ? req.body.court : profile.court,
      alerts: req.body.alerts !== undefined ? req.body.alerts : profile.alerts
    }
  });
  return res.json(profile);
});

// ----- AUTH -----
app.post("/api/auth/signup/", async (req, res) => {
  const required = ["role", "name", "email", "password", "court", "id"];
  if (required.some((field) => !req.body[field])) return res.status(400).json({ detail: "Please complete all required fields." });
  const email = req.body.email.trim().toLowerCase();
  
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ detail: "An account with this email already exists." });
  
  const { password, ...details } = req.body;
  const user = await prisma.user.create({
    data: {
      id: details.id,
      name: details.name,
      email,
      passwordHash: hashPassword(password),
      court: details.court,
      role: details.role,
      designation: details.designation
    }
  });
  
  return res.status(201).json({ userId: user.id, name: user.name, role: user.role, email: user.email });
});

app.post("/api/auth/login/", async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user || user.role.toLowerCase() !== req.body.role?.toLowerCase())
    return res.status(401).json({ detail: "Invalid email or password." });
    
  const valid = user.passwordHash ? passwordMatches(req.body.password || "", user.passwordHash) : user.password === req.body.password;
  if (!valid) return res.status(401).json({ detail: "Invalid email or password." });
  
  if (!user.passwordHash) {
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashPassword(req.body.password) }
    });
  }
  
  const token = randomUUID();
  await prisma.session.create({
    data: { token, userId: user.id }
  });
  
  return res.json({ token, user: publicUser(user) });
});

app.get("/api/auth/me/", requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));

app.post("/api/auth/logout/", requireAuth, async (req, res) => {
  const token = req.headers.authorization.replace("Bearer ", "");
  await prisma.session.deleteMany({ where: { token } });
  return res.status(204).end();
});

app.get("/api/case-law/", (_req, res) => res.json([]));

app.listen(3001, () => console.log("API running at http://localhost:3001"));
