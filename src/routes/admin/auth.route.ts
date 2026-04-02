import { Router } from "express";
import * as fxn from "../../controllers/admin/access-management/auth.controller";
import auth from "../../middleware/auth.middleware";
import upload from "../../middleware/uploads.middleware";

const router = Router();

router.post("/addAdmin", fxn.addAdmin);

router.post("/login", fxn.loginAdmin);

router.post("/forgotPassword", fxn.forgotPassword);

router.post("/resetPassword", fxn.resetPassword);

router.post('/editProfile', auth, upload.fields([{ name: 'resume', maxCount: 1 }, { name: 'avatar', maxCount: 1 }]), fxn.editProfile);

router.get("/getAdminDetails", auth, fxn.getAdminDetails);

router.post("/changePassword", auth, fxn.changePassword);

export default router;
