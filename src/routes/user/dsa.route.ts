import { Router } from "express";
import * as fxn from "../../controllers/user/dsa.controller";

const router = Router();

router.get("/getAllDsa", fxn.getAllDsa);
router.get("/getOneDsa/:id", fxn.getOneDsa);

export default router;
