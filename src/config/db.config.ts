import mongoose from "mongoose";
import dns from "node:dns";

// Set default DNS resolution to prioritize IPv4 over IPv6
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

let connection: mongoose.Connection;

const connectDB = async (): Promise<void> => {
  try {
    const url = process.env.DB_URL as string;

    if (!url) {
      throw new Error("Database URL is not defined in environment variables");
    }

    // Set strictQuery to false for compatibility with Mongoose 7
    mongoose.set("strictQuery", false);

    await mongoose.connect(url, {
      user: process.env.DB_USER,
      pass: process.env.DB_PASS,
    });

    connection = mongoose.connection;
    console.log('connected');

    connection.on("error", (err: Error) => {
      console.error(`Database connection error: ${err.message}`);
    });

    connection.once("open", () => {
      console.log("Database connection successful");
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error);
  }
};

export default connectDB;

