"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gracefulShutdown = exports.notFoundHandler = exports.asyncHandler = exports.errorHandler = void 0;
const customError_1 = require("../utils/customError");
const api_types_1 = require("../types/api.types");
const apiResponse_1 = require("../utils/apiResponse");
// Logging utility (you can replace this with your preferred logging library)
const logError = (error, req) => {
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
const handleMongooseValidationError = (error) => {
    const errors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
        value: err.value
    }));
    return {
        type: api_types_1.ErrorType.VALIDATION_ERROR,
        statusCode: api_types_1.HttpStatus.UNPROCESSABLE_ENTITY,
        message: 'Validation failed',
        errors
    };
};
const handleMongooseCastError = (error) => {
    return {
        type: api_types_1.ErrorType.BAD_REQUEST_ERROR,
        statusCode: api_types_1.HttpStatus.BAD_REQUEST,
        message: `Invalid ${error.path}: ${error.value}`
    };
};
const handleMongooseDuplicateError = (error) => {
    const field = Object.keys(error.keyValue)[0];
    const value = error.keyValue[field];
    return {
        type: api_types_1.ErrorType.CONFLICT_ERROR,
        statusCode: api_types_1.HttpStatus.CONFLICT,
        message: `${field} '${value}' already exists`
    };
};
const handleJWTError = () => {
    return {
        type: api_types_1.ErrorType.AUTHENTICATION_ERROR,
        statusCode: api_types_1.HttpStatus.UNAUTHORIZED,
        message: 'Invalid token. Please log in again!'
    };
};
const handleJWTExpiredError = () => {
    return {
        type: api_types_1.ErrorType.AUTHENTICATION_ERROR,
        statusCode: api_types_1.HttpStatus.UNAUTHORIZED,
        message: 'Your token has expired! Please log in again.'
    };
};
const handleMulterError = (error) => {
    if (error.code === 'LIMIT_FILE_SIZE') {
        return {
            type: api_types_1.ErrorType.BAD_REQUEST_ERROR,
            statusCode: api_types_1.HttpStatus.BAD_REQUEST,
            message: 'File too large. Please upload a smaller file.'
        };
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
        return {
            type: api_types_1.ErrorType.BAD_REQUEST_ERROR,
            statusCode: api_types_1.HttpStatus.BAD_REQUEST,
            message: 'Too many files. Please upload fewer files.'
        };
    }
    return {
        type: api_types_1.ErrorType.BAD_REQUEST_ERROR,
        statusCode: api_types_1.HttpStatus.BAD_REQUEST,
        message: 'File upload error'
    };
};
// Main error handler middleware
const errorHandler = (err, req, res, next) => {
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
    if (err instanceof customError_1.AppError) {
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
            type: api_types_1.ErrorType.INTERNAL_SERVER_ERROR,
            statusCode: api_types_1.HttpStatus.INTERNAL_SERVER_ERROR,
            message: process.env.NODE_ENV === 'production'
                ? 'Something went wrong!'
                : err.message || 'Internal Server Error',
            isOperational: false
        };
    }
    // Send error response
    if (error.errors && error.errors.length > 0) {
        (0, apiResponse_1.errorResponse)(res, error.message, error.statusCode, error.errors);
    }
    else {
        (0, apiResponse_1.errorResponse)(res, error.message, error.statusCode);
    }
};
exports.errorHandler = errorHandler;
// Async error wrapper
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
// 404 handler for undefined routes
const notFoundHandler = (req, res, next) => {
    const error = new customError_1.AppError(`Route ${req.originalUrl} not found`, api_types_1.ErrorType.NOT_FOUND_ERROR, api_types_1.HttpStatus.NOT_FOUND);
    next(error);
};
exports.notFoundHandler = notFoundHandler;
// Graceful shutdown handler
const gracefulShutdown = (server) => {
    return (signal) => {
        console.log(`Received ${signal}. Shutting down gracefully...`);
        server.close(() => {
            console.log('Process terminated');
            process.exit(0);
        });
    };
};
exports.gracefulShutdown = gracefulShutdown;
