import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/customError';
import { ErrorType, HttpStatus } from '../types/api.types';
import { errorResponse, internalServerErrorResponse } from '../utils/apiResponse';
import mongoose from 'mongoose';

// Logging utility (you can replace this with your preferred logging library)
const logError = (error: any, req: Request) => {
  console.error('Error Details:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
    body: req.body,
    params: req.params,
    query: req.query
  });
};

// Handle different types of errors
const handleMongooseValidationError = (error: mongoose.Error.ValidationError) => {
  const errors = Object.values(error.errors).map((err: any) => ({
    field: err.path,
    message: err.message,
    value: err.value
  }));

  return {
    type: ErrorType.VALIDATION_ERROR,
    statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    message: 'Validation failed',
    errors
  };
};

const handleMongooseCastError = (error: mongoose.Error.CastError) => {
  return {
    type: ErrorType.BAD_REQUEST_ERROR,
    statusCode: HttpStatus.BAD_REQUEST,
    message: `Invalid ${error.path}: ${error.value}`
  };
};

const handleMongooseDuplicateError = (error: any) => {
  const field = Object.keys(error.keyValue)[0];
  const value = error.keyValue[field];
  
  return {
    type: ErrorType.CONFLICT_ERROR,
    statusCode: HttpStatus.CONFLICT,
    message: `${field} '${value}' already exists`
  };
};

const handleJWTError = () => {
  return {
    type: ErrorType.AUTHENTICATION_ERROR,
    statusCode: HttpStatus.UNAUTHORIZED,
    message: 'Invalid token. Please log in again!'
  };
};

const handleJWTExpiredError = () => {
  return {
    type: ErrorType.AUTHENTICATION_ERROR,
    statusCode: HttpStatus.UNAUTHORIZED,
    message: 'Your token has expired! Please log in again.'
  };
};

const handleMulterError = (error: any) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return {
      type: ErrorType.BAD_REQUEST_ERROR,
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'File too large. Please upload a smaller file.'
    };
  }
  
  if (error.code === 'LIMIT_FILE_COUNT') {
    return {
      type: ErrorType.BAD_REQUEST_ERROR,
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Too many files. Please upload fewer files.'
    };
  }

  return {
    type: ErrorType.BAD_REQUEST_ERROR,
    statusCode: HttpStatus.BAD_REQUEST,
    message: 'File upload error'
  };
};

// Main error handler middleware
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Don't send response if headers already sent
  if (res.headersSent) {
    return next(err);
  }

  let error = { ...err };
  error.message = err.message;

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    logError(err, req);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const castError = handleMongooseCastError(err);
    error = {
      ...error,
      ...castError,
      isOperational: true
    };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const duplicateError = handleMongooseDuplicateError(err);
    error = {
      ...error,
      ...duplicateError,
      isOperational: true
    };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const validationError = handleMongooseValidationError(err);
    error = {
      ...error,
      ...validationError,
      isOperational: true
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const jwtError = handleJWTError();
    error = {
      ...error,
      ...jwtError,
      isOperational: true
    };
  }

  if (err.name === 'TokenExpiredError') {
    const jwtExpiredError = handleJWTExpiredError();
    error = {
      ...error,
      ...jwtExpiredError,
      isOperational: true
    };
  }

  // Multer errors (file upload)
  if (err.name === 'MulterError') {
    const multerError = handleMulterError(err);
    error = {
      ...error,
      ...multerError,
      isOperational: true
    };
  }

  // Custom AppError
  if (err instanceof AppError) {
    error = {
      type: err.type,
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors,
      context: err.context,
      isOperational: err.isOperational
    };
  }

  // Default to 500 server error
  if (!error.statusCode) {
    error = {
      type: ErrorType.INTERNAL_SERVER_ERROR,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: process.env.NODE_ENV === 'production' 
        ? 'Something went wrong!' 
        : err.message || 'Internal Server Error',
      isOperational: false
    };
  }

  // Send error response
  if (error.errors && error.errors.length > 0) {
    errorResponse(
      res,
      error.message,
      error.statusCode,
      error.errors
    );
  } else {
    errorResponse(
      res,
      error.message,
      error.statusCode
    );
  }
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler for undefined routes
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(
    `Route ${req.originalUrl} not found`,
    ErrorType.NOT_FOUND_ERROR,
    HttpStatus.NOT_FOUND
  );
  next(error);
};

// Graceful shutdown handler
export const gracefulShutdown = (server: any) => {
  return (signal: string) => {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      console.log('Process terminated');
      process.exit(0);
    });
  };
};