import nodemailer from "nodemailer";

/**
 * Outgoing email that never blocks or breaks a request.
 *
 * - If RESEND_API_KEY is set, mail goes through Resend's HTTPS API (works where SMTP is blocked).
 *   Optional: MAIL_FROM (a sender on a domain verified in Resend; defaults to Resend's test sender).
 * - Otherwise it uses the existing SMTP settings (EMAIL, PASS, HOST, EMAIL_PORT, SERVICE) with short
 *   timeouts, so a blocked or slow SMTP server fails fast instead of hanging.
 * - Callers use `void sendMail(...)`: the HTTP response is never held up by email, and failures are
 *   only logged.
 */

export interface MailAttachment {
    filename: string;
    content: string; // text content (e.g. an .ics file)
    contentType: string;
}

export interface MailInput {
    to: string;
    subject: string;
    text: string;
    replyTo?: string;
    attachments?: MailAttachment[];
}

const SMTP_TIMEOUT_MS = 10_000;

export const ownerEmail = () => process.env.OWNER_EMAIL || process.env.EMAIL || "";

async function viaResend(m: MailInput): Promise<boolean> {
    const key = process.env.RESEND_API_KEY;
    if (!key) return false;
    const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
            from: process.env.MAIL_FROM || "Portfolio <onboarding@resend.dev>",
            to: [m.to],
            reply_to: m.replyTo,
            subject: m.subject,
            text: m.text,
            attachments: m.attachments?.map((a) => ({
                filename: a.filename,
                content: Buffer.from(a.content, "utf8").toString("base64"),
            })),
        }),
        signal: AbortSignal.timeout(SMTP_TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`Resend HTTP ${res.status}`);
    return true;
}

async function viaSmtp(m: MailInput): Promise<boolean> {
    if (!process.env.EMAIL || !process.env.PASS) return false;
    const transport = nodemailer.createTransport({
        host: process.env.HOST,
        port: Number(process.env.EMAIL_PORT) || 587,
        service: process.env.SERVICE,
        auth: { user: process.env.EMAIL, pass: process.env.PASS },
        connectionTimeout: SMTP_TIMEOUT_MS,
        greetingTimeout: SMTP_TIMEOUT_MS,
        socketTimeout: SMTP_TIMEOUT_MS,
    });
    await transport.sendMail({
        from: process.env.EMAIL,
        to: m.to,
        replyTo: m.replyTo,
        subject: m.subject,
        text: m.text,
        attachments: m.attachments?.map((a) => ({ filename: a.filename, content: a.content, contentType: a.contentType })),
    });
    return true;
}

/** Never throws. Resolves true if some channel accepted the message. */
export async function sendMail(m: MailInput): Promise<boolean> {
    try {
        if (await viaResend(m)) return true;
    } catch (e) {
        console.warn("[mail] Resend failed:", (e as Error).message);
    }
    try {
        if (await viaSmtp(m)) return true;
    } catch (e) {
        console.warn("[mail] SMTP failed:", (e as Error).message);
    }
    console.warn(`[mail] not sent (no working channel): ${m.subject}`);
    return false;
}

const icsDate = (t: number | Date) => new Date(t).toISOString().replace(/[-:]|\.\d{3}/g, "");
const icsText = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/** A calendar invite (.ics): opens in Google Calendar / Outlook / Apple Calendar to save the event. */
export function buildIcs(o: {
    uid: string;
    start: Date;
    end: Date;
    summary: string;
    description?: string;
    organizerEmail?: string;
    attendeeEmail?: string;
    attendeeName?: string;
}): string {
    const lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Karan Singh//Portfolio//EN",
        "METHOD:REQUEST",
        "BEGIN:VEVENT",
        `UID:${o.uid}@portfolio`,
        `DTSTAMP:${icsDate(Date.now())}`,
        `DTSTART:${icsDate(o.start)}`,
        `DTEND:${icsDate(o.end)}`,
        `SUMMARY:${icsText(o.summary)}`,
    ];
    if (o.description) lines.push(`DESCRIPTION:${icsText(o.description)}`);
    if (o.organizerEmail) lines.push(`ORGANIZER:mailto:${o.organizerEmail}`);
    if (o.attendeeEmail) lines.push(`ATTENDEE;CN=${icsText(o.attendeeName || o.attendeeEmail)};RSVP=TRUE:mailto:${o.attendeeEmail}`);
    lines.push("STATUS:CONFIRMED", "END:VEVENT", "END:VCALENDAR");
    return lines.join("\r\n");
}
