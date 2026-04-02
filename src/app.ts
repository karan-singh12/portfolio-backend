import express, { Application } from "express";
import routes from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.middleware";
import connectDB from "./config/db.config";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import bodyParser from "body-parser";

dotenv.config();

const app: Application = express();

// Middleware
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

app.use("/public", express.static("public"));
app.use(morgan("dev"));
app.use(cors());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.use("/api/v1", routes);

// Handle 404 routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
