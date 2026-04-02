"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSetting = exports.getSetting = exports.editProfile = exports.getAdminDetails = exports.changePassword = exports.resetPassword = exports.forgotPassword = exports.loginAdmin = exports.addAdmin = void 0;
const auth_service_1 = require("../../../services/admin/auth.service");
const responseMssg_1 = require("../../../utils/responseMssg");
const apiResponse_1 = require("../../../utils/apiResponse");
const admin_model_1 = __importDefault(require("../../../models/admin.model"));
const setting_model_1 = __importDefault(require("../../../models/setting.model"));
const functions_1 = require("../../../utils/functions");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const email_template_model_1 = __importDefault(require("../../../models/email.template.model"));
const logger_1 = require("../../../utils/logger");
// Admin registration controller
const addAdmin = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const admin = await (0, auth_service_1.addAdminServices)(name, email, password);
        (0, apiResponse_1.successResponseWithData)(res, responseMssg_1.ADMIN.adminAdded, admin);
    }
    catch (error) {
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
};
exports.addAdmin = addAdmin;
const loginAdmin = async (req, res, next) => {
    try {
        const email = req.body.email.toLowerCase();
        console.log(req.body);
        const data = await admin_model_1.default.findOne({ email: { $regex: new RegExp(`^${email}$`, "i") }, status: { $ne: 2 } }, { createdAt: 0, modifiedAt: 0, __v: 0 }).populate({
            path: "permission",
            select: "_id permissions permissionName"
        });
        if (!data) {
            (0, apiResponse_1.validationError)(res, responseMssg_1.ADMIN.accountNotExists);
            return;
        }
        const match = bcryptjs_1.default.compareSync(req.body.password, data.password);
        if (!match) {
            (0, apiResponse_1.errorResponse)(res, responseMssg_1.ADMIN.invalidLogin);
            return;
        }
        const token = jsonwebtoken_1.default.sign({ _id: data._id }, process.env.TOKEN_SECRET_KEY_1, {
            expiresIn: process.env.ADMIN_TOKEN_EXPIRE
        });
        const { password, ...result } = data.toObject();
        (0, apiResponse_1.successResponseWithData)(res, responseMssg_1.ADMIN.loginSuccess, { token, result, permissions: data.permissions });
    }
    catch (error) {
        next(error);
    }
};
exports.loginAdmin = loginAdmin;
const forgotPassword = async (req, res, next) => {
    try {
        let { email } = req.body;
        email = email.toLowerCase();
        const result = await admin_model_1.default.findOne({ email });
        if (!result) {
            (0, apiResponse_1.errorResponse)(res, responseMssg_1.ADMIN.emailNotExists);
            return;
        }
        // const resetPasswordToken = Math.floor(100000 + Math.random() * 900000).toString();
        const resetPasswordToken = 1234;
        let resetPasswordExpiresTime = process.env.RESET_PASSWORD_EXPIRE_TIME;
        let resetPasswordExpires = Date.now() + resetPasswordExpiresTime * 60 * 1000;
        const link = `${process.env.ADMIN_RESET_PASSWORD_URL}${resetPasswordToken}`;
        if (email) {
            const template = await email_template_model_1.default.findOne({ slug: process.env.FORGOT_PASSWORD_ADMIN, status: 1 }, { content: 1, subject: 1 });
            if (template) {
                let content = (template?.content || "")
                    .replace("{adminName}", result.name)
                    .replace("{resetLink}", link);
                const mailOptions = {
                    email,
                    subject: template.subject,
                    message: content,
                };
                console.log(mailOptions);
                await (0, functions_1.sendEmail)(mailOptions);
            }
        }
        // Update admin with reset token and expiration
        await admin_model_1.default.findByIdAndUpdate(result._id, {
            resetPasswordToken,
            resetPasswordExpire: resetPasswordExpires
        });
        // Send success response
        (0, apiResponse_1.successResponse)(res, responseMssg_1.ADMIN.emailSent);
    }
    catch (error) {
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res, next) => {
    try {
        const { newPassword, token, email } = req.body;
        let date = new Date();
        const result = await admin_model_1.default.findOne({ resetPasswordToken: token }, {
            resetPasswordToken: 1,
            resetPasswordExpire: 1
        });
        if (!result) {
            (0, apiResponse_1.errorResponse)(res, "Admin not found");
            return;
        }
        if (result && new Date(result.resetPasswordExpire) < date) {
            (0, apiResponse_1.errorResponse)(res, "Token expired.");
            return;
        }
        if (Number(result.resetPasswordToken) != Number(token)) {
            (0, apiResponse_1.errorResponse)(res, "Token is not matched.");
            return;
        }
        const hash = await bcryptjs_1.default.hash(newPassword, 10);
        await admin_model_1.default.findByIdAndUpdate(result._id, {
            password: hash,
            resetPasswordToken: null,
            resetPasswordExpire: null
        });
        (0, apiResponse_1.successResponse)(res, responseMssg_1.ADMIN.resetPasswordSuccess);
    }
    catch (error) {
        (0, logger_1.log)(error);
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
};
exports.resetPassword = resetPassword;
const changePassword = async (req, res, next) => {
    try {
        if (!req.user) {
            (0, apiResponse_1.errorResponse)(res, responseMssg_1.ADMIN.accountNotExists);
            return;
        }
        const result = await admin_model_1.default.findById(req.user._id);
        if (!result || !(await bcryptjs_1.default.compare(req.body.oldPassword, result.password))) {
            (0, apiResponse_1.errorResponse)(res, responseMssg_1.ADMIN.passwordInvalid);
            return;
        }
        if (req.body.newPassword !== req.body.confirmPassword) {
            (0, apiResponse_1.errorResponse)(res, responseMssg_1.ADMIN.passwordNotMatched);
            return;
        }
        const hash = await bcryptjs_1.default.hash(req.body.newPassword, 10);
        await admin_model_1.default.findByIdAndUpdate(req.user._id, { password: hash, modifiedAt: new Date() });
        (0, apiResponse_1.successResponse)(res, responseMssg_1.ADMIN.passwordChanged);
    }
    catch (error) {
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
};
exports.changePassword = changePassword;
const getAdminDetails = async (req, res, next) => {
    try {
        if (!req.user) {
            (0, apiResponse_1.errorResponse)(res, responseMssg_1.ADMIN.accountNotExists);
            return;
        }
        const result = await admin_model_1.default.findById(req.user._id);
        (0, apiResponse_1.successResponseWithData)(res, responseMssg_1.SUCCESS.dataFound, result);
    }
    catch (error) {
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
};
exports.getAdminDetails = getAdminDetails;
const editProfile = async (req, res, next) => {
    try {
        if (!req.user) {
            (0, apiResponse_1.errorResponse)(res, responseMssg_1.ADMIN.accountNotExists);
            return;
        }
        const updateData = {
            name: req.body.name,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            modifiedAt: new Date()
        };
        let result = await admin_model_1.default.findByIdAndUpdate({ _id: req.user._id }, { $set: updateData }, { new: true });
        (0, apiResponse_1.successResponseWithData)(res, responseMssg_1.ADMIN.profileUpdated, result);
    }
    catch (error) {
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
};
exports.editProfile = editProfile;
// Get setting details
const getSetting = async (req, res, next) => {
    try {
        const result = await setting_model_1.default.findOne({});
        (0, apiResponse_1.successResponseWithData)(res, responseMssg_1.SUCCESS.dataFound, result);
    }
    catch (error) {
        next((0, apiResponse_1.errorResponse)(res, responseMssg_1.ERROR.SomethingWrong));
    }
};
exports.getSetting = getSetting;
// Update setting details
const updateSetting = async (req, res, next) => {
    try {
        const result = await setting_model_1.default.findOneAndUpdate({}, {
            $set: {
                instaLink: req.body.instaLink,
                fbLink: req.body.fbLink,
                contactUsEmail: req.body.contactUsEmail,
                currency: req.body.currency,
                commission: req.body.commission,
                spareTime: req.body.spareTime,
                modifiedAt: new Date()
            }
        }, { new: true });
        (0, apiResponse_1.successResponseWithData)(res, responseMssg_1.ADMIN.settingUpdated, result);
    }
    catch (error) {
        next((0, apiResponse_1.errorResponse)(res, responseMssg_1.ERROR.SomethingWrong));
    }
};
exports.updateSetting = updateSetting;
