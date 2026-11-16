/**
 * Call scheduling built on LeetCode 56 (Merge Intervals).
 *
 *   busy (bookings + buffers + daily blocks)  --mergeIntervals-->  disjoint busy
 *   working window - disjoint busy            --subtract------->   free gaps
 *   free gaps                                 --slotsFrom------->  bookable start times
 *
 * All values are epoch milliseconds. Keep this file in sync with
 * freelanceProtfolio/src/lib/scheduling.ts (the browser runs the same maths to draw the timeline).
 */
export type Iv = { s: number; e: number };
const MIN = 60_000;

export interface Availability {
    tzOffsetMin: number;                       // owner's UTC offset, e.g. 330 for IST
    tzLabel: string;
    days: Record<number, [string, string][]>;  // 0=Sun..6=Sat -> [["10:00","19:00"]]
    blocks: { label: string; from: string; to: string }[]; // blocked every working day (lunch, etc.)
    bufferMin: number;                         // gap kept around every booking
    minNoticeHours: number;
    horizonDays: number;
    durations: number[];
    stepMin: number;                           // slot grid
}

export const DEFAULT_AVAILABILITY: Availability = {
    tzOffsetMin: 330,
    tzLabel: "IST (UTC+5:30)",
    days: { 1: [["10:00", "19:00"]], 2: [["10:00", "19:00"]], 3: [["10:00", "19:00"]], 4: [["10:00", "19:00"]], 5: [["10:00", "19:00"]] },
    blocks: [{ label: "Lunch", from: "13:00", to: "14:00" }],
    bufferMin: 15,
    minNoticeHours: 12,
    horizonDays: 14,
    durations: [30, 45, 60],
    stepMin: 30,
};

/** Classic: sort by start, extend the last interval while the next one overlaps or touches it. O(n log n). */
export function mergeIntervals(intervals: Iv[]): Iv[] {
    const sorted = [...intervals].filter((i) => i.e > i.s).sort((a, b) => a.s - b.s);
    const out: Iv[] = [];
    for (const cur of sorted) {
        const last = out[out.length - 1];
        if (last && cur.s <= last.e) last.e = Math.max(last.e, cur.e);
        else out.push({ ...cur });
    }
    return out;
}

/** window minus disjoint, sorted busy intervals -> free gaps */
export function subtract(window: Iv, busy: Iv[]): Iv[] {
    const free: Iv[] = [];
    let cursor = window.s;
    for (const b of busy) {
        if (b.e <= cursor) continue;
        if (b.s >= window.e) break;
        if (b.s > cursor) free.push({ s: cursor, e: Math.min(b.s, window.e) });
        cursor = Math.max(cursor, b.e);
    }
    if (cursor < window.e) free.push({ s: cursor, e: window.e });
    return free;
}

/** Start times (on the grid) where `dur` minutes fit entirely inside a free gap. */
export function slotsFrom(free: Iv[], dur: number, stepMin: number): number[] {
    const step = stepMin * MIN, len = dur * MIN, out: number[] = [];
    for (const g of free) {
        for (let t = Math.ceil(g.s / step) * step; t + len <= g.e; t += step) out.push(t);
    }
    return out;
}

const hm = (v: string) => { const [h, m] = v.split(":").map(Number); return h * 60 + m; };

/** Owner-timezone working windows for the next `horizonDays`, clipped by minimum notice. */
export function buildWindows(av: Availability, now: number): { windows: Iv[]; blocks: Iv[] } {
    const off = av.tzOffsetMin * MIN;
    const n = new Date(now + off);
    const y = n.getUTCFullYear(), m = n.getUTCMonth(), d = n.getUTCDate();
    const earliest = now + av.minNoticeHours * 60 * MIN;
    const windows: Iv[] = [], blocks: Iv[] = [];
    for (let i = 0; i <= av.horizonDays; i++) {
        const localMidnight = Date.UTC(y, m, d + i);
        const dow = new Date(localMidnight).getUTCDay();
        const base = localMidnight - off; // true epoch of owner-local midnight
        for (const [from, to] of av.days[dow] ?? []) {
            const w = { s: Math.max(base + hm(from) * MIN, earliest), e: base + hm(to) * MIN };
            if (w.e > w.s) {
                windows.push(w);
                for (const b of av.blocks) blocks.push({ s: base + hm(b.from) * MIN, e: base + hm(b.to) * MIN });
            }
        }
    }
    return { windows, blocks };
}

/** Everything the client needs to draw the timeline and compute slots itself. */
export function buildSchedule(av: Availability, bookings: Iv[], now = Date.now()) {
    const { windows, blocks } = buildWindows(av, now);
    const buf = av.bufferMin * MIN;
    const busy: Iv[] = [...blocks, ...bookings.map((b) => ({ s: b.s - buf, e: b.e + buf }))];
    return { windows, busy };
}

export function isSlotFree(av: Availability, bookings: Iv[], start: number, dur: number, now = Date.now()): boolean {
    if (!av.durations.includes(dur)) return false;
    const { windows, busy } = buildSchedule(av, bookings, now);
    const merged = mergeIntervals(busy);
    return windows.some((w) => slotsFrom(subtract(w, merged), dur, av.stepMin).includes(start));
}
