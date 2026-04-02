import mongoose, { Schema, Document, Model } from "mongoose";

export interface IExperience extends Document {
    company: string;
    role: string;
    logo?: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    technologies: string[];
    description: string;
    status: string; // "active" | "inactive"
    createdAt: Date;
    updatedAt: Date;
}

const ExperienceSchema: Schema<IExperience> = new Schema(
    {
        company: { type: String, required: true },
        role: { type: String, required: true },
        logo: { type: String },
        location: { type: String },
        startDate: { type: String, required: true },
        endDate: { type: String },
        current: { type: Boolean, default: false },
        technologies: [{ type: String }],
        description: { type: String, required: true },
        status: { type: String, default: 'active' }
    },
    { timestamps: true }
);

const ExperienceModel: Model<IExperience> = mongoose.model<IExperience>("Experience", ExperienceSchema);
export default ExperienceModel;
