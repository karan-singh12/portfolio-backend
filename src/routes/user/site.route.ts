import { Router, Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import nodemailer from "nodemailer";
import SiteConfigModel from "../../models/siteConfig.model";
import ServiceModel from "../../models/service.model";
import ExperienceModel from "../../models/experience.model";
import LeadModel from "../../models/lead.model";
import BookingModel from "../../models/booking.model";
import { Availability, DEFAULT_AVAILABILITY, buildSchedule, isSlotFree } from "../../utils/scheduling";
import { successResponseWithData } from "../../utils/apiResponse";
import { SUCCESS } from "../../utils/responseMssg";

const siteRoutes = Router();
const AUDIENCES = ["job", "freelance"];

// GET /user/site/config/:audience  -> copy/stat overrides (null if never configured; frontends ship defaults)
siteRoutes.get("/config/:audience", asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { audience } = req.params;
    if (!AUDIENCES.includes(audience)) return next(new Error("Invalid audience"));
    const doc = await SiteConfigModel.findOne({ site: audience }).lean();
    successResponseWithData(res, SUCCESS.dataFound, doc);
}));

// GET /user/site/experience?audience=job
siteRoutes.get("/experience", asyncHandler(async (req: Request, res: Response) => {
    const q: any = { status: "active" };
    if (req.query.audience) q.audience = String(req.query.audience);
    const result = await ExperienceModel.find(q).sort({ current: -1, createdAt: -1 }).lean();
    successResponseWithData(res, SUCCESS.dataFound, result);
}));

// GET /user/site/services
siteRoutes.get("/services", asyncHandler(async (_req: Request, res: Response) => {
    const result = await ServiceModel.find({ status: "active" }).sort({ order: 1, createdAt: -1 }).lean();
    successResponseWithData(res, SUCCESS.dataFound, result);
}));

// --- POST /user/site/lead : tiny in-memory rate limit (5 / 10min / IP) + honeypot ---
const hits = new Map<string, number[]>();
const WINDOW = 10 * 60 * 1000;
const MAX = 5;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

siteRoutes.post("/lead", asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const b = req.body || {};
    if (b.website) { successResponseWithData(res, "Thanks!", { ok: true }); return; } // honeypot: pretend success

    const ip = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
    const now = Date.now();
    const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW);
    if (recent.length >= MAX) return next(new Error("Too many requests, please try again later"));
    hits.set(ip, [...recent, now]);

    if (!AUDIENCES.includes(b.source)) return next(new Error("Invalid source"));
    if (!b.name?.trim() || !b.message?.trim() || !EMAIL_RE.test(b.email || "")) {
        return next(new Error("Name, a valid email and a message are required"));
    }

    const lead = await LeadModel.create({
        source: b.source,
        name: String(b.name).trim(),
        email: String(b.email).trim(),
        company: b.company && String(b.company).trim(),
        message: String(b.message).trim(),
        budget: b.budget,
        timeline: b.timeline,
        projectType: b.projectType,
        ip,
    });

    // Best-effort email notification; never fails the request.
    if (process.env.EMAIL && process.env.PASS) {
        try {
            const transport = nodemailer.createTransport({
                host: process.env.HOST, port: Number(process.env.EMAIL_PORT) || 587,
                service: process.env.SERVICE, auth: { user: process.env.EMAIL, pass: process.env.PASS },
            });
            await transport.sendMail({
                from: process.env.EMAIL, to: process.env.EMAIL,
                subject: `[${b.source} portfolio] New inquiry from ${lead.name}`,
                text: `${lead.name} <${lead.email}> ${lead.company ? `(${lead.company})` : ""}\n` +
                      `Budget: ${lead.budget || "-"} | Timeline: ${lead.timeline || "-"} | Type: ${lead.projectType || "-"}\n\n${lead.message}`,
            });
        } catch (e) { console.warn("lead email failed", (e as Error).message); }
    }
    successResponseWithData(res, "Thanks! I'll get back to you shortly.", { id: lead._id });
}));


// ---------------- Scheduling (merge-intervals based) ----------------
async function loadAvailability(): Promise<Availability> {
    const cfg: any = await SiteConfigModel.findOne({ site: "freelance" }).lean();
    return { ...DEFAULT_AVAILABILITY, ...(cfg?.extra?.availability || {}) };
}
const upcomingBookings = async (now: number) =>
    (await BookingModel.find({ status: "confirmed", end: { $gte: new Date(now - 24 * 3600e3) } }, { start: 1, end: 1 }).lean())
        .map((b: any) => ({ s: +new Date(b.start), e: +new Date(b.end) }));

// GET /user/site/schedule -> working windows + anonymous busy intervals (no attendee data)
siteRoutes.get("/schedule", asyncHandler(async (_req: Request, res: Response) => {
    const now = Date.now();
    const av = await loadAvailability();
    const { windows, busy } = buildSchedule(av, await upcomingBookings(now), now);
    const iso = (l: { s: number; e: number }[]) => l.map((i) => ({ s: i.s, e: i.e }));
    successResponseWithData(res, SUCCESS.dataFound, {
        tzLabel: av.tzLabel, durations: av.durations, stepMin: av.stepMin, bufferMin: av.bufferMin,
        windows: iso(windows), busy: iso(busy), serverNow: now,
    });
}));

const bookHits = new Map<string, number[]>();

// POST /user/site/book { start(ms), durationMin, name, email, notes?, tz? }
siteRoutes.post("/book", asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const b = req.body || {};
    if (b.website) { successResponseWithData(res, "Booked", { ok: true }); return; }
    const ip = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
    const now = Date.now();
    const recent = (bookHits.get(ip) || []).filter((t) => now - t < WINDOW);
    if (recent.length >= 3) return next(new Error("Too many booking attempts, please try again later"));
    bookHits.set(ip, [...recent, now]);

    const start = Number(b.start), dur = Number(b.durationMin);
    if (!Number.isFinite(start) || !Number.isFinite(dur)) return next(new Error("Invalid slot"));
    if (!b.name?.trim() || !EMAIL_RE.test(b.email || "")) return next(new Error("Name and a valid email are required"));

    const av = await loadAvailability();
    if (!isSlotFree(av, await upcomingBookings(now), start, dur, now)) {
        res.status(409); return next(new Error("That slot was just taken. Please pick another."));
    }
    const doc = await BookingModel.create({
        start: new Date(start), end: new Date(start + dur * 60000), durationMin: dur,
        name: String(b.name).trim(), email: String(b.email).trim(), notes: b.notes && String(b.notes).slice(0, 2000), tz: b.tz,
    });
    // Race guard: if another confirmed booking (+buffer) overlaps and was created first, back out.
    const buf = av.bufferMin * 60000;
    const clash = await BookingModel.findOne({
        _id: { $lt: doc._id }, status: "confirmed",
        start: { $lt: new Date(start + dur * 60000 + buf) }, end: { $gt: new Date(start - buf) },
    }).lean();
    if (clash) { await BookingModel.deleteOne({ _id: doc._id }); res.status(409); return next(new Error("That slot was just taken. Please pick another.")); }

    if (process.env.EMAIL && process.env.PASS) {
        try {
            const transport = nodemailer.createTransport({ host: process.env.HOST, port: Number(process.env.EMAIL_PORT) || 587, service: process.env.SERVICE, auth: { user: process.env.EMAIL, pass: process.env.PASS } });
            await transport.sendMail({
                from: process.env.EMAIL, to: process.env.EMAIL,
                subject: `[call booked] ${doc.name} · ${doc.durationMin} min`,
                text: `${doc.name} <${doc.email}>
${doc.start.toISOString()} (${doc.durationMin} min) · booker tz: ${doc.tz || "?"}

${doc.notes || ""}`,
            });
        } catch (e) { console.warn("booking email failed", (e as Error).message); }
    }
    successResponseWithData(res, "Call booked", { id: doc._id, start, durationMin: dur });
}));

export default siteRoutes;
