"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeFaqStatus = exports.deleteFaq = exports.getOneFaq = exports.updateFaq = exports.addFaq = exports.getAllFaqs = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const faq_model_1 = __importDefault(require("../../../models/faq.model"));
const apiResponse_1 = require("../../../utils/apiResponse");
const functions_1 = require("../../../utils/functions");
const responseMssg_1 = require("../../../utils/responseMssg");
// Get All faqs
exports.getAllFaqs = (0, express_async_handler_1.default)(async (req, res, next) => {
    try {
        const pageSize = req.body.pageSize;
        const pageNumber = Math.max(0, req.body.pageNumber - 1);
        const searchItem = req.body.searchItem;
        const sort = { createdAt: -1 };
        // Set condition
        const searchQuery = { status: { $ne: 2 } };
        // Filter by status
        if (req.body.status && req.body.status.length > 0) {
            searchQuery.status = { $in: req.body.status };
        }
        // Search by title
        if (searchItem) {
            const regex = new RegExp(searchItem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
            searchQuery.$or = [{ title: regex }];
        }
        // Find all FAQ details
        const result = await (0, functions_1.listing)(faq_model_1.default, [], searchQuery, {
            _id: 1,
            title: 1,
            description: 1,
            createdAt: 1,
            status: 1
        }, sort, pageNumber, pageSize);
        const totalRecords = await faq_model_1.default.countDocuments(searchQuery);
        (0, apiResponse_1.successResponseWithData)(res, responseMssg_1.SUCCESS.dataFound, { result, totalRecords, pageNumber: req.body.pageNumber, pageSize });
    }
    catch (error) {
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
});
// Add faqs
exports.addFaq = (0, express_async_handler_1.default)(async (req, res, next) => {
    try {
        const result = await new faq_model_1.default(req.body).save();
        (0, apiResponse_1.successResponseWithData)(res, responseMssg_1.FAQ.faqAdded, result);
    }
    catch (error) {
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
});
// Update faqs
exports.updateFaq = (0, express_async_handler_1.default)(async (req, res, next) => {
    try {
        if (!req.body.id)
            return next(new Error("FAQ ID is required."));
        const result = await faq_model_1.default.findOne({ _id: req.body.id, status: { $ne: 2 } });
        if (!result) {
            (0, apiResponse_1.validationError)(res, "FAQ not found.");
            return;
        }
        const updateData = {
            title: req.body.title,
            description: req.body.description,
            status: req.body.status,
            modifiedAt: Date.now(),
        };
        const data = await faq_model_1.default.findByIdAndUpdate({ _id: req.body.id }, { $set: updateData }, { new: true });
        if (!data)
            return next(new Error("FAQ not found."));
        (0, apiResponse_1.successResponseWithData)(res, responseMssg_1.FAQ.faqUpdated, data);
    }
    catch (error) {
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
});
// Get One faq
exports.getOneFaq = (0, express_async_handler_1.default)(async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            (0, apiResponse_1.validationError)(res, "FAQ ID is required.");
            return;
        }
        const result = await faq_model_1.default.findOne({ _id: id, status: { $ne: 2 } }, { _id: 1, title: 1, description: 1, status: 1 });
        if (!result) {
            (0, apiResponse_1.validationError)(res, "FAQ not found.");
            return;
        }
        (0, apiResponse_1.successResponseWithData)(res, responseMssg_1.SUCCESS.dataFound, result);
    }
    catch (error) {
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
});
// Delete faqs
exports.deleteFaq = (0, express_async_handler_1.default)(async (req, res, next) => {
    try {
        await faq_model_1.default.findOneAndUpdate({ _id: req.body.id }, { $set: { status: 2, modifiedAt: Date.now() } });
        (0, apiResponse_1.successResponseWithData)(res, responseMssg_1.FAQ.faqDeleted, {});
    }
    catch (error) {
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
});
// for Change Status
exports.changeFaqStatus = (0, express_async_handler_1.default)(async (req, res, next) => {
    try {
        if (!req.body.id)
            return next(new Error("FAQ ID is required."));
        const result = await faq_model_1.default.findOneAndUpdate({ _id: req.body.id }, { $set: { status: req.body.status, modifiedAt: new Date() } }, { new: true });
        if (!result)
            return next(new Error("FAQ not found."));
        const msg = req.body.status == 1 ? responseMssg_1.FAQ.faqActivated : responseMssg_1.FAQ.faqDeactivated;
        (0, apiResponse_1.successResponseWithData)(res, msg, result);
    }
    catch (error) {
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
});
