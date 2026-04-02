import { Request, Response, NextFunction } from "express";
import BlogModel from "../../models/blog.model";
import DsaModel from "../../models/dsa.model";
import ExperienceModel from "../../models/experience.model";
import { successResponseWithData } from "../../utils/apiResponse";
import { ERROR, SUCCESS } from "../../utils/responseMssg";
import asyncHandler from "express-async-handler";

export const getOverview = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [totalBlogs, totalDSA, totalExperience] = await Promise.all([
            BlogModel.countDocuments({ status: { $ne: "deleted" } }),
            DsaModel.countDocuments({ status: { $ne: "deleted" } }),
            ExperienceModel.countDocuments({ status: { $ne: "deleted" } })
        ]);

        successResponseWithData(res, SUCCESS.dataFound, {
            totalBlogs,
            totalDSA,
            totalExperience,
            totalViews: "0" // Placeholder or implement view tracking if needed
        });
    } catch (error) {
        next(new Error(ERROR.SomethingWrong));
    }
});
