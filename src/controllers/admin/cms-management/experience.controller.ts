import { Request, Response, NextFunction } from "express";
import ExperienceModel from "../../../models/experience.model";
import { successResponseWithData } from "../../../utils/apiResponse";
import { ERROR, SUCCESS } from "../../../utils/responseMssg";
import { listing } from "../../../utils/functions";
import asyncHandler from "express-async-handler";
import { uploadToCloudinary } from "../../../services/cloudinary.service";

export const addExperience = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { company, role } = req.body;
        if (!company || !role) return next(new Error("Company and Role are required"));

        // Handle Cloudinary upload for logo
        if (req.body.logo && req.body.logo.startsWith('data:')) {
            req.body.logo = await uploadToCloudinary(req.body.logo, 'experience/logos');
        }

        const result = await new ExperienceModel(req.body).save();
        successResponseWithData(res, "Experience added successfully", result);
    } catch (error) {
        next(new Error(ERROR.SomethingWrong));
    }
});

export const getAllExperience = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { pageNumber = 1, pageSize = 10, searchItem, status } = req.body;
        const searchQuery: any = { status: { $ne: "deleted" } };
        
        if (status) searchQuery.status = status;
        if (searchItem) {
            const regex = new RegExp(searchItem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
            searchQuery.$or = [{ company: regex }, { role: regex }];
        }

        const result = await listing(ExperienceModel, [], searchQuery, {}, { createdAt: -1 }, pageNumber - 1, pageSize);
        const totalRecords = await ExperienceModel.countDocuments(searchQuery);

        successResponseWithData(res, SUCCESS.dataFound, { result, totalRecords, pageNumber, pageSize });
    } catch (error) {
        next(new Error(ERROR.SomethingWrong));
    }
});

export const getOneExperience = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await ExperienceModel.findById(req.params.id);
        if (!result) return next(new Error("Not found"));
        successResponseWithData(res, SUCCESS.dataFound, result);
    } catch (error) {
        next(new Error(ERROR.SomethingWrong));
    }
});

export const updateExperience = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.body;
        if (!id) return next(new Error("ID is required"));

        // Handle Cloudinary upload for logo
        if (req.body.logo && req.body.logo.startsWith('data:')) {
            req.body.logo = await uploadToCloudinary(req.body.logo, 'experience/logos');
        }
        
        const result = await ExperienceModel.findByIdAndUpdate(id, { $set: req.body }, { new: true });
        if (!result) return next(new Error("Not found"));
        
        successResponseWithData(res, "Experience updated successfully", result);
    } catch (error) {
        next(new Error(ERROR.SomethingWrong));
    }
});

export const deleteExperience = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { ids } = req.body;
        await ExperienceModel.deleteMany({ _id: { $in: ids } });
        successResponseWithData(res, "Deleted successfully", null);
    } catch (error) {
        next(new Error(ERROR.SomethingWrong));
    }
});
