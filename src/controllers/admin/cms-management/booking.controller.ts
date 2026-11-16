import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import BookingModel from "../../../models/booking.model";
import { successResponseWithData } from "../../../utils/apiResponse";
import { SUCCESS } from "../../../utils/responseMssg";

/**
 * Interviews / calls booked from the portfolio. Admin only (see routes/admin/booking.route.ts).
 * tab: "upcoming" (confirmed, not yet ended) | "past" (confirmed, ended) | "cancelled" | "all"
 */
export const getAllBookings = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { tab = "upcoming", pageNumber = 1, pageSize = 20, searchItem } = req.body || {};
    const now = new Date();
    const q: any = {};
    if (tab === "upcoming") Object.assign(q, { status: "confirmed", end: { $gte: now } });
    else if (tab === "past") Object.assign(q, { status: "confirmed", end: { $lt: now } });
    else if (tab === "cancelled") q.status = "cancelled";
    if (searchItem) {
        const rx = new RegExp(String(searchItem).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
        q.$or = [{ name: rx }, { email: rx }, { notes: rx }];
    }
    const page = Math.max(1, Number(pageNumber) || 1);
    const size = Math.min(100, Math.max(1, Number(pageSize) || 20));
    const sort: any = tab === "upcoming" ? { start: 1 } : { start: -1 };

    const [result, totalRecords, upcomingCount] = await Promise.all([
        BookingModel.find(q).sort(sort).skip((page - 1) * size).limit(size).lean(),
        BookingModel.countDocuments(q),
        BookingModel.countDocuments({ status: "confirmed", end: { $gte: now } }),
    ]);
    successResponseWithData(res, SUCCESS.dataFound, { result, totalRecords, upcomingCount, pageNumber: page, pageSize: size });
});

/** Cancelling frees the time slot again (only "confirmed" bookings block the calendar). */
export const updateBookingStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id, status } = req.body || {};
    if (!id || !["confirmed", "cancelled"].includes(status)) return next(new Error("id and a valid status are required"));
    const doc = await BookingModel.findByIdAndUpdate(id, { status }, { new: true }).lean();
    if (!doc) return next(new Error("Booking not found"));
    successResponseWithData(res, "Booking updated", doc);
});

export const deleteBooking = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.body || {};
    if (!id) return next(new Error("id is required"));
    const out = await BookingModel.deleteOne({ _id: id });
    if (!out.deletedCount) return next(new Error("Booking not found"));
    successResponseWithData(res, "Booking deleted", { id });
});
