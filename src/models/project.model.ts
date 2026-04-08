import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProject extends Document {
    title: string;
    description: string;
    thumbnail: string;
    link: {
        text: string;
        href: string;
    };
    status: string; // "active" | "inactive" | "deleted"
    category?: string;
    whatIDid?: string[];
    createdAt: Date;
    updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        thumbnail: { type: String, required: true },
        link: {
            text: { type: String, default: "View Project" },
            href: { type: String, required: true }
        },
        status: { type: String, default: "active" },
        category: { type: String },
        whatIDid: { type: [String], default: [] }
    },
    { timestamps: true }
);

const ProjectModel: Model<IProject> = mongoose.model<IProject>("Project", ProjectSchema);
export default ProjectModel;
