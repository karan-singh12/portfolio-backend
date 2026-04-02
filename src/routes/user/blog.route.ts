import { Router } from "express";
import * as fxn from "../../controllers/user/blog.controller";

const router = Router();

router.get("/getAllBlogs", fxn.getAllBlogs);
router.get("/getBlogBySlug/:slug", fxn.getBlogBySlug);
router.get("/getFeaturedBlogs", fxn.getFeaturedBlogs);

export default router;
