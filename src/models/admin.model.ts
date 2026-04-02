import mongoose, { Schema, Document, Types } from "mongoose";

// Define the Admin interface
export interface IAdmin extends Document {
    name: string;
    email: string;
    password: string;
    phoneNumber?: string;
    resumeUrl?: string;
    avatarUrl?: string;
    role: string;
    permission?: Types.ObjectId;
    createdAt: Date;
    status: number;
    resetPasswordToken?: string;
    resetPasswordExpire?: Date;
}

// Define the Admin Schema
const AdminSchema = new Schema<IAdmin>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        phoneNumber: { type: String },
        resumeUrl: { type: String },
        avatarUrl: { type: String },
        password: { type: String, required: true },
        role: { type: String, enum: ["admin", "subadmin", "superadmin"], default: "admin" },
        permission: {
            type: Schema.Types.ObjectId,
            ref: 'Permissions',
        },
        status: {
            type: Number,
            enum: [0, 1, 2],
            default: 1
        },
        createdAt: { type: Date, default: Date.now },
        resetPasswordToken: { type: String },
        resetPasswordExpire: { type: Date }
    },
    { timestamps: true }
);

// Export the Admin model
const AdminModel = mongoose.model<IAdmin>("Admin", AdminSchema);
export default AdminModel;
