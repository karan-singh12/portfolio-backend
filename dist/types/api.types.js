"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpStatus = exports.ErrorType = void 0;
// Error Types
var ErrorType;
(function (ErrorType) {
    ErrorType["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ErrorType["AUTHENTICATION_ERROR"] = "AUTHENTICATION_ERROR";
    ErrorType["AUTHORIZATION_ERROR"] = "AUTHORIZATION_ERROR";
    ErrorType["NOT_FOUND_ERROR"] = "NOT_FOUND_ERROR";
    ErrorType["CONFLICT_ERROR"] = "CONFLICT_ERROR";
    ErrorType["INTERNAL_SERVER_ERROR"] = "INTERNAL_SERVER_ERROR";
    ErrorType["BAD_REQUEST_ERROR"] = "BAD_REQUEST_ERROR";
    ErrorType["FORBIDDEN_ERROR"] = "FORBIDDEN_ERROR";
    ErrorType["UNPROCESSABLE_ENTITY_ERROR"] = "UNPROCESSABLE_ENTITY_ERROR";
    ErrorType["TOO_MANY_REQUESTS_ERROR"] = "TOO_MANY_REQUESTS_ERROR";
    ErrorType["SERVICE_UNAVAILABLE_ERROR"] = "SERVICE_UNAVAILABLE_ERROR";
})(ErrorType || (exports.ErrorType = ErrorType = {}));
// HTTP Status Codes
var HttpStatus;
(function (HttpStatus) {
    HttpStatus[HttpStatus["OK"] = 200] = "OK";
    HttpStatus[HttpStatus["CREATED"] = 201] = "CREATED";
    HttpStatus[HttpStatus["NO_CONTENT"] = 204] = "NO_CONTENT";
    HttpStatus[HttpStatus["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    HttpStatus[HttpStatus["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    HttpStatus[HttpStatus["FORBIDDEN"] = 403] = "FORBIDDEN";
    HttpStatus[HttpStatus["NOT_FOUND"] = 404] = "NOT_FOUND";
    HttpStatus[HttpStatus["CONFLICT"] = 409] = "CONFLICT";
    HttpStatus[HttpStatus["UNPROCESSABLE_ENTITY"] = 422] = "UNPROCESSABLE_ENTITY";
    HttpStatus[HttpStatus["TOO_MANY_REQUESTS"] = 429] = "TOO_MANY_REQUESTS";
    HttpStatus[HttpStatus["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
    HttpStatus[HttpStatus["SERVICE_UNAVAILABLE"] = 503] = "SERVICE_UNAVAILABLE";
})(HttpStatus || (exports.HttpStatus = HttpStatus = {}));
