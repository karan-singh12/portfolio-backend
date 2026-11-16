import mongoose, { Schema, Document, Model } from "mongoose";

/** Contact / inquiry submissions from either portfolio. */
export interface ILead extends Document {
    source: "job" | "freelance";
    name: string;
    email: string;
    company?: string;
    message: string;
    budget?: string;
    timeline?: string;
    projectType?: string;
    ip?: string;
    status: string;
}

const LeadSchema = new Schema<ILead>(
    {
        source: { type: String, enum: ["job", "freelance"], required: true, index: true },
        name: { type: String, required: true, maxlength: 120 },
        email: { type: String, required: true, maxlength: 200 },
        company: { type: String, maxlength: 160 },
        message: { type: String, required: true, maxlength: 4000 },
        budget: String,
        timeline: String,
        projectType: String,
        ip: String,
        status: { type: String, default: "new" },
    },
    { timestamps: true }
);

const LeadModel: Model<ILead> = mongoose.model<ILead>("Lead", LeadSchema);
export default LeadModel;
