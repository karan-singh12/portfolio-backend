import { Router } from "express";
import * as fxn from "../../controllers/admin/cms-management/experience.controller";
import auth from "../../middleware/auth.middleware";

const router = Router();

router.post("/addExperience", auth, fxn.addExperience);
router.post("/getAllExperience", auth, fxn.getAllExperience);
router.get("/getOneExperience/:id", auth, fxn.getOneExperience);
router.post("/updateExperience", auth, fxn.updateExperience);
router.post("/deleteExperience", auth, fxn.deleteExperience);

export default router;
