import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDsa extends Document {
    title: string;
    difficulty: string; // "Easy" | "Medium" | "Hard"
    question: string;
    description?: string;
    status: string; // "active" | "inactive"
    solutions: any[];
    createdAt: Date;
    updatedAt: Date;
}

const DsaSchema: Schema<IDsa> = new Schema(
    {
        title: { type: String, required: true },
        difficulty: { type: String, default: 'Medium' },
        question: { type: String, required: true },
        description: { type: String },
        status: { type: String, default: 'active' },
        solutions: { type: [], default: [] }
    },
    { timestamps: true }
);

const DsaModel: Model<IDsa> = mongoose.model<IDsa>("Dsa", DsaSchema);
export default DsaModel;
