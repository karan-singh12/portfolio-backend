import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.config";
import { addAdminServices } from "../services/admin/auth.service";

// Load environment variables
dotenv.config();

const run = async () => {
    try {
        console.log("Connecting to database...");
        await connectDB();

        const name = "Admin";
        const email = "kschouhan735@gmail.com";
        const password = "Karan@1212";
        const role = "superadmin";

        console.log(`Creating admin account for: ${email}...`);
        const admin = await addAdminServices(name, email, password, role);
        console.log("Success! Admin account created:", admin.email);

        await mongoose.connection.close();
        console.log("Database connection closed.");
        process.exit(0);
    } catch (error: any) {
        if (error.message.includes("already exists")) {
            console.log("Notice: Admin with this email already exists.");
            process.exit(0);
        }
        console.error("Error creating admin:", error.message);
        process.exit(1);
    }
};

run();
