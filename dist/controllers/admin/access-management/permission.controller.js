"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePermissions = exports.updatePermission = exports.getOnePermission = exports.getAllPermissions = exports.addPermission = void 0;
const permission_model_1 = __importDefault(require("../../../models/permission.model"));
const apiResponse_1 = require("../../../utils/apiResponse");
const functions_1 = require("../../../utils/functions");
const responseMssg_1 = require("../../../utils/responseMssg");
/* -------------------------------------------------------------------------- */
/*                          ✅ ADD PERMISSION                                 */
/* -------------------------------------------------------------------------- */
const addPermission = async (req, res, next) => {
    try {
        const { permissionName, permissions, createdBy } = req.body;
        if (!permissionName)
            return next(new Error("Permission name is required."));
        if (!permissions || !permissions.length)
            return next(new Error("At least one module/action is required."));
        if (!req.user || !req.user._id) {
            next(new Error("Unauthorized. Admin info not found."));
            return;
        }
        // Check for duplicate name
        const existing = await permission_model_1.default.findOne({ permissionName });
        if (existing)
            return next(new Error("Permission name already exists."));
        const newPermission = new permission_model_1.default({
            permissionName,
            permissions,
            createdBy: req.user._id,
        });
        const savedPermission = await newPermission.save();
        (0, apiResponse_1.successResponseWithData)(res, "permission added successfully", savedPermission);
    }
    catch (err) {
        console.error("addPermission error:", err);
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
};
exports.addPermission = addPermission;
/* -------------------------------------------------------------------------- */
/*                          ✅ GET ALL PERMISSIONS                            */
/* -------------------------------------------------------------------------- */
const getAllPermissions = async (req, res, next) => {
    try {
        const { pageNumber, pageSize, searchItem } = req.body;
        const searchQuery = {};
        if (searchItem) {
            const regex = new RegExp(searchItem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
            searchQuery.permissionName = regex;
        }
        const sort = { createdAt: -1 };
        const result = await (0, functions_1.listing)(permission_model_1.default, [], searchQuery, { _id: 1, permissionName: 1, permissions: 1, createdBy: 1, createdAt: 1 }, sort, pageNumber - 1, pageSize);
        const totalRecords = await permission_model_1.default.countDocuments(searchQuery);
        (0, apiResponse_1.successResponseWithData)(res, responseMssg_1.SUCCESS.dataFound, { result, totalRecords, pageNumber, pageSize });
    }
    catch (err) {
        console.error("getAllPermissions error:", err);
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
};
exports.getAllPermissions = getAllPermissions;
/* -------------------------------------------------------------------------- */
/*                          ✅ GET ONE PERMISSION                             */
/* -------------------------------------------------------------------------- */
const getOnePermission = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id)
            return next(new Error("Permission ID is required."));
        const permission = await permission_model_1.default.findById(id).populate("createdBy", "name email role");
        if (!permission)
            return next(new Error("Permission not found."));
        (0, apiResponse_1.successResponseWithData)(res, responseMssg_1.SUCCESS.dataFound, permission);
    }
    catch (err) {
        console.error("getOnePermission error:", err);
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
};
exports.getOnePermission = getOnePermission;
/* -------------------------------------------------------------------------- */
/*                          ✅ UPDATE PERMISSION                              */
/* -------------------------------------------------------------------------- */
const updatePermission = async (req, res, next) => {
    try {
        const { id, permissionName, permissions } = req.body;
        if (!id)
            return next(new Error("Permission ID is required."));
        const updateData = {};
        if (permissionName)
            updateData.permissionName = permissionName;
        if (permissions)
            updateData.permissions = permissions;
        const updatedPermission = await permission_model_1.default.findByIdAndUpdate(id, { $set: updateData }, { new: true, lean: true });
        if (!updatedPermission)
            return next(new Error("Permission not found."));
        (0, apiResponse_1.successResponseWithData)(res, "Permission updated successfully.", updatedPermission);
    }
    catch (err) {
        console.error("updatePermission error:", err);
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
};
exports.updatePermission = updatePermission;
/* -------------------------------------------------------------------------- */
/*                          ✅ DELETE PERMISSIONS                             */
/* -------------------------------------------------------------------------- */
const deletePermissions = async (req, res, next) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0)
            return next(new Error("At least one Permission ID is required."));
        const result = await permission_model_1.default.deleteMany({ _id: { $in: ids } });
        if (result.deletedCount === 0)
            return next(new Error("No matching permissions found."));
        (0, apiResponse_1.successResponseWithData)(res, "Permission deleted successfully.", { deletedCount: result.deletedCount });
    }
    catch (err) {
        console.error("deletePermissions error:", err);
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
};
exports.deletePermissions = deletePermissions;
