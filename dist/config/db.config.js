"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
let connection;
const connectDB = async () => {
    try {
        const url = process.env.DB_URL;
        console.log(url);
        if (!url) {
            throw new Error("Database URL is not defined in environment variables");
        }
        // Set strictQuery to false for compatibility with Mongoose 7
        mongoose_1.default.set("strictQuery", false);
        await mongoose_1.default.connect(url, {
            user: process.env.DB_USER,
            pass: process.env.DB_PASS,
        });
        connection = mongoose_1.default.connection;
        connection.on("error", (err) => {
            console.error(`Database connection error: ${err.message}`);
        });
        connection.once("open", () => {
            console.log("Database connection successful");
        });
    }
    catch (error) {
        console.error("Failed to connect to the database:", error);
    }
};
exports.default = connectDB;
