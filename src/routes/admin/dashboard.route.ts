import { Router } from "express";
import * as fxn from "../../controllers/admin/dashboard.controller";
import auth from "../../middleware/auth.middleware";

const router = Router();

router.get("/overview", fxn.getOverview);

export default router;
