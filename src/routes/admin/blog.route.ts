import { Router } from "express";
import * as fxn from "../../controllers/admin/cms-management/blog.controller";
import auth from "../../middleware/auth.middleware";

const router = Router();

router.post("/addBlog", auth, fxn.addBlog);
router.post("/getAllBlogs", auth, fxn.getAllBlogs);
router.get("/getOneBlog/:id", auth, fxn.getOneBlog);
router.get("/getBlogBySlug/:slug", auth, fxn.getBlogBySlug);
router.post("/updateBlog", auth, fxn.updateBlog);
router.post("/changeBlogStatus", auth, fxn.changeBlogStatus);
router.post("/likeBlog", auth, fxn.likeBlog);
router.post("/deleteBlogs", auth, fxn.deleteBlogs);
router.post("/getFeaturedBlogs", auth, fxn.getFeaturedBlogs);
router.post("/getRelatedBlogs", auth, fxn.getRelatedBlogs);

export default router;
