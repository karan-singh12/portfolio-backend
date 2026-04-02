import { Request, Response, NextFunction } from "express";
import ProjectModel from "../../../models/project.model";
import { successResponseWithData } from "../../../utils/apiResponse";
import { ERROR, SUCCESS } from "../../../utils/responseMssg";
import { listing } from "../../../utils/functions";
import asyncHandler from "express-async-handler";

export const addProject = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, link } = req.body;
        if (!title || !link || !link.href) return next(new Error("Title and Link Href are required"));
        
        const result = await new ProjectModel(req.body).save();
        successResponseWithData(res, "Project added successfully", result);
    } catch (error) {
        next(new Error(ERROR.SomethingWrong));
    }
});

export const getAllProjects = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { pageNumber = 1, pageSize = 10, searchItem, status } = req.body;
        const searchQuery: any = { status: { $ne: "deleted" } };
        
        if (status) searchQuery.status = status;
        if (searchItem) {
            const regex = new RegExp(searchItem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
            searchQuery.$or = [{ title: regex }, { description: regex }];
        }

        const result = await listing(ProjectModel, [], searchQuery, {}, { createdAt: -1 }, pageNumber - 1, pageSize);
        const totalRecords = await ProjectModel.countDocuments(searchQuery);

        successResponseWithData(res, SUCCESS.dataFound, { result, totalRecords, pageNumber, pageSize });
    } catch (error) {
        next(new Error(ERROR.SomethingWrong));
    }
});

export const getOneProject = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await ProjectModel.findById(req.params.id);
        if (!result) return next(new Error("Not found"));
        successResponseWithData(res, SUCCESS.dataFound, result);
    } catch (error) {
        next(new Error(ERROR.SomethingWrong));
    }
});

export const updateProject = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.body;
        if (!id) return next(new Error("ID is required"));
        
        const result = await ProjectModel.findByIdAndUpdate(id, { $set: req.body }, { new: true });
        if (!result) return next(new Error("Not found"));
        
        successResponseWithData(res, "Project updated successfully", result);
    } catch (error) {
        next(new Error(ERROR.SomethingWrong));
    }
});

export const changeProjectStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, status } = req.body;
        const result = await ProjectModel.findByIdAndUpdate(id, { $set: { status } }, { new: true });
        successResponseWithData(res, "Status updated", result);
    } catch (error) {
        next(new Error(ERROR.SomethingWrong));
    }
});

export const deleteProjects = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { ids } = req.body;
        await ProjectModel.deleteMany({ _id: { $in: ids } });
        successResponseWithData(res, "Deleted successfully", null);
    } catch (error) {
        next(new Error(ERROR.SomethingWrong));
    }
});
