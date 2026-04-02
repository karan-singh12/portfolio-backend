"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInternalServerError = exports.createBadRequestError = exports.createConflictError = exports.createNotFoundError = exports.createAuthorizationError = exports.createAuthenticationError = exports.createValidationError = exports.InternalServerError = exports.BadRequestError = exports.ConflictError = exports.NotFoundError = exports.AuthorizationError = exports.AuthenticationError = exports.ValidationError = exports.AppError = void 0;
const api_types_1 = require("../types/api.types");
class AppError extends Error {
    constructor(message, type = api_types_1.ErrorType.INTERNAL_SERVER_ERROR, statusCode = api_types_1.HttpStatus.INTERNAL_SERVER_ERROR, isOperational = true, errors, context) {
        super(message);
        this.type = type;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.errors = errors;
        this.context = context;
        // Maintains proper stack trace for where our error was thrown
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
// Specific Error Classes
class ValidationError extends AppError {
    constructor(message, errors, context) {
        super(message, api_types_1.ErrorType.VALIDATION_ERROR, api_types_1.HttpStatus.UNPROCESSABLE_ENTITY, true, errors, context);
    }
}
exports.ValidationError = ValidationError;
class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed', context) {
        super(message, api_types_1.ErrorType.AUTHENTICATION_ERROR, api_types_1.HttpStatus.UNAUTHORIZED, true, undefined, context);
    }
}
exports.AuthenticationError = AuthenticationError;
class AuthorizationError extends AppError {
    constructor(message = 'Access denied', context) {
        super(message, api_types_1.ErrorType.AUTHORIZATION_ERROR, api_types_1.HttpStatus.FORBIDDEN, true, undefined, context);
    }
}
exports.AuthorizationError = AuthorizationError;
class NotFoundError extends AppError {
    constructor(message = 'Resource not found', context) {
        super(message, api_types_1.ErrorType.NOT_FOUND_ERROR, api_types_1.HttpStatus.NOT_FOUND, true, undefined, context);
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends AppError {
    constructor(message = 'Resource conflict', context) {
        super(message, api_types_1.ErrorType.CONFLICT_ERROR, api_types_1.HttpStatus.CONFLICT, true, undefined, context);
    }
}
exports.ConflictError = ConflictError;
class BadRequestError extends AppError {
    constructor(message = 'Bad request', context) {
        super(message, api_types_1.ErrorType.BAD_REQUEST_ERROR, api_types_1.HttpStatus.BAD_REQUEST, true, undefined, context);
    }
}
exports.BadRequestError = BadRequestError;
class InternalServerError extends AppError {
    constructor(message = 'Internal server error', context) {
        super(message, api_types_1.ErrorType.INTERNAL_SERVER_ERROR, api_types_1.HttpStatus.INTERNAL_SERVER_ERROR, true, undefined, context);
    }
}
exports.InternalServerError = InternalServerError;
// Error Factory Functions
const createValidationError = (message, errors, context) => {
    return new ValidationError(message, errors, context);
};
exports.createValidationError = createValidationError;
const createAuthenticationError = (message, context) => {
    return new AuthenticationError(message, context);
};
exports.createAuthenticationError = createAuthenticationError;
const createAuthorizationError = (message, context) => {
    return new AuthorizationError(message, context);
};
exports.createAuthorizationError = createAuthorizationError;
const createNotFoundError = (message, context) => {
    return new NotFoundError(message, context);
};
exports.createNotFoundError = createNotFoundError;
const createConflictError = (message, context) => {
    return new ConflictError(message, context);
};
exports.createConflictError = createConflictError;
const createBadRequestError = (message, context) => {
    return new BadRequestError(message, context);
};
exports.createBadRequestError = createBadRequestError;
const createInternalServerError = (message, context) => {
    return new InternalServerError(message, context);
};
exports.createInternalServerError = createInternalServerError;
