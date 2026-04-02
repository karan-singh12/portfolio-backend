import { Request, Response, NextFunction } from "express";
import DsaModel from "../../../models/dsa.model";
import { successResponseWithData } from "../../../utils/apiResponse";
import { ERROR, SUCCESS } from "../../../utils/responseMssg";
import { listing } from "../../../utils/functions";
import asyncHandler from "express-async-handler";

export const addDsa = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title } = req.body;
        if (!title) return next(new Error("Title is required"));

        const result = await new DsaModel(req.body).save();
        successResponseWithData(res, "DSA Problem added successfully", result);
    } catch (error) {
        next(new Error(ERROR.SomethingWrong));
    }
});

export const getAllDsa = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { pageNumber = 1, pageSize = 10, searchItem, status } = req.body;
        const searchQuery: any = { status: { $ne: "deleted" } };
        
        if (status) searchQuery.status = status;
        if (searchItem) {
            const regex = new RegExp(searchItem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
            searchQuery.$or = [{ title: regex }, { question: regex }];
        }

        const result = await listing(DsaModel, [], searchQuery, {}, { createdAt: -1 }, pageNumber - 1, pageSize);
        const totalRecords = await DsaModel.countDocuments(searchQuery);

        successResponseWithData(res, SUCCESS.dataFound, { result, totalRecords, pageNumber, pageSize });
    } catch (error) {
        next(new Error(ERROR.SomethingWrong));
    }
});

export const getOneDsa = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await DsaModel.findById(req.params.id);
        if (!result) return next(new Error("Not found"));
        successResponseWithData(res, SUCCESS.dataFound, result);
    } catch (error) {
        next(new Error(ERROR.SomethingWrong));
    }
});

export const updateDsa = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.body;
        if (!id) return next(new Error("ID is required"));
        
        const result = await DsaModel.findByIdAndUpdate(id, { $set: req.body }, { new: true });
        if (!result) return next(new Error("Not found"));
        
        successResponseWithData(res, "DSA Problem updated successfully", result);
    } catch (error) {
        next(new Error(ERROR.SomethingWrong));
    }
});

export const deleteDsa = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { ids } = req.body;
        await DsaModel.deleteMany({ _id: { $in: ids } });
        successResponseWithData(res, "Deleted successfully", null);
    } catch (error) {
        next(new Error(ERROR.SomethingWrong));
    }
});
