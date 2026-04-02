"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSubAdmins = exports.changeSubAdminStatus = exports.updateSubAdmin = exports.getOneSubAdmin = exports.getAllSubAdmins = exports.addSubAdmin = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const admin_model_1 = __importDefault(require("../../../models/admin.model"));
const email_template_model_1 = __importDefault(require("../../../models/email.template.model"));
const apiResponse_1 = require("../../../utils/apiResponse");
const functions_1 = require("../../../utils/functions");
const responseMssg_1 = require("../../../utils/responseMssg");
/* -------------------------------------------------------------------------- */
/*                          ✅ Add SubAdmin                                   */
/* -------------------------------------------------------------------------- */
const addSubAdmin = async (req, res, next) => {
    try {
        req.body.email = req.body.email?.toLowerCase();
        if (!req.user || !req.user._id)
            return next(new Error("Unauthorized. Admin info not found."));
        const { email, permission, phoneNumber, password } = req.body;
        // Check for existing subadmin
        const existingAdmin = await admin_model_1.default.findOne({ email });
        if (existingAdmin) {
            return next((0, apiResponse_1.errorResponse)(res, responseMssg_1.SUBADMIN.emailAlreadyExists));
        }
        // Generate random password
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // Create SubAdmin
        const newSubAdmin = new admin_model_1.default({
            name: req.body.name,
            email,
            password: hashedPassword,
            phoneNumber,
            role: "subadmin",
            permission,
            status: req.body.status,
            createdBy: req.user._id
        });
        const savedSubAdmin = await newSubAdmin.save();
        // Send password email if template found
        const templateResult = await email_template_model_1.default.findOne({
            slug: process.env.USER_SEND_PASSWORD,
            status: 1,
        });
        if (templateResult) {
            let content = templateResult.content
                .replace("{name}", req.body.name ?? "")
                .replace("{email}", email ?? "")
                .replace("{password}", password ?? "");
            await (0, functions_1.sendEmail)({
                email: email ?? "",
                subject: templateResult.subject,
                message: content,
            });
        }
        (0, apiResponse_1.successResponseWithData)(res, responseMssg_1.SUBADMIN.subAdminAdded, savedSubAdmin);
    }
    catch (error) {
        console.error(error);
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
};
exports.addSubAdmin = addSubAdmin;
/* -------------------------------------------------------------------------- */
/*                          ✅ getAllSubAdmins                                */
/* -------------------------------------------------------------------------- */
const getAllSubAdmins = async (req, res, next) => {
    try {
        const { pageSize, pageNumber, searchItem, status } = req.body;
        const sort = { createdAt: -1 };
        const searchQuery = { role: "subadmin" };
        if (status?.length) {
            searchQuery.status = { $in: status };
        }
        if (searchItem) {
            const regex = new RegExp(searchItem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
            searchQuery.$or = [{ name: regex }, { email: regex }];
        }
        const result = await (0, functions_1.listing)(admin_model_1.default, [
            {
                path: 'permission',
                select: 'permissionName permissions'
            }
        ], searchQuery, {
            _id: 1,
            name: 1,
            email: 1,
            phoneNumber: 1,
            role: 1,
            status: 1,
            createdAt: 1,
            permission: 1
        }, sort, pageNumber - 1, pageSize);
        const totalRecords = await admin_model_1.default.countDocuments(searchQuery);
        (0, apiResponse_1.successResponseWithData)(res, responseMssg_1.SUCCESS.dataFound, { result, totalRecords, pageNumber, pageSize });
    }
    catch (error) {
        console.error(error);
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
};
exports.getAllSubAdmins = getAllSubAdmins;
/* -------------------------------------------------------------------------- */
/*                          ✅ Get One SubAdmin                               */
/* -------------------------------------------------------------------------- */
const getOneSubAdmin = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            (0, apiResponse_1.errorResponse)(res, "SubAdmin ID is required.");
            return;
        }
        const result = await admin_model_1.default.findOne({ _id: id, status: { $ne: 2 } })
            .select("-password -__v")
            .populate("permission", "permissionName permissions");
        if (!result)
            return next(new Error("SubAdmin not found."));
        (0, apiResponse_1.successResponseWithData)(res, responseMssg_1.SUCCESS.dataFound, result);
    }
    catch (error) {
        console.log(error);
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
};
exports.getOneSubAdmin = getOneSubAdmin;
/* -------------------------------------------------------------------------- */
/*                          ✅ Update SubAdmin                                */
/* -------------------------------------------------------------------------- */
const updateSubAdmin = async (req, res, next) => {
    try {
        const { id, email, phoneNumber, permission, ...updateFields } = req.body;
        if (!id)
            return next(new Error("SubAdmin ID must be provided."));
        if (email)
            updateFields.email = email.toLowerCase();
        const updatedSubAdmin = await admin_model_1.default.findOneAndUpdate({ _id: id, role: "subadmin", status: { $ne: 2 }, }, { $set: { ...updateFields, permission } }, { new: true, lean: true });
        if (!updatedSubAdmin)
            return next(new Error("SubAdmin not found or invalid role."));
        (0, apiResponse_1.successResponse)(res, responseMssg_1.SUBADMIN.profileUpdated);
    }
    catch (error) {
        console.error(error);
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
};
exports.updateSubAdmin = updateSubAdmin;
/* -------------------------------------------------------------------------- */
/*                          ✅ Change SubAdmin Status                         */
/* -------------------------------------------------------------------------- */
const changeSubAdminStatus = async (req, res, next) => {
    try {
        const { id, status } = req.body;
        if (!id)
            return next(new Error("SubAdmin ID is required."));
        const result = await admin_model_1.default.findOneAndUpdate({ _id: id, role: "subadmin" }, { $set: { status, modifiedAt: new Date() } }, { new: true });
        if (!result)
            return next(new Error("SubAdmin not found."));
        const msg = status == 1 ? responseMssg_1.SUBADMIN.subAdminActivated : responseMssg_1.SUBADMIN.subAdminDeactivated;
        (0, apiResponse_1.successResponseWithData)(res, msg, result);
    }
    catch (error) {
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
};
exports.changeSubAdminStatus = changeSubAdminStatus;
/* -------------------------------------------------------------------------- */
/*                          ✅ Delete SubAdmins                               */
/* -------------------------------------------------------------------------- */
const deleteSubAdmins = async (req, res, next) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return next(new Error("At least one SubAdmin ID is required."));
        }
        const result = await admin_model_1.default.updateMany({ _id: { $in: ids }, role: "subadmin" }, { $set: { status: 2, modifiedAt: new Date() } });
        if (result.modifiedCount === 0) {
            return next(new Error("No matching SubAdmins found or already deleted."));
        }
        (0, apiResponse_1.successResponseWithData)(res, responseMssg_1.SUBADMIN.subAdminsDeleted, {
            deletedCount: result.modifiedCount,
        });
    }
    catch (error) {
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
};
exports.deleteSubAdmins = deleteSubAdmins;
