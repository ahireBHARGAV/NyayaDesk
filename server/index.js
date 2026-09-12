import cors from "cors";
import express from "express";
import { randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import pkg from "@prisma/client";
import { getMcpData } from "./services/mcpProxy.js";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();
const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5174" }));
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

// ----- PUBLIC CNR CASE LOOKUP -----
// This route deliberately needs no session: a CNR lookup is available from the
// public home page as well as from either signed-in workspace.
const publicCase = (item) => ({
  cnr: item.cnrNumber || item.id,
  caseType: item.type || "Not available",
  caseStatus: item.status || "Not available",
  filingNumber: "Not available",
  filingDate: null,
  registrationNumber: item.caseNumber || "Not available",
  registrationDate: null,
  firstHearingDate: null,
  lastHearingDate: null,
  nextHearingDate: (item.hearings && item.hearings.length > 0) ? item.hearings[0].date : null,
  decisionDate: null,
  courtName: item.court || "Not available",
  courtCode: "",
  judges: [item.judge].filter(Boolean),
  petitioners: [],
  petitionerAdvocates: [],
  respondents: [],
  respondentAdvocates: [],
  act: "Not available",
  hearingCount: item.hearings?.length || 0,
  hasOrders: false,
  hasJudgments: false,
});

app.get("/api/public/cases/search", async (req, res) => {
  const cnr = String(req.query.cnr || "").trim().toUpperCase();
  if (!cnr) return res.status(400).json({ detail: "Enter a CNR number." });
  const cases = await prisma.case.findMany({
    where: { cnrNumber: { contains: cnr, mode: 'insensitive' } },
    include: { hearings: { orderBy: { date: 'desc' }, take: 1 } }
  });
  const results = cases.map(publicCase);
  return res.json({ results });
});

app.get("/api/public/cases/:cnr", async (req, res) => {
  const cnr = decodeURIComponent(req.params.cnr).trim().toUpperCase();
  const c = await prisma.case.findUnique({
    where: { cnrNumber: cnr },
    include: { hearings: { orderBy: { date: 'desc' }, take: 1 } }
  });
  if (!c) return res.status(404).json({ detail: "No case found for this CNR number." });
  return res.json(publicCase(c));
});

// ----- ADVOCATE PORTFOLIO -----
app.get("/api/advocate/portfolio/cases", requireAuth, async (req, res) => {
  const advocateCases = await prisma.advocateCase.findMany({
    where: { userId: req.user.id },
    include: { 
      case: { 
        include: { hearings: { orderBy: { date: 'desc' }, take: 1 } } 
      } 
    }
  });
  res.json(advocateCases.map(ac => ({
    id: ac.case.cnrNumber || ac.case.id,
    title: ac.case.title,
    type: ac.case.type,
    court: ac.case.court,
    judge: ac.case.judge,
    next: ac.case.hearings?.[0]?.date || "Not scheduled",
    status: ac.case.status,
    addedAt: ac.addedAt,
    internalNotes: ac.internalNotes
  })));
});

app.post("/api/advocate/portfolio/cases", requireAuth, async (req, res) => {
  const cnr = String(req.body.cnr || "").trim().toUpperCase();
  if (!cnr) return res.status(400).json({ detail: "CNR number is required." });
  
  const c = await prisma.case.findUnique({ where: { cnrNumber: cnr } });
  if (!c) return res.status(404).json({ detail: "Case not found in the current system." });
  
  try {
    await prisma.advocateCase.create({
      data: { userId: req.user.id, caseId: c.id }
    });
    return res.status(201).json({ detail: "Case added to portfolio." });
  } catch (err) {
    return res.status(400).json({ detail: "This case is already in your portfolio." });
  }
});

app.get("/api/advocate/portfolio/hearings", requireAuth, async (req, res) => {
  const advocateCases = await prisma.advocateCase.findMany({
    where: { userId: req.user.id },
    include: {
      case: {
        include: {
          hearings: {
            include: { courtroom: true, judge: true },
            orderBy: { date: 'asc' }
          }
        }
      }
    }
  });

  const allHearings = advocateCases.flatMap(ac => ac.case.hearings);
  // Sort all hearings chronologically
  allHearings.sort((a, b) => new Date(a.date) - new Date(b.date));

  res.json(allHearings.map(h => ({
    id: h.id,
    date: h.date,
    time: h.time,
    case: h.case?.title || "Unknown Case",
    room: h.courtroom?.room || h.room,
    judge: h.judge?.name || h.judgeName,
    status: h.status
  })));
});

app.get("/api/advocate/portfolio/cases/:caseId", requireAuth, async (req, res) => {
  const caseId = decodeURIComponent(req.params.caseId);
  const ac = await prisma.advocateCase.findFirst({
    where: { 
      userId: req.user.id, 
      case: { OR: [{ cnrNumber: caseId }, { id: caseId }] } 
    },
    include: { 
      case: { 
        include: { 
          hearings: { orderBy: { date: 'desc' } },
          advocateCases: { include: { user: true } }
        } 
      } 
    }
  });
  
  if (!ac) return res.status(404).json({ detail: "Case not found in your portfolio." });
  
  res.json({
    id: ac.case.cnrNumber || ac.case.id,
    title: ac.case.title,
    type: ac.case.type,
    court: ac.case.court,
    judge: ac.case.judge,
    next: ac.case.hearings?.[0]?.date || "Not scheduled",
    status: ac.case.status,
    internalNotes: ac.internalNotes,
    addedAt: ac.addedAt,
    partners: ac.case.advocateCases.map(partnerAc => ({
      id: partnerAc.user.id,
      name: partnerAc.user.name,
      email: partnerAc.user.email,
      role: partnerAc.role,
      addedAt: partnerAc.addedAt
    })),
    hearings: ac.case.hearings
  });
});

app.post("/api/advocate/portfolio/cases/:caseId/partners", requireAuth, async (req, res) => {
  const caseId = decodeURIComponent(req.params.caseId);
  const partnerId = req.body.partnerId;
  if (!partnerId) return res.status(400).json({ detail: "partnerId is required." });
  
  const ac = await prisma.advocateCase.findFirst({
    where: { userId: req.user.id, case: { OR: [{ cnrNumber: caseId }, { id: caseId }] } }
  });
  if (!ac) return res.status(403).json({ detail: "You don't have permission to add partners to this case." });
  
  try {
    await prisma.advocateCase.create({
      data: { userId: partnerId, caseId: ac.caseId }
    });
    return res.status(201).json({ detail: "Partner added successfully." });
  } catch (err) {
    return res.status(400).json({ detail: "This advocate is already a partner on this case." });
  }
});

app.delete("/api/advocate/portfolio/cases/:caseId/partners/:advocateId", requireAuth, async (req, res) => {
  const caseId = decodeURIComponent(req.params.caseId);
  const advocateId = req.params.advocateId;
  
  const ac = await prisma.advocateCase.findFirst({
    where: { userId: req.user.id, case: { OR: [{ cnrNumber: caseId }, { id: caseId }] } }
  });
  if (!ac) return res.status(403).json({ detail: "You don't have permission to remove partners from this case." });
  
  await prisma.advocateCase.deleteMany({
    where: { userId: advocateId, caseId: ac.caseId }
  });
  return res.json({ detail: "Partner removed." });
});

// ----- AUTHORITY MIDDLEWARE -----
const requireAuthority = [requireAuth, (req, res, next) => {
  if (req.user.role !== 'AUTHORITY') return res.status(403).json({ detail: "Authority access required." });
  next();
}];

// ----- AUTHORITY WORKFLOW -----
app.get("/api/authority/dashboard", requireAuthority, async (req, res) => {
  const totalCases = await prisma.case.count();
  
  const today = new Date().toISOString().split('T')[0]; // Simple string match for MVP
  // In a real app we'd parse properly. MVP uses string comparison for 'date' field.
  const todaysHearings = await prisma.hearing.count({
    where: { date: today }
  });
  
  const upcomingHearings = await prisma.hearing.count({
    where: { date: { gt: today } }
  });
  
  const totalCourtrooms = await prisma.courtroom.count();
  const totalJudges = await prisma.judge.count();
  
  res.json({ totalCases, todaysHearings, upcomingHearings, totalCourtrooms, totalJudges });
});

app.get("/api/authority/cases", requireAuthority, async (req, res) => {
  const cases = await prisma.case.findMany({
    include: { hearings: { orderBy: { date: 'desc' }, take: 1 } }
  });
  res.json(cases.map(c => ({
    id: c.cnrNumber || c.id,
    title: c.title,
    type: c.type,
    court: c.court,
    judge: c.judge,
    next: c.hearings?.[0]?.date || "Not scheduled",
    status: c.status,
  })));
});

app.get("/api/authority/cases/:caseId", requireAuthority, async (req, res) => {
  const caseId = decodeURIComponent(req.params.caseId);
  const c = await prisma.case.findFirst({
    where: { OR: [{ cnrNumber: caseId }, { id: caseId }] },
    include: { 
      hearings: { 
        orderBy: { date: 'desc' },
        include: { courtroom: true, judge: true }
      } 
    }
  });
  
  if (!c) return res.status(404).json({ detail: "Case not found." });
  
  res.json({
    id: c.cnrNumber || c.id,
    caseNumber: c.caseNumber,
    title: c.title,
    type: c.type,
    court: c.court,
    judge: c.judge,
    status: c.status,
    hearings: c.hearings
  });
});

app.post("/api/authority/hearings", requireAuthority, async (req, res) => {
  const { caseId, date, time, courtroomId, judgeId, status } = req.body;
  if (!caseId || !date) return res.status(400).json({ detail: "Case ID and Date are required." });
  
  const c = await prisma.case.findFirst({ where: { OR: [{ cnrNumber: caseId }, { id: caseId }] } });
  if (!c) return res.status(404).json({ detail: "Case not found." });
  
  // Create hearing without duplicating case
  const h = await prisma.hearing.create({
    data: {
      caseId: c.id,
      date,
      time: time || "",
      courtroomId: courtroomId || null,
      judgeId: judgeId || null,
      status: status || "Scheduled"
    },
    include: { courtroom: true, judge: true }
  });
  
  // Optionally update case status/judge fields if required by legacy UI
  if (judgeId) {
    const j = await prisma.judge.findUnique({ where: { id: judgeId } });
    if (j) {
      await prisma.case.update({
        where: { id: c.id },
        data: { judge: j.name, status: "Hearing Scheduled" }
      });
    }
  }
  
  res.status(201).json(h);
});

app.get("/api/authority/courtrooms", requireAuthority, async (req, res) => {
  const courtrooms = await prisma.courtroom.findMany({
    include: { judge: true }
  });
  res.json(courtrooms);
});

app.patch("/api/authority/courtrooms/:courtroomId", requireAuthority, async (req, res) => {
  const { judgeId, status } = req.body;
  const data = {};
  if (judgeId !== undefined) data.judgeId = judgeId;
  if (status !== undefined) data.status = status;
  
  const cr = await prisma.courtroom.update({
    where: { id: req.params.courtroomId },
    data,
    include: { judge: true }
  });
  res.json(cr);
});

app.get("/api/authority/judges", requireAuthority, async (req, res) => {
  const judges = await prisma.judge.findMany();
  res.json(judges);
});

app.post("/api/authority/judges", requireAuthority, async (req, res) => {
  if (!req.body.name) return res.status(400).json({ detail: "Name required" });
  try {
    const j = await prisma.judge.create({ data: { name: req.body.name } });
    res.status(201).json(j);
  } catch(e) {
    res.status(400).json({ detail: "Judge already exists or invalid data" });
  }
});

// ----- ADVOCATES -----
app.get("/api/advocates", requireAuth, async (req, res) => {
  const advocates = await prisma.user.findMany({
    where: { role: "ADVOCATE", id: { not: req.user.id } },
    select: { id: true, name: true, email: true }
  });
  res.json(advocates);
});

// ----- CASES (Fallback/Global for Authority if needed) -----
app.get("/api/cases/", async (_req, res) => {
  const cases = await prisma.case.findMany({ include: { hearings: { orderBy: { date: 'desc' }, take: 1 } } });
  res.json(cases.map(c => ({
    id: c.cnrNumber || c.id,
    title: c.title,
    type: c.type,
    court: c.court,
    judge: c.judge,
    next: c.hearings?.[0]?.date || "Not scheduled",
    status: c.status,
  })));
});

app.get("/api/cases/search", async (req, res) => {
  const query = req.query.q || '';
  const cases = await prisma.case.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { cnrNumber: { contains: query, mode: 'insensitive' } },
        { court: { contains: query, mode: 'insensitive' } }
      ]
    },
    include: { hearings: { orderBy: { date: 'desc' }, take: 1 } }
  });
  
  res.json(cases.map(c => ({
    id: c.cnrNumber || c.id,
    title: c.title,
    type: c.type,
    court: c.court,
    judge: c.judge,
    next: c.hearings?.[0]?.date || "Not scheduled",
    status: c.status,
  })));
});

app.get("/api/cases/:id/", async (req, res) => {
  const id = decodeURIComponent(req.params.id);
  const c = await prisma.case.findFirst({
    where: { OR: [{ cnrNumber: id }, { id: id }] },
    include: { hearings: { orderBy: { date: 'desc' }, take: 1 } }
  });
  if (!c) return res.status(404).json({ detail: "Not found" });
  res.json({
    id: c.cnrNumber || c.id,
    title: c.title,
    type: c.type,
    court: c.court,
    judge: c.judge,
    next: c.hearings?.[0]?.date || "Not scheduled",
    status: c.status,
  });
});

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

app.put("/api/auth/profile/", requireAuth, async (req, res) => {
  const updates = {};
  if (req.body.name?.trim()) updates.name = req.body.name.trim();
  if (req.body.phone !== undefined) updates.phone = req.body.phone.trim() || null;
  if (req.body.court !== undefined) updates.court = req.body.court || null;

  if (req.body.email !== undefined) {
    const email = req.body.email.trim().toLowerCase();
    if (!email) return res.status(400).json({ detail: "Email is required." });
    const owner = await prisma.user.findUnique({ where: { email } });
    if (owner && owner.id !== req.user.id)
      return res.status(409).json({ detail: "That email address is already in use." });
    updates.email = email;
  }
  if (req.body.password) {
    if (req.body.password.length < 6)
      return res.status(400).json({ detail: "Password must contain at least 6 characters." });
    if (!req.body.currentPassword || !req.user.passwordHash || !passwordMatches(req.body.currentPassword, req.user.passwordHash))
      return res.status(401).json({ detail: "Your current password is incorrect." });
    updates.passwordHash = hashPassword(req.body.password);
  }

  const user = await prisma.user.update({ where: { id: req.user.id }, data: updates });
  return res.json({ user: publicUser(user) });
});

app.post("/api/auth/logout/", requireAuth, async (req, res) => {
  const token = req.headers.authorization.replace("Bearer ", "");
  await prisma.session.deleteMany({ where: { token } });
  return res.status(204).end();
});

app.get("/api/case-law/", (_req, res) => res.json([]));

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => { console.log(`Server running on port ${PORT}`); });
