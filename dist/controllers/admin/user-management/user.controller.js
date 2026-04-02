"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.changeStatus = exports.updateUser = exports.getOneUser = exports.getAllUsers = exports.addUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_model_1 = __importDefault(require("../../../models/user.model"));
const email_template_model_1 = __importDefault(require("../../../models/email.template.model"));
const apiRes = __importStar(require("../../../utils/apiResponse"));
const functions_1 = require("../../../utils/functions");
const responseMssg_1 = require("../../../utils/responseMssg");
const mongoose_1 = __importDefault(require("mongoose"));
const addUser = async (req, res, next) => {
    try {
        req.body.email = req.body.email?.toLowerCase();
        req.body.countryCode = process.env.COUNTRY_CODE;
        const { email, phoneNumber, countryCode, username } = req.body;
        const regexPattern = new RegExp("^" + email?.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$", "i");
        const condition = {
            status: { $ne: 2 },
            $or: [
                { email: regexPattern },
                { phoneNumber, countryCode }
            ],
        };
        const existingUser = await user_model_1.default.findOne(condition);
        if (existingUser?.email === email) {
            apiRes.errorResponse(res, responseMssg_1.USER.emailAlreadyExists);
            return;
        }
        if (existingUser?.username === username) {
            apiRes.errorResponse(res, responseMssg_1.USER.usernameAlreadyExist);
            return;
        }
        if (existingUser?.phoneNumber === phoneNumber) {
            apiRes.errorResponse(res, responseMssg_1.USER.phoneNumberExists);
            return;
        }
        const randomPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcryptjs_1.default.hash(randomPassword, 10);
        const newUser = new user_model_1.default({
            ...req.body,
            role: "user",
            password: hashedPassword,
        });
        const savedUser = await newUser.save();
        const templateResult = await email_template_model_1.default.findOne({ slug: process.env.USER_SEND_PASSWORD, status: 1 });
        if (templateResult) {
            let content = templateResult.content.replace("{name}", req.body.name ?? "").replace("{email}", req.body.email ?? "").replace("{password}", randomPassword);
            (0, functions_1.sendEmail)({ email: req.body.email ?? "", subject: templateResult.subject, message: content });
        }
        apiRes.successResponseWithData(res, responseMssg_1.USER.userAdded, savedUser);
    }
    catch (error) {
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
};
exports.addUser = addUser;
const getAllUsers = async (req, res, next) => {
    try {
        const { pageSize, pageNumber, searchItem, status } = req.body;
        const sort = { createdAt: -1 };
        const searchQuery = { status: { $ne: 2 }, role: "user" };
        if (status?.length) {
            searchQuery.status = { $in: status };
        }
        if (searchItem) {
            const regex = new RegExp(searchItem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
            searchQuery.$or = [{ username: regex }, { email: regex }];
        }
        const result = await (0, functions_1.listing)(user_model_1.default, [], searchQuery, {
            _id: 1,
            username: 1,
            firstname: 1,
            lastname: 1,
            email: 1,
            phoneNumber: 1,
            role: 1,
            countryCode: 1,
            status: 1,
            createdAt: 1
        }, sort, pageNumber - 1, pageSize);
        const totalRecords = await user_model_1.default.countDocuments(searchQuery);
        apiRes.successResponseWithData(res, responseMssg_1.SUCCESS.dataFound, { result, totalRecords, pageNumber, pageSize });
    }
    catch (error) {
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
};
exports.getAllUsers = getAllUsers;
const getOneUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            apiRes.errorResponse(res, "User ID is required.");
            return;
        }
        const result = await user_model_1.default.findOne({ _id: id }, { __v: 0, password: 0, createdAt: 0, modifiedAt: 0 });
        if (!result)
            return next(new Error("User not found."));
        apiRes.successResponseWithData(res, responseMssg_1.SUCCESS.dataFound, result);
    }
    catch (error) {
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
};
exports.getOneUser = getOneUser;
const updateUser = async (req, res, next) => {
    try {
        req.body.email = req.body.email?.toLowerCase();
        req.body.countryCode = process.env.COUNTRY_CODE;
        const { id, email, username, firstname, lastname, bio, countryCode, status, phoneNumber, packageType, isVerified, city, country } = req.body;
        const image = req.file?.path;
        if (!id) {
            return next(new Error("User ID must be provided"));
        }
        const regexPattern = new RegExp("^" + email?.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$", "i");
        const condition = {
            status: { $ne: 2 },
            _id: { $ne: new mongoose_1.default.Types.ObjectId(id) },
            $or: [
                { email: regexPattern },
                { phoneNumber, countryCode },
                { username: username }
            ],
        };
        const existingUser = await user_model_1.default.findOne(condition);
        if (existingUser?.email === email) {
            apiRes.errorResponse(res, responseMssg_1.USER.emailAlreadyExists);
            return;
        }
        if (existingUser?.username === username) {
            apiRes.errorResponse(res, responseMssg_1.USER.usernameAlreadyExist);
            return;
        }
        if (existingUser?.phoneNumber === phoneNumber) {
            apiRes.errorResponse(res, responseMssg_1.USER.phoneNumberExists);
            return;
        }
        const updateFields = {};
        if (username)
            updateFields.username = username;
        if (firstname)
            updateFields.firstname = firstname;
        if (lastname)
            updateFields.lastname = lastname;
        if (bio)
            updateFields.bio = bio;
        if (city)
            updateFields.city = city;
        if (country)
            updateFields.country = country;
        if (packageType)
            updateFields.packageType = packageType;
        if (isVerified)
            updateFields.isVerified = isVerified;
        if (email)
            updateFields.email = email.toLowerCase();
        if (status)
            updateFields.status = status;
        if (phoneNumber)
            updateFields.phoneNumber = phoneNumber;
        if (image) {
            updateFields.image = image;
        }
        // Update the model
        const updatedUser = await user_model_1.default.findByIdAndUpdate(id, { $set: updateFields }, { new: true, lean: true });
        apiRes.successResponseWithData(res, responseMssg_1.USER.profileUpdated, updatedUser);
    }
    catch (error) {
        console.log(error);
        next(error);
    }
};
exports.updateUser = updateUser;
const changeStatus = async (req, res, next) => {
    try {
        if (!req.body.id)
            return next(new Error("User ID is required."));
        const result = await user_model_1.default.findOneAndUpdate({ _id: req.body.id }, { $set: { status: req.body.status, modifiedAt: new Date() } }, { new: true });
        if (!result)
            return next(new Error("User not found."));
        const msg = req.body.status == 1 ? responseMssg_1.USER.userActivated : responseMssg_1.USER.userDeactivated;
        apiRes.successResponseWithData(res, msg, result);
    }
    catch (error) {
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
};
exports.changeStatus = changeStatus;
const deleteUser = async (req, res, next) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return next(new Error("At least one user ID is required."));
        }
        const result = await user_model_1.default.updateMany({ _id: { $in: ids }, role: "user" }, { $set: { status: 2, modifiedAt: new Date() } });
        if (result.modifiedCount === 0) {
            return next(new Error("No matching user found or already deleted."));
        }
        apiRes.successResponseWithData(res, responseMssg_1.USER.userDeleted, {
            deletedCount: result.modifiedCount,
        });
    }
    catch (error) {
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
};
exports.deleteUser = deleteUser;
