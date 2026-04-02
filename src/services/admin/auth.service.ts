import AdminModel, { IAdmin } from "../../models/admin.model";
import bcrypt from "bcryptjs";

// Function to add a new admin
export const addAdminServices = async (name: string, email: string, password: string, role: string = "admin") => {
    // Check if admin with the same email exists
    const existingAdmin = await AdminModel.findOne({ email });
    if (existingAdmin) {
        throw new Error("Admin with this email already exists.");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new admin
    const admin = new AdminModel({
        name,
        email,
        password: hashedPassword,
        role,
    });

    // Save the admin to the database
    return await admin.save();
};
