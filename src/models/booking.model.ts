import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBooking extends Document {
    start: Date;
    end: Date;
    durationMin: number;
    name: string;
    email: string;
    notes?: string;
    tz?: string;
    status: "confirmed" | "cancelled";
    source: string;
}

const BookingSchema = new Schema<IBooking>(
    {
        start: { type: Date, required: true, index: true },
        end: { type: Date, required: true },
        durationMin: { type: Number, required: true },
        name: { type: String, required: true, maxlength: 120 },
        email: { type: String, required: true, maxlength: 200 },
        notes: { type: String, maxlength: 2000 },
        tz: String,
        status: { type: String, enum: ["confirmed", "cancelled"], default: "confirmed", index: true },
        source: { type: String, default: "freelance" },
    },
    { timestamps: true }
);

const BookingModel: Model<IBooking> = mongoose.model<IBooking>("Booking", BookingSchema);
export default BookingModel;
