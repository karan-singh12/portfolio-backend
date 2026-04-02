"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeStatus = exports.getAllModels = exports.getAboutUsDetails = exports.updateAboutUs = exports.addAboutUs = exports.getAllContent = exports.getOneContent = exports.updateContent = exports.addContent = void 0;
const responseMssg_1 = require("../../../utils/responseMssg");
const apiResponse_1 = require("../../../utils/apiResponse");
const functions_1 = require("../../../utils/functions");
const cms_model_1 = __importDefault(require("../../../models/cms.model"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const aboutUs_model_1 = __importDefault(require("../../../models/aboutUs.model"));
const user_model_1 = __importDefault(require("../../../models/user.model"));
const mongoose_1 = __importDefault(require("mongoose"));
// Add Content
exports.addContent = (0, express_async_handler_1.default)(async (req, res, next) => {
    try {
        // Generate slug
        req.body.slug = await (0, functions_1.slugGenrator)(req.body.contentType || "");
        // Save content details
        const result = await new cms_model_1.default(req.body).save();
        // Send success response
        (0, apiResponse_1.successResponseWithData)(res, responseMssg_1.CONTENT.contentAdded, result);
    }
    catch (error) {
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
});
// Update Content
exports.updateContent = (0, express_async_handler_1.default)(async (req, res, next) => {
    try {
        const { id, title, description, status } = req.body;
        if (!id) {
            return next(new Error("Content ID is required."));
        }
        // Set update object
        const updateData = {
            title,
            description,
            status,
            modifiedAt: Date.now(),
        };
        // Update content details
        const data = await cms_model_1.default.findByIdAndUpdate({ _id: id }, { $set: updateData }, { new: true });
        if (!data) {
            return next(new Error("Content not found."));
        }
        // Determine success message based on slug
        let msg = "";
        switch (data.slug) {
            case process.env.PRIVACY_POLICY:
                msg = responseMssg_1.CONTENT.privacyUpdated;
                break;
            case process.env.TERMS:
                msg = responseMssg_1.CONTENT.termsUpdated;
                break;
            case process.env.ABOUT_US:
                msg = responseMssg_1.CONTENT.aboutUpdated;
                break;
            case process.env.APP_WELCOME_SCREEN:
                msg = responseMssg_1.CONTENT.welcomeUpdated;
                break;
            case process.env.COMMUNITY_GUIDELINES:
                msg = responseMssg_1.CONTENT.communityGuidelinesUpdated;
                break;
            default:
                msg = responseMssg_1.CONTENT.contentUpdated;
                break;
        }
        // Send success response
        (0, apiResponse_1.successResponseWithData)(res, msg, data);
    }
    catch (error) {
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
});
// Get One Content
exports.getOneContent = (0, express_async_handler_1.default)(async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            (0, apiResponse_1.validationError)(res, "Content ID is required.");
            return;
        }
        // Find content details
        const result = await cms_model_1.default.findOne({ _id: id, status: { $ne: 2 } }, { _id: 1, title: 1, description: 1, slug: 1, status: 1 });
        if (!result) {
            (0, apiResponse_1.validationError)(res, "Content not found.");
            return;
        }
        // Send success response
        (0, apiResponse_1.successResponseWithData)(res, responseMssg_1.SUCCESS.dataFound, result);
    }
    catch (error) {
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
});
exports.getAllContent = (0, express_async_handler_1.default)(async (req, res, next) => {
    try {
        const pageSize = req.body.pageSize;
        const pageNumber = Math.max(0, req.body.pageNumber - 1);
        const sort = { createdAt: -1 };
        let searchItem = req.body.searchItem;
        // Set condition
        const searchQuery = {
            status: { $ne: 2 },
        };
        // Search item regex
        const escapedSearchItem = searchItem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(escapedSearchItem, "i");
        // if (searchItem) {
        //     searchQuery.$or = [
        //         { name: regex },
        //         { matchId: regex },
        //     ];
        // }
        // Update the contentType argument if it's expected to be an array
        const contentTypeArray = req.body.contentType ? [req.body.contentType] : [];
        // Find all category details
        const result = await (0, functions_1.listing)(cms_model_1.default, contentTypeArray, searchQuery, {
            _id: 1,
            title: 1,
            contentType: 1,
            slug: 1,
            createdAt: 1,
            status: 1,
            image: 1,
            description: 1,
        }, sort, pageNumber, pageSize);
        const totalRecords = await cms_model_1.default.countDocuments(searchQuery);
        // Send success response
        (0, apiResponse_1.successResponseWithData)(res, responseMssg_1.SUCCESS.dataFound, {
            result,
            totalRecords,
            pageNumber: req.body.pageNumber,
            pageSize,
        });
    }
    catch (error) {
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
});
exports.addAboutUs = (0, express_async_handler_1.default)(async (req, res, next) => {
    try {
        // Save content details
        const result = await new aboutUs_model_1.default(req.body).save();
        // Send success response
        (0, apiResponse_1.successResponseWithData)(res, responseMssg_1.CONTENT.contentAdded, result);
    }
    catch (error) {
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
});
// Update Content
exports.updateAboutUs = (0, express_async_handler_1.default)(async (req, res, next) => {
    try {
        const { id, title, description, status, ourMission, ourVission, models } = req.body;
        if (!id) {
            (0, apiResponse_1.errorResponse)(res, responseMssg_1.ERROR.NoDataFound);
            return;
        }
        const modelIds = Array.isArray(models) ? models.map((id) => new mongoose_1.default.Types.ObjectId(id)) : [];
        // Set update object
        const updateData = {
            title,
            ourMission,
            ourVission,
            description,
            status,
            models: modelIds,
            modifiedAt: Date.now(),
        };
        // Update content details
        const data = await aboutUs_model_1.default.findByIdAndUpdate({ _id: id }, { $set: updateData }, { new: true });
        // Send success response
        (0, apiResponse_1.successResponseWithData)(res, responseMssg_1.CONTENT.aboutUpdated, data);
    }
    catch (error) {
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
});
// Get One Content
exports.getAboutUsDetails = (0, express_async_handler_1.default)(async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            (0, apiResponse_1.errorResponse)(res, responseMssg_1.ERROR.NoDataFound);
            return;
        }
        // Find content details
        const result = await aboutUs_model_1.default.findOne({ _id: id }, { _id: 1, title: 1, ourMission: 1, ourVission: 1, description: 1, models: 1 });
        // Send success response
        (0, apiResponse_1.successResponseWithData)(res, responseMssg_1.SUCCESS.dataFound, result);
    }
    catch (error) {
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
});
exports.getAllModels = (0, express_async_handler_1.default)(async (req, res, next) => {
    try {
        const searchQuery = { status: { $ne: 2 }, role: "model", profileCompleted: { $ne: false }, isVerified: { $ne: false } };
        const result = await user_model_1.default.find(searchQuery, {
            _id: 1, username: 1
        }).sort({ createdAt: -1 });
        (0, apiResponse_1.successResponseWithData)(res, responseMssg_1.SUCCESS.dataFound, { result });
    }
    catch (error) {
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
});
const changeStatus = async (req, res, next) => {
    try {
        if (!req.body.id)
            return next(new Error("User ID is required."));
        const result = await cms_model_1.default.findOneAndUpdate({ _id: req.body.id }, { $set: { status: req.body.status, modifiedAt: new Date() } }, { new: true });
        if (!result)
            return next(new Error("User not found."));
        const msg = req.body.status == 1 ? responseMssg_1.CONTENT.userActivated : responseMssg_1.CONTENT.userDeactivated;
        (0, apiResponse_1.successResponseWithData)(res, msg, result);
    }
    catch (error) {
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
};
exports.changeStatus = changeStatus;
