import { Request, Response, NextFunction } from "express";
import BlogModel from "../../../models/blog.model";
import { successResponseWithData } from "../../../utils/apiResponse";
import { ERROR, SUCCESS } from "../../../utils/responseMssg";
import { listing } from "../../../utils/functions";
import asyncHandler from "express-async-handler";

export const addBlog = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, slug } = req.body;
        if (!title) return next(new Error("Title is required"));
        
        // Generate slug if missing
        const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        
        const existing = await BlogModel.findOne({ slug: finalSlug });
        if (existing) return next(new Error("Slug already exists"));

        const result = await new BlogModel({ ...req.body, slug: finalSlug }).save();
        successResponseWithData(res, "Blog added successfully", result);
    } catch (error) {
        next(new Error(ERROR.SomethingWrong));
    }
});

export const getAllBlogs = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { pageNumber = 1, pageSize = 10, searchItem, status } = req.body;
        const searchQuery: any = { status: { $ne: "deleted" } };
        
        if (status) searchQuery.status = status;
        if (searchItem) {
            const regex = new RegExp(searchItem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
            searchQuery.$or = [{ title: regex }, { subtitle: regex }];
        }

        const result = await listing(BlogModel, [], searchQuery, {}, { createdAt: -1 }, pageNumber - 1, pageSize);
        const totalRecords = await BlogModel.countDocuments(searchQuery);

        successResponseWithData(res, SUCCESS.dataFound, { result, totalRecords, pageNumber, pageSize });
    } catch (error) {
        next(new Error(ERROR.SomethingWrong));
    }
});

export const getOneBlog = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await BlogModel.findById(req.params.id);
        if (!result) return next(new Error("Not found"));
        successResponseWithData(res, SUCCESS.dataFound, result);
    } catch (error) {
        next(new Error(ERROR.SomethingWrong));
    }
});

export const getBlogBySlug = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await BlogModel.findOne({ slug: req.params.slug });
        if (!result) return next(new Error("Not found"));
        successResponseWithData(res, SUCCESS.dataFound, result);
    } catch (error) {
        next(new Error(ERROR.SomethingWrong));
    }
});

export const updateBlog = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.body;
        if (!id) return next(new Error("ID is required"));
        
        const result = await BlogModel.findByIdAndUpdate(id, { $set: req.body }, { new: true });
        if (!result) return next(new Error("Not found"));
        
        successResponseWithData(res, "Blog updated successfully", result);
    } catch (error) {
        next(new Error(ERROR.SomethingWrong));
    }
});

export const changeBlogStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, status } = req.body;
        const result = await BlogModel.findByIdAndUpdate(id, { $set: { status } }, { new: true });
        successResponseWithData(res, "Status updated", result);
    } catch (error) {
        next(new Error(ERROR.SomethingWrong));
    }
});

export const likeBlog = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.body;
        const result = await BlogModel.findByIdAndUpdate(id, { $inc: { likeCount: 1 } }, { new: true });
        successResponseWithData(res, "Liked", result);
    } catch (error) {
        next(new Error(ERROR.SomethingWrong));
    }
});

export const deleteBlogs = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { ids } = req.body;
        await BlogModel.deleteMany({ _id: { $in: ids } });
        successResponseWithData(res, "Deleted successfully", null);
    } catch (error) {
        next(new Error(ERROR.SomethingWrong));
    }
});

export const getFeaturedBlogs = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await BlogModel.find({ status: 'active' }).limit(5);
        successResponseWithData(res, SUCCESS.dataFound, result);
    } catch (error) {
        next(new Error(ERROR.SomethingWrong));
    }
});

export const getRelatedBlogs = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await BlogModel.find({ status: 'active' }).limit(4);
        successResponseWithData(res, SUCCESS.dataFound, result);
    } catch (error) {
        next(new Error(ERROR.SomethingWrong));
    }
});
