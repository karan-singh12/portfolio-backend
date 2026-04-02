"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addAdminServices = void 0;
const admin_model_1 = __importDefault(require("../../models/admin.model"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Function to add a new admin
const addAdminServices = async (name, email, password, role = "admin") => {
    // Check if admin with the same email exists
    const existingAdmin = await admin_model_1.default.findOne({ email });
    if (existingAdmin) {
        throw new Error("Admin with this email already exists.");
    }
    // Hash the password
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    // Create a new admin
    const admin = new admin_model_1.default({
        name,
        email,
        password: hashedPassword,
        role,
    });
    // Save the admin to the database
    return await admin.save();
};
exports.addAdminServices = addAdminServices;
