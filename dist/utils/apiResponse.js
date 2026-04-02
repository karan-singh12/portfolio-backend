"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationError = exports.errorResponseWithData = exports.successResponseWithData = exports.customResponse = exports.paginatedResponse = exports.createPaginationMeta = exports.internalServerErrorResponse = exports.conflictResponse = exports.notFoundResponse = exports.forbiddenResponse = exports.unauthorizedResponse = exports.validationErrorResponse = exports.errorResponse = exports.noContentResponse = exports.createdResponse = exports.successResponse = void 0;
const api_types_1 = require("../types/api.types");
const uuid_1 = require("uuid");
// Generate request ID for tracking
const generateRequestId = () => (0, uuid_1.v4)();
// Base response function
const sendResponse = (res, success, statusCode, message, data, errors, meta) => {
    const response = {
        success,
        statusCode,
        message,
        data,
        errors,
        meta: {
            ...meta,
            requestId: meta?.requestId || generateRequestId(),
            version: process.env.API_VERSION || '1.0.0'
        },
        timestamp: new Date().toISOString()
    };
    return res.status(statusCode).json(response);
};
// Success Responses
const successResponse = (res, message, data, meta) => {
    return sendResponse(res, true, api_types_1.HttpStatus.OK, message, data, undefined, meta);
};
exports.successResponse = successResponse;
const createdResponse = (res, message, data, meta) => {
    return sendResponse(res, true, api_types_1.HttpStatus.CREATED, message, data, undefined, meta);
};
exports.createdResponse = createdResponse;
const noContentResponse = (res, message = 'No content', meta) => {
    return sendResponse(res, true, api_types_1.HttpStatus.NO_CONTENT, message, undefined, undefined, meta);
};
exports.noContentResponse = noContentResponse;
// Error Responses
const errorResponse = (res, message, statusCode = api_types_1.HttpStatus.BAD_REQUEST, errors, meta) => {
    return sendResponse(res, false, statusCode, message, undefined, errors, meta);
};
exports.errorResponse = errorResponse;
const validationErrorResponse = (res, message, errors, meta) => {
    return sendResponse(res, false, api_types_1.HttpStatus.UNPROCESSABLE_ENTITY, message, undefined, errors, meta);
};
exports.validationErrorResponse = validationErrorResponse;
const unauthorizedResponse = (res, message = 'Unauthorized access', meta) => {
    return sendResponse(res, false, api_types_1.HttpStatus.UNAUTHORIZED, message, undefined, undefined, meta);
};
exports.unauthorizedResponse = unauthorizedResponse;
const forbiddenResponse = (res, message = 'Access forbidden', meta) => {
    return sendResponse(res, false, api_types_1.HttpStatus.FORBIDDEN, message, undefined, undefined, meta);
};
exports.forbiddenResponse = forbiddenResponse;
const notFoundResponse = (res, message = 'Resource not found', meta) => {
    return sendResponse(res, false, api_types_1.HttpStatus.NOT_FOUND, message, undefined, undefined, meta);
};
exports.notFoundResponse = notFoundResponse;
const conflictResponse = (res, message = 'Resource conflict', meta) => {
    return sendResponse(res, false, api_types_1.HttpStatus.CONFLICT, message, undefined, undefined, meta);
};
exports.conflictResponse = conflictResponse;
const internalServerErrorResponse = (res, message = 'Internal server error', meta) => {
    return sendResponse(res, false, api_types_1.HttpStatus.INTERNAL_SERVER_ERROR, message, undefined, undefined, meta);
};
exports.internalServerErrorResponse = internalServerErrorResponse;
// Pagination Helper
const createPaginationMeta = (page, limit, total) => {
    const totalPages = Math.ceil(total / limit);
    return {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
    };
};
exports.createPaginationMeta = createPaginationMeta;
// Paginated Response
const paginatedResponse = (res, message, data, page, limit, total, meta) => {
    const paginationMeta = (0, exports.createPaginationMeta)(page, limit, total);
    const responseMeta = {
        ...meta,
        pagination: paginationMeta
    };
    return (0, exports.successResponse)(res, message, data, responseMeta);
};
exports.paginatedResponse = paginatedResponse;
// Response with Custom Status
const customResponse = (res, success, statusCode, message, data, errors, meta) => {
    return sendResponse(res, success, statusCode, message, data, errors, meta);
};
exports.customResponse = customResponse;
// Legacy compatibility functions (for gradual migration)
const successResponseWithData = (res, message, data, meta) => {
    return (0, exports.successResponse)(res, message, data, meta);
};
exports.successResponseWithData = successResponseWithData;
const errorResponseWithData = (res, message, data, statusCode = api_types_1.HttpStatus.BAD_REQUEST, meta) => {
    return (0, exports.errorResponse)(res, message, statusCode, undefined, meta);
};
exports.errorResponseWithData = errorResponseWithData;
const validationError = (res, message, errors, meta) => {
    return (0, exports.validationErrorResponse)(res, message, errors, meta);
};
exports.validationError = validationError;
