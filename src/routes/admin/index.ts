import { Router } from "express";
import authRoutes from "./auth.route";
import blogRoutes from "./blog.route";
import dsaRoutes from "./dsa.route";
import experienceRoutes from "./experience.route";
import dashboardRoutes from "./dashboard.route";
import projectRoutes from "./project.route";

const adminRouter = Router();

adminRouter.use("/auth", authRoutes);
adminRouter.use("/dashboard", dashboardRoutes);
adminRouter.use("/blog", blogRoutes);
adminRouter.use("/dsa", dsaRoutes);
adminRouter.use("/experience", experienceRoutes);
adminRouter.use("/project", projectRoutes);

export default adminRouter;