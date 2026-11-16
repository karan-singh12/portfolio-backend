import { Router, Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import { sendMail, ownerEmail, buildIcs } from "../../utils/mailer";
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

/** Fire-and-forget booking emails with an .ics invite. Never throws. */
function notifyBooking(doc: any) {
    const owner = ownerEmail();
    const when = doc.start.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "full", timeStyle: "short" });
    const ics = buildIcs({
        uid: String(doc._id), start: doc.start, end: doc.end,
        summary: `Call: Karan Singh and ${doc.name}`,
        description: `${doc.notes || "Intro call"}
Booked via portfolio. Visitor time zone: ${doc.tz || "unknown"}`,
        organizerEmail: owner || undefined, attendeeEmail: doc.email, attendeeName: doc.name,
    });
    const attachments = [{ filename: "call.ics", content: ics, contentType: "text/calendar; method=REQUEST" }];
    if (owner) {
        void sendMail({
            to: owner, replyTo: doc.email, attachments,
            subject: `[call booked] ${doc.name} · ${doc.durationMin} min · ${when} IST`,
            text: `${doc.name} <${doc.email}>
${when} IST (${doc.durationMin} min) · booker time zone: ${doc.tz || "?"}

${doc.notes || ""}

Open the attached call.ics to save it to your calendar. All bookings: admin panel > Interviews.`,
        });
    }
    void sendMail({
        to: doc.email, replyTo: owner || undefined, attachments,
        subject: `Your call with Karan Singh is booked · ${when} IST`,
        text: `Hi ${doc.name},

Your ${doc.durationMin}-minute call is booked for ${when} IST.
The attached call.ics adds it to your calendar. I will send the meeting link before the call.

Karan Singh`,
    });
}

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

    // Email in the background: the response never waits for (or fails because of) email.
    void sendMail({
        to: ownerEmail(),
        replyTo: lead.email,
        subject: `[${b.source} portfolio] New inquiry from ${lead.name}`,
        text: `${lead.name} <${lead.email}> ${lead.company ? `(${lead.company})` : ""}
` +
              `Budget: ${lead.budget || "-"} | Timeline: ${lead.timeline || "-"} | Type: ${lead.projectType || "-"}

${lead.message}`,
    });
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

    // Emails in the background (never block or fail the booking): one to the owner and one to the
    // visitor, both with a calendar invite attached so the call can be saved to a calendar.
    notifyBooking(doc);
    successResponseWithData(res, "Call booked", { id: doc._id, start, durationMin: dur });
}));

export default siteRoutes;
