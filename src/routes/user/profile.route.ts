import { Router } from "express";
import Admin from "../../models/admin.model";
import { successResponseWithData } from "../../utils/apiResponse";
import { SUCCESS, ERROR } from "../../utils/responseMssg";
import asyncHandler from "express-async-handler";

const profileRoutes = Router();

// Public route to get the admin's profile (specifically the resume)
profileRoutes.get("/getDetails", asyncHandler(async (req, res, next) => {
    try {
        // Since there's only one admin/owner for the portfolio, we fetch the first one
        const result = await Admin.findOne({}, { name: 1, email: 1, phoneNumber: 1, resumeUrl: 1, avatarUrl: 1 });
        if (!result) return next(new Error("Profile not found"));
        successResponseWithData(res, SUCCESS.dataFound, result);
    } catch (error) {
        next(new Error(ERROR.SomethingWrong));
    }
}));

export default profileRoutes;
