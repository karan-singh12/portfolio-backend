"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeStatus = exports.getOneTemplate = exports.updateTemplate = exports.getAllTemplate = exports.addTemplate = void 0;
const responseMssg_1 = require("../../../utils/responseMssg");
const apiResponse_1 = require("../../../utils/apiResponse");
const functions_1 = require("../../../utils/functions");
const email_template_model_1 = __importDefault(require("../../../models/email.template.model"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
;
// Admin registration controller
exports.addTemplate = (0, express_async_handler_1.default)(async (req, res, next) => {
    try {
        if (!req.user) {
            return next(({ message: "Unauthorized" }));
        }
        req.body.slug = await (0, functions_1.slugGenrator)(req.body.title);
        req.body.createdBy = req.user._id;
        await new email_template_model_1.default(req.body).save();
        (0, apiResponse_1.successResponse)(res, responseMssg_1.EMAILTEMPLATE.templateAdded);
    }
    catch (error) {
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
});
exports.getAllTemplate = (0, express_async_handler_1.default)(async (req, res, next) => {
    try {
        const { pageSize, pageNumber, searchItem, sortOrder, sortBy, status } = req.body;
        const page = Math.max(0, pageNumber - 1);
        const order = sortOrder || -1;
        const sort = sortBy ? { [sortBy]: order } : { createdAt: -1 };
        let searchQuery = { status: { $ne: 2 } };
        if (status && status.length > 0) {
            searchQuery.status = { $in: status };
        }
        if (searchItem) {
            const regex = new RegExp(searchItem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
            searchQuery.$or = [{ title: regex }, { subject: regex }];
        }
        const result = await email_template_model_1.default.find(searchQuery, {
            _id: 1, title: 1, subject: 1, createdAt: 1, status: 1, createdBy: 1
        })
            .skip(pageSize * page)
            .limit(Number(pageSize))
            .populate({
            path: 'createdBy',
            model: 'Admin',
            select: 'name email role',
        });
        const totalRecords = await email_template_model_1.default.countDocuments(searchQuery);
        (0, apiResponse_1.successResponseWithData)(res, responseMssg_1.SUCCESS.dataFound, { result, totalRecords, pageNumber, pageSize });
    }
    catch (error) {
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
});
exports.updateTemplate = (0, express_async_handler_1.default)(async (req, res, next) => {
    try {
        const obj = {
            title: req.body.title,
            subject: req.body.subject,
            content: req.body.content,
            status: req.body.status,
            updatedAt: new Date(),
        };
        const result = await email_template_model_1.default.findByIdAndUpdate(req.body.id, { $set: obj }, { new: true });
        (0, apiResponse_1.successResponseWithData)(res, responseMssg_1.EMAILTEMPLATE.templateUpdated, result);
    }
    catch (error) {
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
});
exports.getOneTemplate = (0, express_async_handler_1.default)(async (req, res, next) => {
    try {
        const result = await email_template_model_1.default.findById(req.params.id, { __v: 0, createdAt: 0, updatedAt: 0 }).populate({
            path: 'createdBy',
            model: 'Admin',
            select: 'name email role',
        });
        (0, apiResponse_1.successResponseWithData)(res, responseMssg_1.SUCCESS.dataFound, result);
    }
    catch (error) {
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
});
exports.changeStatus = (0, express_async_handler_1.default)(async (req, res, next) => {
    try {
        let status = req.body.status;
        if (req.url.includes("deleteTemplate")) {
            status = 2;
        }
        await email_template_model_1.default.findByIdAndUpdate(req.body.id, { $set: { status, updatedAt: new Date() } }, { new: true });
        const msg = req.url.includes("deleteTemplate") ? responseMssg_1.EMAILTEMPLATE.templateDeleted :
            status === 1 ? responseMssg_1.EMAILTEMPLATE.templateActived : responseMssg_1.EMAILTEMPLATE.templateInactived;
        (0, apiResponse_1.successResponse)(res, msg);
    }
    catch (error) {
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
});
