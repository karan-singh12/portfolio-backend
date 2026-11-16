import mongoose, { Schema, Document, Model } from "mongoose";

/** Freelance offerings shown on the freelance portfolio. */
export interface IService extends Document {
    title: string;
    summary: string;
    icon?: string;
    deliverables: string[];
    stack: string[];
    startingAt?: string;
    timeline?: string;
    order: number;
    status: string;
}

const ServiceSchema = new Schema<IService>(
    {
        title: { type: String, required: true },
        summary: { type: String, required: true },
        icon: String,
        deliverables: { type: [String], default: [] },
        stack: { type: [String], default: [] },
        startingAt: String,
        timeline: String,
        order: { type: Number, default: 0 },
        status: { type: String, default: "active" },
    },
    { timestamps: true }
);

const ServiceModel: Model<IService> = mongoose.model<IService>("Service", ServiceSchema);
export default ServiceModel;
