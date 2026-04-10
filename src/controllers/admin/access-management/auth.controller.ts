import { Request, Response, NextFunction, RequestHandler } from "express";
import { addAdminServices } from "../../../services/admin/auth.service";
import { ADMIN, SUCCESS, ERROR } from "../../../utils/responseMssg";
import { successResponse, successResponseWithData, errorResponse, validationError } from "../../../utils/apiResponse";
import Admin from "../../../models/admin.model";
import { sendEmail } from "../../../utils/functions";
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import { log } from "../../../utils/logger";
import { uploadToCloudinary } from "../../../services/cloudinary.service";
import path from "path";
import appRoot from "app-root-path";

interface AuthenticatedRequest extends Request {
  user?: { _id: string };
}

// Admin registration controller
export const addAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;
    const admin = await addAdminServices(name, email, password);
    successResponseWithData(res, ADMIN.adminAdded, admin);
  } catch (error) {
    next(new Error(ERROR.SomethingWrong));
  }
};

export const loginAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = req.body.email.toLowerCase();
    console.log(req.body)

    const data: any = await Admin.findOne(
      { email: { $regex: new RegExp(`^${email}$`, "i") }, status: { $ne: 2 } },
      { createdAt: 0, modifiedAt: 0, __v: 0 }
    ).populate({
      path: "permission",
      select: "_id permissions permissionName"
    });

    if (!data) {
      validationError(res, ADMIN.accountNotExists);
      return
    }

    const match = bcrypt.compareSync(req.body.password, data.password);

    if (!match) {
      errorResponse(res, ADMIN.invalidLogin);
      return
    }

    const token = jwt.sign({ _id: data._id }, process.env.TOKEN_SECRET_KEY_1 as any, {
      expiresIn: process.env.ADMIN_TOKEN_EXPIRE as any
    });

    const { password, ...result } = data.toObject();
    successResponseWithData(res, ADMIN.loginSuccess, { token, result, permissions: data.permissions });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { email } = req.body;
    email = email.toLowerCase();

    const result = await Admin.findOne({ email });
    if (!result) {
      errorResponse(res, ADMIN.emailNotExists);
      return
    }

    // const resetPasswordToken = Math.floor(100000 + Math.random() * 900000).toString();
    const resetPasswordToken: any = 1234;
    let resetPasswordExpiresTime: any = process.env.RESET_PASSWORD_EXPIRE_TIME;
    let resetPasswordExpires: any = Date.now() + resetPasswordExpiresTime * 60 * 1000;
    const link = `${process.env.ADMIN_RESET_PASSWORD_URL}${resetPasswordToken}`;

    if (email) {
      const mailOptions = {
        email,
        subject: "Reset Password",
        message: `Click here to reset your password: ${link}`,
      };
      console.log(mailOptions)

      await sendEmail(mailOptions);
    }

    // Update admin with reset token and expiration
    await Admin.findByIdAndUpdate(result._id, {
      resetPasswordToken,
      resetPasswordExpire: resetPasswordExpires
    });

    // Send success response
    successResponse(res, ADMIN.emailSent);
  } catch (error) {
    next(new Error(ERROR.SomethingWrong));
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { newPassword, token, email } = req.body;
    let date = new Date();

    const result: any = await Admin.findOne({ resetPasswordToken: token }, {
      resetPasswordToken: 1,
      resetPasswordExpire: 1
    });

    if (!result) {
      errorResponse(res, "Admin not found");
      return
    }

    if (result && new Date(result.resetPasswordExpire) < date) {
      errorResponse(res, "Token expired.");
      return
    }

    if (Number(result.resetPasswordToken) != Number(token)) {
      errorResponse(res, "Token is not matched.");
      return
    }

    const hash = await bcrypt.hash(newPassword, 10);

    await Admin.findByIdAndUpdate(result._id, {
      password: hash,
      resetPasswordToken: null,
      resetPasswordExpire: null
    });

    successResponse(res, ADMIN.resetPasswordSuccess);
  } catch (error: any) {
    log(error)
    next(new Error(ERROR.SomethingWrong));
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      errorResponse(res, ADMIN.accountNotExists);
      return
    }

    const result = await Admin.findById(req.user._id);
    if (!result || !(await bcrypt.compare(req.body.oldPassword, result.password))) {
      errorResponse(res, ADMIN.passwordInvalid);
      return
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
      errorResponse(res, ADMIN.passwordNotMatched);
      return
    }

    const hash = await bcrypt.hash(req.body.newPassword, 10);
    await Admin.findByIdAndUpdate(req.user._id, { password: hash, modifiedAt: new Date() });
    successResponse(res, ADMIN.passwordChanged);
  } catch (error) {
    next(new Error(ERROR.SomethingWrong));
  }
};

export const getAdminDetails = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      errorResponse(res, ADMIN.accountNotExists);
      return
    }

    const result = await Admin.findById(req.user._id,);
    successResponseWithData(res, SUCCESS.dataFound, result);
  } catch (error) {
    next(new Error(ERROR.SomethingWrong));
  }
};

export const editProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      errorResponse(res, ADMIN.accountNotExists);
      return
    }

    const updateData: any = {
      name: req.body.name,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      modifiedAt: new Date()
    };

    if (req.files) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (files['resume']) {
        const filePath = path.join(appRoot.path, files['resume'][0].path);
        updateData.resumeUrl = await uploadToCloudinary(filePath, 'resumes');
      }
      if (files['avatar']) {
        const filePath = path.join(appRoot.path, files['avatar'][0].path);
        updateData.avatarUrl = await uploadToCloudinary(filePath, 'avatars');
      }
    }

    let result = await Admin.findByIdAndUpdate({ _id: req.user._id }, { $set: updateData }, { new: true });
    successResponseWithData(res, ADMIN.profileUpdated, result);
  } catch (error) {
    next(new Error(ERROR.SomethingWrong));
  }
};