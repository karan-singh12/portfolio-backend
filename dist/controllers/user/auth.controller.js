"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.changePassword = exports.editProfile = exports.getUserDetails = exports.resendOtp = exports.resetPassword = exports.forgotPassword = exports.loginUser = exports.resendVerifyOtp = exports.verifyOtp = exports.signUp = void 0;
const responseMssg_1 = require("../../utils/responseMssg");
const apiResponse_1 = require("../../utils/apiResponse");
const user_model_1 = __importDefault(require("../../models/user.model"));
const email_template_model_1 = __importDefault(require("../../models/email.template.model"));
const functions_1 = require("../../utils/functions");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
/* -------------------------------------------------------------------------- */
/*                           for user and model singup to the platform        */
/* -------------------------------------------------------------------------- */
const signUp = async (req, res, next) => {
    try {
        if (req.body.email)
            req.body.email = req.body.email.toLowerCase();
        const { email, phoneNumber, dob, username, password, terms, role, fullName } = req.body;
        console.log(req.body);
        const finalPhoneNumber = phoneNumber;
        const orConditions = [];
        if (username)
            orConditions.push({ username });
        if (finalPhoneNumber)
            orConditions.push({ phoneNumber: finalPhoneNumber });
        if (email) {
            const regexPattern = new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
            orConditions.push({ email: regexPattern });
        }
        if (orConditions.length > 0) {
            const existingUser = await user_model_1.default.findOne({
                status: { $ne: 2 },
                $or: orConditions,
            }, {
                email: 1,
                phoneNumber: 1,
                username: 1,
            });
            if (existingUser) {
                if (email && existingUser.email?.toLowerCase() === email.toLowerCase()) {
                    (0, apiResponse_1.errorResponse)(res, responseMssg_1.USER.emailAlreadyExists);
                    return;
                }
                if (finalPhoneNumber && existingUser.phoneNumber === finalPhoneNumber) {
                    (0, apiResponse_1.errorResponse)(res, responseMssg_1.USER.phoneNumberExists);
                    return;
                }
                if (username && existingUser.username === username) {
                    (0, apiResponse_1.errorResponse)(res, responseMssg_1.USER.usernameAlreadyExist);
                    return;
                }
            }
        }
        // Encrypt password
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // Generate OTP securely
        const otp = '1234';
        const otpExpire = Date.now() + Number(process.env.OTP_EXPIRE_TIME) * 60 * 1000;
        let link = `${process.env.USER_VERIFY_URL}?token=${otp}&email=${email}`;
        // Create new user
        const newUser = new user_model_1.default({
            username,
            fullName,
            email,
            phoneNumber: finalPhoneNumber,
            password: hashedPassword,
            dob,
            role,
            terms,
            isverified: false,
            isModel: role === "advertiser",
            otp,
            otpExpires: otpExpire,
            emailVerified: false,
            profileCompleted: false,
            isOnline: true
        });
        const savedUser = await newUser.save();
        if (email) {
            const template = await email_template_model_1.default.findOne({ slug: process.env.VERIFY_ACCOUNT_USER, status: 1 }, { content: 1, subject: 1 });
            if (template) {
                let content = (template?.content || "")
                    .replace("{user}", username)
                    .replace("{verificationLink}", link);
                const mailOptions = {
                    email,
                    subject: template.subject,
                    message: content,
                };
                (0, functions_1.sendEmail)(mailOptions);
            }
        }
        (0, apiResponse_1.successResponseWithData)(res, responseMssg_1.USER.verificationLinkSent, savedUser);
    }
    catch (error) {
        next(error);
    }
};
exports.signUp = signUp;
/* -------------------------------------------------------------------------- */
/*                                 verifyOtp                                  */
/* -------------------------------------------------------------------------- */
const verifyOtp = async (req, res, next) => {
    try {
        if (req.body.email)
            req.body.email = req.body.email.toLowerCase();
        const { email, phoneNumber, otp } = req.body;
        const condition = {
            status: 1,
            otpExpires: { $gt: new Date() },
        };
        if (email) {
            const regexPattern = new RegExp("^" + email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$", "i");
            condition.email = regexPattern;
        }
        else if (phoneNumber) {
            condition.$and = [{ phoneNumber }];
        }
        // Find user details
        const data = await user_model_1.default.findOne(condition, { _id: 1, otp: 1 });
        if (!data) {
            (0, apiResponse_1.errorResponse)(res, responseMssg_1.USER.otpExpired);
            return;
        }
        if (data.otp !== otp) {
            (0, apiResponse_1.errorResponse)(res, responseMssg_1.USER.otpNotMatched);
            return;
        }
        // Update user details
        const result = await user_model_1.default.findByIdAndUpdate({ _id: data._id }, {
            $set: {
                otp: null,
                otpExpires: null,
                emailVerified: true,
                modifiedAt: Date.now(),
            },
        }, { new: true });
        if (!result) {
            (0, apiResponse_1.errorResponse)(res, responseMssg_1.ERROR.SomethingWrong);
            return;
        }
        // Send success response
        (0, apiResponse_1.successResponseWithData)(res, responseMssg_1.USER.otpVerified, {
            user: {
                email,
                username: result.username,
                role: result.role,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.verifyOtp = verifyOtp;
/* -------------------------------------------------------------------------- */
/*                           resendVerifyOtp                                  */
/* -------------------------------------------------------------------------- */
const resendVerifyOtp = async (req, res, next) => {
    try {
        if (req.body.email)
            req.body.email = req.body.email.toLowerCase();
        const { email, phoneNumber } = req.body;
        let condition = { status: 1 };
        if (email) {
            const regexPattern = new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
            condition.email = regexPattern;
        }
        else {
            condition.$and = [{ phoneNumber }];
        }
        // Find user details
        const user = await user_model_1.default.findOne(condition, { _id: 1, username: 1 });
        if (!user) {
            (0, apiResponse_1.errorResponse)(res, responseMssg_1.USER.accountNotExists);
            return;
        }
        // Generate OTP securely
        // const otp: string = Math.floor(100000 + Math.random() * 900000).toString();
        const otp = "1234";
        const otpExpire = Date.now() + Number(process.env.RESET_PASSWORD_EXPIRE_TIME) * 60 * 1000;
        let link = `${process.env.USER_VERIFY_URL}?token=${otp}&email=${email}`;
        if (email) {
            // Fetch email template
            const template = await email_template_model_1.default.findOne({ slug: process.env.VERIFY_ACCOUNT_USER, status: 1 }, { content: 1, subject: 1 });
            if (template) {
                let content = (template?.content || "")
                    .replace("{user}", user.username || "User")
                    .replace("{verificationLink}", link);
                // Email details
                const mailOptions = {
                    email,
                    subject: template.subject,
                    message: content
                };
                // Send email
                (0, functions_1.sendEmail)(mailOptions);
            }
        }
        // Update user with new OTP and expiration time
        await user_model_1.default.findByIdAndUpdate(user._id, {
            $set: {
                otp: otp,
                otpExpires: otpExpire,
                modifiedAt: Date.now()
            }
        }, { new: true });
        // Send success response
        (0, apiResponse_1.successResponse)(res, responseMssg_1.USER.verificationLinkSent);
    }
    catch (error) {
        next(error);
    }
};
exports.resendVerifyOtp = resendVerifyOtp;
/* -------------------------------------------------------------------------- */
/*                           for user and model login                       */
/* -------------------------------------------------------------------------- */
const loginUser = async (req, res, next) => {
    try {
        if (req.body.email)
            req.body.email = req.body.email.toLowerCase();
        const { phoneNumber, username, email } = req.body;
        let condition = { status: { $ne: 2 } };
        if (email && username) {
            // If both email and username are provided, check both
            const emailRegex = new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
            const usernameRegex = new RegExp(`^${username.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
            condition.$and = [{ email: emailRegex }, { username: usernameRegex }];
        }
        else if (email) {
            const regexPattern = new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
            condition.email = regexPattern;
        }
        else if (username) {
            const regexPattern = new RegExp(`^${username.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
            condition.username = regexPattern;
        }
        else if (phoneNumber) {
            condition.$and = [{ phoneNumber }];
        }
        else {
            (0, apiResponse_1.validationError)(res, responseMssg_1.USER.invalidLogin);
            return;
        }
        const data = await user_model_1.default.findOne(condition, { createdAt: 0, modifiedAt: 0, __v: 0 });
        if (!data) {
            (0, apiResponse_1.validationError)(res, responseMssg_1.USER.invalidLogin);
            return;
        }
        if (data.status === 0) {
            (0, apiResponse_1.validationError)(res, responseMssg_1.USER.accountDeactivated);
            return;
        }
        // if (!data.emailVerified) {
        //   // Generate OTP securely
        //   const otp: string = Math.floor(100000 + Math.random() * 900000).toString();
        //   const otpExpire: number = Date.now() + Number(process.env.OTP_EXPIRE_TIME) * 60 * 1000;
        //   let link = `${process.env.USER_VERIFY_URL}?token=${otp}&email=${data.email}`;
        //   if (data.email) {
        //     // Fetch email template
        //     const template = await EmailTemplate.findOne(
        //       { slug: process.env.VERIFY_ACCOUNT_USER, status: 1 },
        //       { content: 1, subject: 1 }
        //     );
        //     if (template) {
        //       let content = (template?.content || "")
        //         .replace("{user}", data.username || "User")
        //         .replace("{verificationLink}", link);
        //       // Email details
        //       const mailOptions = {
        //         email: data.email,
        //         subject: template.subject,
        //         message: content
        //       };
        //       // Send email
        //       sendEmail(mailOptions);
        //     }
        //   }
        //   // Update user with new OTP and expiration time
        //   await User.findByIdAndUpdate(data._id, {
        //     $set: {
        //       otp: otp,
        //       otpExpires: otpExpire,
        //       modifiedAt: Date.now()
        //     }
        //   }, { new: true });
        //   errorResponseWithData(res, USER.accountNotVerified, {
        //     email: data.email,
        //     username: data.username,
        //     emailVerified: data.emailVerified,
        //     profileCompleted: data.profileCompleted,
        //     role: data.role
        //   });
        //   return
        // }
        const match = bcryptjs_1.default.compareSync(req.body.password, data.password);
        if (!match) {
            (0, apiResponse_1.errorResponse)(res, responseMssg_1.USER.invalidLogin);
            return;
        }
        const token = jsonwebtoken_1.default.sign({ _id: data._id }, process.env.TOKEN_SECRET_KEY_2, {
            expiresIn: process.env.USER_TOKEN_EXPIRE_TIME
        });
        const { password, ...result } = data.toObject();
        (0, apiResponse_1.successResponseWithData)(res, responseMssg_1.USER.loginSuccess, { token, result });
    }
    catch (error) {
        next(error);
    }
};
exports.loginUser = loginUser;
/* -------------------------------------------------------------------------- */
/*                           for user and model forgot password               */
/* -------------------------------------------------------------------------- */
const forgotPassword = async (req, res, next) => {
    try {
        if (req.body.email)
            req.body.email = req.body.email.toLowerCase();
        const { email, phoneNumber } = req.body;
        let condition = { status: 1 };
        if (email) {
            const regexPattern = new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
            condition.email = regexPattern;
        }
        else {
            condition.$and = [{ phoneNumber }];
        }
        // Find user details
        const user = await user_model_1.default.findOne(condition, { _id: 1, email: 1 });
        if (!user) {
            (0, apiResponse_1.errorResponse)(res, responseMssg_1.USER.accountNotExists);
            return;
        }
        // Generate OTP securely
        // const otp: string = Math.floor(100000 + Math.random() * 900000).toString();
        const otp = "1234";
        const otpExpire = Date.now() + Number(process.env.OTP_EXPIRE_TIME) * 60 * 1000;
        // Create hash for token verification
        const hash = crypto_1.default
            .createHash('sha256')
            .update(`${user.email}:${otp}:${process.env.TOKEN_SECRET_KEY_2}`)
            .digest('hex');
        // Create token combining email, otp, and hash
        const tokenPayload = {
            email: user.email,
            otp: otp,
            hash: hash
        };
        const token = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');
        const link = `${process.env.FRONTEND_URL}/reset-password/${token}`;
        if (email) {
            const template = await email_template_model_1.default.findOne({ slug: process.env.FORGOT_PASSWORD_USER, status: 1 }, { content: 1, subject: 1 });
            if (template) {
                let content = (template?.content || "")
                    .replace("{resetLink}", link)
                    .replace("{otpExpire}", process.env.OTP_EXPIRE_TIME || "");
                const mailOptions = {
                    email,
                    subject: template.subject,
                    message: content
                };
                (0, functions_1.sendEmail)(mailOptions);
            }
        }
        await user_model_1.default.findByIdAndUpdate(user._id, {
            $set: {
                otp: otp,
                otpExpires: otpExpire,
                modifiedAt: Date.now()
            }
        }, { new: true });
        // Send success response
        (0, apiResponse_1.successResponse)(res, responseMssg_1.USER.otpSent);
    }
    catch (error) {
        next(error);
    }
};
exports.forgotPassword = forgotPassword;
/* -------------------------------------------------------------------------- */
/*                           for user and model reset password                */
/* -------------------------------------------------------------------------- */
const resetPassword = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;
        // Decode the token
        let decodedToken;
        try {
            const decodedString = Buffer.from(token, 'base64').toString('utf-8');
            decodedToken = JSON.parse(decodedString);
        }
        catch (error) {
            (0, apiResponse_1.errorResponse)(res, responseMssg_1.USER.invalidToken);
            return;
        }
        const { email, otp, hash } = decodedToken;
        if (!email || !otp || !hash) {
            (0, apiResponse_1.errorResponse)(res, responseMssg_1.USER.invalidToken);
            return;
        }
        // Verify the hash to ensure token hasn't been tampered with
        const expectedHash = crypto_1.default
            .createHash('sha256')
            .update(`${email}:${otp}:${process.env.TOKEN_SECRET_KEY_2}`)
            .digest('hex');
        if (hash !== expectedHash) {
            (0, apiResponse_1.errorResponse)(res, responseMssg_1.USER.invalidToken);
            return;
        }
        // Find user by email and check OTP validity
        const user = await user_model_1.default.findOne({ status: 1, email, otpExpires: { $gt: new Date() } }, { _id: 1, otp: 1 });
        if (!user) {
            (0, apiResponse_1.errorResponse)(res, responseMssg_1.USER.otpExpired);
            return;
        }
        if (otp !== user?.otp) {
            (0, apiResponse_1.errorResponse)(res, responseMssg_1.USER.otpNotMatched);
            return;
        }
        // Hash new password
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        // Update user password and reset OTP fields
        await user_model_1.default.findByIdAndUpdate(user._id, {
            password: hashedPassword,
            otp: null,
            otpExpires: null
        });
        (0, apiResponse_1.successResponse)(res, responseMssg_1.USER.resetPassword);
    }
    catch (error) {
        next(error);
    }
};
exports.resetPassword = resetPassword;
/* -------------------------------------------------------------------------- */
/*                          for user and model resend OTP                     */
/* -------------------------------------------------------------------------- */
const resendOtp = async (req, res, next) => {
    try {
        if (req.body.email)
            req.body.email = req.body.email.toLowerCase();
        const { email, phoneNumber } = req.body;
        let condition = { status: 1 };
        if (email) {
            const regexPattern = new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
            condition.email = regexPattern;
        }
        else {
            condition.$and = [{ phoneNumber }];
        }
        // Find user details
        const user = await user_model_1.default.findOne(condition, { _id: 1 });
        if (!user) {
            (0, apiResponse_1.errorResponse)(res, responseMssg_1.USER.accountNotExists);
            return;
        }
        ;
        // Generate OTP securely
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpire = Date.now() + Number(process.env.OTP_EXPIRE_TIME) * 60 * 1000;
        if (email) {
            // Fetch email template
            const template = await email_template_model_1.default.findOne({ slug: process.env.FORGOT_PASSWORD_USER, status: 1 }, { content: 1, subject: 1 });
            if (template) {
                let content = (template?.content || "")
                    .replace("{otp}", otp)
                    .replace("{otpExpire}", process.env.OTP_EXPIRE_TIME || "");
                // Email details
                const mailOptions = {
                    email,
                    subject: template.subject,
                    message: content
                };
                // Send email
                (0, functions_1.sendEmail)(mailOptions);
            }
        }
        // Update user with new OTP and expiration time
        await user_model_1.default.findByIdAndUpdate(user._id, {
            $set: {
                otp: otp,
                otpExpires: otpExpire,
                modifiedAt: Date.now()
            }
        }, { new: true });
        // Send success response
        (0, apiResponse_1.successResponse)(res, responseMssg_1.USER.otpSent);
    }
    catch (error) {
        next(error);
    }
};
exports.resendOtp = resendOtp;
/* -------------------------------------------------------------------------- */
/*                            for user and model profile details              */
/* -------------------------------------------------------------------------- */
const getUserDetails = async (req, res, next) => {
    try {
        if (!req.user) {
            (0, apiResponse_1.errorResponse)(res, responseMssg_1.USER.accountNotExists);
            return;
        }
        const user = await user_model_1.default.findById(req.user._id);
        (0, apiResponse_1.successResponseWithData)(res, responseMssg_1.SUCCESS.dataFound, user);
    }
    catch (error) {
        next(error);
    }
};
exports.getUserDetails = getUserDetails;
/* -------------------------------------------------------------------------- */
/*                           for user and model edit profile                  */
/* -------------------------------------------------------------------------- */
const editProfile = async (req, res, next) => {
    try {
        if (!req.user) {
            (0, apiResponse_1.errorResponse)(res, responseMssg_1.USER.accountNotExists);
            return;
        }
        const { username, email, phoneNumber, phone, fullName } = req.body;
        const image = req.file?.path;
        // Build condition to check for existing email or phoneNumber used by other users
        const orConditions = [];
        if (email) {
            const regexPattern = new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
            orConditions.push({ email: regexPattern });
        }
        if (phone)
            orConditions.push({ phone });
        if (orConditions.length > 0) {
            const existingUser = await user_model_1.default.findOne({
                _id: { $ne: req.user._id },
                status: { $ne: 2 },
                $or: orConditions,
            }, {
                email: 1,
                phoneNumber: 1,
            });
            if (existingUser) {
                if (email && existingUser.email?.toLowerCase() === email.toLowerCase()) {
                    (0, apiResponse_1.errorResponse)(res, responseMssg_1.USER.emailAlreadyExists);
                    return;
                }
                if (phone && existingUser.phoneNumber === phoneNumber) {
                    (0, apiResponse_1.errorResponse)(res, responseMssg_1.USER.phoneNumberExists);
                    return;
                }
            }
        }
        // Common fields for all users
        const updateData = {
            username,
            email,
            phoneNumber: phone,
            fullName,
            image,
            modifiedAt: new Date(),
        };
        // Update user data for regular users
        const updatedUser = await user_model_1.default.findByIdAndUpdate(req.user._id, updateData, { new: true });
        (0, apiResponse_1.successResponseWithData)(res, responseMssg_1.USER.profileUpdated, updatedUser);
    }
    catch (error) {
        next(error);
    }
};
exports.editProfile = editProfile;
/* -------------------------------------------------------------------------- */
/*                          for user and model change password                */
/* -------------------------------------------------------------------------- */
const changePassword = async (req, res, next) => {
    try {
        if (!req.user) {
            return next(new Error(responseMssg_1.USER.accountNotExists));
        }
        const result = await user_model_1.default.findById(req.user._id);
        if (!result || !(await bcryptjs_1.default.compare(req.body.oldPassword, result.password))) {
            return next(new Error(responseMssg_1.USER.passwordInvalid));
        }
        if (req.body.newPassword !== req.body.confirmPassword) {
            return next(new Error(responseMssg_1.USER.passwordNotMatched));
        }
        const hash = await bcryptjs_1.default.hash(req.body.newPassword, 10);
        await user_model_1.default.findByIdAndUpdate(req.user._id, { password: hash, modifiedAt: new Date() });
        (0, apiResponse_1.successResponse)(res, responseMssg_1.USER.passwordChanged);
    }
    catch (error) {
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
};
exports.changePassword = changePassword;
/* -------------------------------------------------------------------------- */
/*                           getProfile                                       */
/* -------------------------------------------------------------------------- */
const getProfile = async (req, res, next) => {
    try {
        if (!req.user) {
            return next(new Error(responseMssg_1.USER.accountNotExists));
        }
        const result = await user_model_1.default.findById(req.user._id);
        (0, apiResponse_1.successResponseWithData)(res, responseMssg_1.SUCCESS.dataFound, result);
    }
    catch (error) {
        next(error);
    }
};
exports.getProfile = getProfile;
