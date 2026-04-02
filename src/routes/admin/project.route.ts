import { Router } from "express";
import {
    addProject,
    getAllProjects,
    getOneProject,
    updateProject,
    changeProjectStatus,
    deleteProjects
} from "../../controllers/admin/cms-management/project.controller";

const projectRoutes = Router();

projectRoutes.post("/addProject", addProject);
projectRoutes.post("/getAllProjects", getAllProjects);
projectRoutes.get("/getOneProject/:id", getOneProject);
projectRoutes.patch("/updateProject", updateProject);
projectRoutes.patch("/changeProjectStatus", changeProjectStatus);
projectRoutes.delete("/deleteProjects", deleteProjects);

export default projectRoutes;
