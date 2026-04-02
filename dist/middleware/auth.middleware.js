"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const responseMssg_1 = require("../utils/responseMssg");
const admin_model_1 = __importDefault(require("../models/admin.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const verifyToken = (0, express_async_handler_1.default)(async (req, res, next) => {
    try {
        let tokenKey;
        let userType = "user";
        const url = req.baseUrl.split("/api/v1/")[1]?.split("/")[0];
        if (url === "admin") {
            tokenKey = process.env.TOKEN_SECRET_KEY_1;
            userType = "admin";
        }
        else {
            tokenKey = process.env.TOKEN_SECRET_KEY_2;
        }
        if (!tokenKey) {
            return next({ message: responseMssg_1.AUTH.tokenRequired });
        }
        const bearerHeader = req.headers.authorization;
        if (!bearerHeader || !bearerHeader.startsWith("Bearer ")) {
            return next({ message: responseMssg_1.AUTH.tokenRequired });
        }
        const bearerToken = bearerHeader.split(" ")[1];
        if (!bearerToken) {
            return next({ message: responseMssg_1.AUTH.tokenRequired });
        }
        const decoded = jsonwebtoken_1.default.verify(bearerToken, tokenKey);
        if (!decoded._id) {
            return next({ message: responseMssg_1.AUTH.tokenRequired });
        }
        let user;
        if (userType === "admin") {
            user = await admin_model_1.default.findById(decoded._id).select("-__v -createdAt -updatedAt -password -resetPasswordExpire -resetPasswordToken");
        }
        else {
            user = await user_model_1.default.findById(decoded._id).select("-__v -createdAt -updatedAt -password -resetPasswordExpire -resetPasswordToken");
        }
        if (!user) {
            return next({ message: responseMssg_1.AUTH.tokenRequired });
        }
        req.user = user;
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.default = verifyToken;
