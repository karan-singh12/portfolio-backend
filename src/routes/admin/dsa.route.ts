import { Router } from "express";
import * as fxn from "../../controllers/admin/cms-management/dsa.controller";
import auth from "../../middleware/auth.middleware";

const router = Router();

router.post("/addDsa", auth, fxn.addDsa);
router.post("/getAllDsa", auth, fxn.getAllDsa);
router.get("/getOneDsa/:id", auth, fxn.getOneDsa);
router.post("/updateDsa", auth, fxn.updateDsa);
router.post("/deleteDsa", auth, fxn.deleteDsa);

export default router;
