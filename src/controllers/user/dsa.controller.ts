import { Request, Response, NextFunction } from "express";
import DsaModel from "../../models/dsa.model";
import { successResponseWithData } from "../../utils/apiResponse";
import { ERROR, SUCCESS } from "../../utils/responseMssg";
import { listing } from "../../utils/functions";
import asyncHandler from "express-async-handler";

export const getAllDsa = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { pageNumber = 1, pageSize = 9, searchItem, difficulty, category } = req.query;
        const searchQuery: any = { status: "active" };
        
        if (difficulty) searchQuery.difficulty = difficulty;
        if (category) searchQuery.category = category;
        if (searchItem) {
            const regex = new RegExp((searchItem as string).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
            searchQuery.$or = [{ title: regex }, { question: regex }, { approach: regex }];
        }

        const result = await listing(DsaModel, [], searchQuery, {}, { createdAt: -1 }, Number(pageNumber) - 1, Number(pageSize));
        const totalRecords = await DsaModel.countDocuments(searchQuery);

        successResponseWithData(res, SUCCESS.dataFound, { result, totalRecords, pageNumber: Number(pageNumber), pageSize: Number(pageSize) });
    } catch (error) {
        next(new Error(ERROR.SomethingWrong));
    }
});

export const getOneDsa = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await DsaModel.findOne({ _id: req.params.id, status: "active" });
        if (!result) return next(new Error("Problem not found"));
        successResponseWithData(res, SUCCESS.dataFound, result);
    } catch (error) {
        next(new Error(ERROR.SomethingWrong));
    }
});
