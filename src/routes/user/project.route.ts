import { Router } from "express";
import {
    getAllProjects,
    getOneProject
} from "../../controllers/admin/cms-management/project.controller";

const projectRoutes = Router();

// Public routes for fetching projects
projectRoutes.get("/getAllProjects", getAllProjects);
projectRoutes.post("/getAllProjects", getAllProjects); // Also allow POST for pagination if needed
projectRoutes.get("/getOneProject/:id", getOneProject);

export default projectRoutes;
