import { Router } from "express";
import blogRoutes from "./blog.route";
import dsaRoutes from "./dsa.route";
import projectRoutes from "./project.route";
import profileRoutes from "./profile.route";

import siteRoutes from "./site.route";

const userRouter = Router();
userRouter.use("/site", siteRoutes);

userRouter.use("/blog", blogRoutes);
userRouter.use("/dsa", dsaRoutes);
userRouter.use("/project", projectRoutes);
userRouter.use("/profile", profileRoutes);

export default userRouter;