import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBlog extends Document {
    title: string;
    subtitle?: string;
    slug: string;
    thumbnail?: string;
    author: string;
    category?: string;
    status: string; // "active" | "inactive"
    sections: any[]; 
    createdAt: Date;
    updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>(
    {
        title: { type: String, required: true },
        subtitle: { type: String },
        slug: { type: String, required: true, unique: true },
        thumbnail: { type: String },
        author: { type: String, default: 'Admin' },
        status: { type: String, default: 'active' },
        sections: { type: [], default: [] }
    },
    { timestamps: true }
);

const BlogModel: Model<IBlog> = mongoose.model<IBlog>("Blog", BlogSchema);
export default BlogModel;
