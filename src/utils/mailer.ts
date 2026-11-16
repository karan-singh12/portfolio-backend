/**
 * Outgoing email via Resend (HTTPS API). It never blocks or breaks a request.
 *
 * Required env: RESEND_API_KEY.
 * Optional env: MAIL_FROM (a sender on a domain verified in Resend, e.g. "Karan Singh <hello@yourdomain.com>";
 *               defaults to Resend's test sender, which can only email the Resend account owner),
 *               OWNER_EMAIL (where "call booked" / "new inquiry" mails go).
 * Callers use `void sendMail(...)`: the HTTP response is never held up by email, and failures are only logged.
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
    html?: string;
    replyTo?: string;
    attachments?: MailAttachment[];
}

const TIMEOUT_MS = 10_000;

export const ownerEmail = () => process.env.OWNER_EMAIL || "";

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
            html: m.html,
            attachments: m.attachments?.map((a) => ({
                filename: a.filename,
                content: Buffer.from(a.content, "utf8").toString("base64"),
            })),
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
        const detail = await res.text().catch(() => "");
        throw new Error(`Resend HTTP ${res.status} (to ${m.to}): ${detail.slice(0, 300)}`);
    }
    return true;
}

/** Never throws. Resolves true if some channel accepted the message. */
export async function sendMail(m: MailInput): Promise<boolean> {
    if (!process.env.RESEND_API_KEY) {
        console.warn(`[mail] not sent: RESEND_API_KEY is not set (${m.subject})`);
        return false;
    }
    try {
        return await viaResend(m);
    } catch (e) {
        console.warn("[mail] failed:", (e as Error).message);
        return false;
    }
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
