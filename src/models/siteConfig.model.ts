import mongoose, { Schema, Document, Model } from "mongoose";

/** One document per portfolio ("job" | "freelance"). Lets the owner tweak copy without redeploying. */
export interface ISiteConfig extends Document {
    site: "job" | "freelance";
    headline?: string;
    subheadline?: string;
    availability?: { open: boolean; label: string };
    calendarUrl?: string;
    rates?: { label: string; value: string }[];
    stats?: { label: string; value: string }[];
    extra?: Record<string, unknown>;
}

const SiteConfigSchema = new Schema<ISiteConfig>(
    {
        site: { type: String, enum: ["job", "freelance"], required: true, unique: true },
        headline: String,
        subheadline: String,
        availability: { open: { type: Boolean, default: true }, label: String },
        calendarUrl: String,
        rates: [{ label: String, value: String, _id: false }],
        stats: [{ label: String, value: String, _id: false }],
        extra: { type: Schema.Types.Mixed, default: {} },
    },
    { timestamps: true }
);

const SiteConfigModel: Model<ISiteConfig> = mongoose.model<ISiteConfig>("SiteConfig", SiteConfigSchema);
export default SiteConfigModel;
