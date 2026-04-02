import { Request, Response, NextFunction } from "express";
import BlogModel from "../../models/blog.model";
import { successResponseWithData } from "../../utils/apiResponse";
import { ERROR, SUCCESS } from "../../utils/responseMssg";
import { listing } from "../../utils/functions";
import asyncHandler from "express-async-handler";

export const getAllBlogs = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { pageNumber = 1, pageSize = 12, searchItem, category } = req.query;
        const searchQuery: any = { status: "active" };
        
        if (category) searchQuery.category = category;
        if (searchItem) {
            const regex = new RegExp((searchItem as string).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
            searchQuery.$or = [{ title: regex }, { subtitle: regex }, { content: regex }];
        }

        const result = await listing(BlogModel, [], searchQuery, {}, { createdAt: -1 }, Number(pageNumber) - 1, Number(pageSize));
        const totalRecords = await BlogModel.countDocuments(searchQuery);

        successResponseWithData(res, SUCCESS.dataFound, { result, totalRecords, pageNumber: Number(pageNumber), pageSize: Number(pageSize) });
    } catch (error) {
        next(new Error(ERROR.SomethingWrong));
    }
});

export const getBlogBySlug = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await BlogModel.findOne({ slug: req.params.slug, status: "active" });
        if (!result) return next(new Error("Blog not found"));
        
        // Increment view count
        await BlogModel.findByIdAndUpdate(result._id, { $inc: { viewCount: 1 } });
        
        successResponseWithData(res, SUCCESS.dataFound, result);
    } catch (error) {
        next(new Error(ERROR.SomethingWrong));
    }
});

export const getFeaturedBlogs = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await BlogModel.find({ status: 'active', isFeatured: true }).limit(5).sort({ createdAt: -1 });
        successResponseWithData(res, SUCCESS.dataFound, result);
    } catch (error) {
        next(new Error(ERROR.SomethingWrong));
    }
});
