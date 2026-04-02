import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { AUTH } from "../utils/responseMssg";
import Admin from "../models/admin.model";
import asyncHandler from "express-async-handler";

interface DecodedToken extends JwtPayload {
  _id?: string;
}

interface AuthenticatedRequest extends Request {
  user?: any;
}

const verifyToken = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    let tokenKey: string | undefined;

    // Default to admin for now as we've removed public user models
    tokenKey = process.env.TOKEN_SECRET_KEY_1;

    if (!tokenKey) {
      return next({ message: AUTH.tokenRequired });
    }

    const bearerHeader = req.headers.authorization;
    if (!bearerHeader || !bearerHeader.startsWith("Bearer ")) {
      return next({ message: AUTH.tokenRequired });
    }

    const bearerToken = bearerHeader.split(" ")[1];
    if (!bearerToken) {
      return next({ message: AUTH.tokenRequired });
    }

    const decoded = jwt.verify(bearerToken, tokenKey) as DecodedToken;

    if (!decoded._id) {
      return next({ message: AUTH.tokenRequired });
    }

    const user = await Admin.findById(decoded._id).select(
      "-__v -createdAt -updatedAt -password -resetPasswordExpire -resetPasswordToken"
    );

    if (!user) {
      return next({ message: AUTH.tokenRequired });
    }

    req.user = user;
    next();
  } catch (error: any) {
    next(error);
  }
});

export default verifyToken;
