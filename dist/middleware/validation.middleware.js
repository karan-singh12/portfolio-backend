"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequiredFields = exports.validateFileUpload = exports.validateObjectId = exports.validatePhoneNumber = exports.validatePassword = exports.validateEmail = exports.validateRequest = void 0;
const express_validator_1 = require("express-validator");
const apiResponse_1 = require("../utils/apiResponse");
// Validation middleware
const validateRequest = (validations) => {
    return async (req, res, next) => {
        // Run all validations
        await Promise.all(validations.map(validation => validation.run(req)));
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const formattedErrors = errors.array().map(error => ({
                field: error.type === 'field' ? error.path : 'unknown',
                message: error.msg,
                value: error.type === 'field' ? error.value : undefined
            }));
            return (0, apiResponse_1.validationErrorResponse)(res, 'Validation failed', formattedErrors);
        }
        next();
    };
};
exports.validateRequest = validateRequest;
// Custom validation middleware for specific fields
const validateEmail = (field = 'email') => {
    return (req, res, next) => {
        const email = req.body[field];
        if (email && !isValidEmail(email)) {
            return (0, apiResponse_1.validationErrorResponse)(res, 'Invalid email format', [{ field, message: 'Please provide a valid email address', value: email }]);
        }
        next();
    };
};
exports.validateEmail = validateEmail;
const validatePassword = (field = 'password') => {
    return (req, res, next) => {
        const password = req.body[field];
        if (password && !isValidPassword(password)) {
            return (0, apiResponse_1.validationErrorResponse)(res, 'Invalid password format', [{
                    field,
                    message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number',
                    value: password
                }]);
        }
        next();
    };
};
exports.validatePassword = validatePassword;
const validatePhoneNumber = (field = 'phoneNumber') => {
    return (req, res, next) => {
        const phoneNumber = req.body[field];
        if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
            return (0, apiResponse_1.validationErrorResponse)(res, 'Invalid phone number format', [{ field, message: 'Please provide a valid phone number', value: phoneNumber }]);
        }
        next();
    };
};
exports.validatePhoneNumber = validatePhoneNumber;
const validateObjectId = (field = 'id') => {
    return (req, res, next) => {
        const id = req.params[field] || req.body[field];
        if (id && !isValidObjectId(id)) {
            return (0, apiResponse_1.validationErrorResponse)(res, 'Invalid ID format', [{ field, message: 'Please provide a valid ID', value: id }]);
        }
        next();
    };
};
exports.validateObjectId = validateObjectId;
// Utility validation functions
const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
};
const isValidPassword = (password) => {
    // At least 8 characters, one uppercase, one lowercase, one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
};
const isValidPhoneNumber = (phoneNumber) => {
    // Basic phone number validation (adjust regex based on your requirements)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phoneNumber.replace(/\s/g, ''));
};
const isValidObjectId = (id) => {
    const mongoose = require('mongoose');
    return mongoose.Types.ObjectId.isValid(id);
};
// File validation middleware
const validateFileUpload = (options = {}) => {
    const { maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/gif'], maxFiles = 1 } = options;
    return (req, res, next) => {
        const files = req.files;
        const file = req.file;
        if (file) {
            // Single file validation
            if (file.size > maxSize) {
                return (0, apiResponse_1.validationErrorResponse)(res, 'File too large', [{ field: 'file', message: `File size must be less than ${maxSize / (1024 * 1024)}MB`, value: file.size }]);
            }
            if (!allowedTypes.includes(file.mimetype)) {
                return (0, apiResponse_1.validationErrorResponse)(res, 'Invalid file type', [{ field: 'file', message: `File type must be one of: ${allowedTypes.join(', ')}`, value: file.mimetype }]);
            }
        }
        if (files && files.length > 0) {
            // Multiple files validation
            if (files.length > maxFiles) {
                return (0, apiResponse_1.validationErrorResponse)(res, 'Too many files', [{ field: 'files', message: `Maximum ${maxFiles} files allowed`, value: files.length }]);
            }
            for (const file of files) {
                if (file.size > maxSize) {
                    return (0, apiResponse_1.validationErrorResponse)(res, 'File too large', [{ field: 'file', message: `File size must be less than ${maxSize / (1024 * 1024)}MB`, value: file.size }]);
                }
                if (!allowedTypes.includes(file.mimetype)) {
                    return (0, apiResponse_1.validationErrorResponse)(res, 'Invalid file type', [{ field: 'file', message: `File type must be one of: ${allowedTypes.join(', ')}`, value: file.mimetype }]);
                }
            }
        }
        next();
    };
};
exports.validateFileUpload = validateFileUpload;
// Required field validation
const validateRequiredFields = (fields) => {
    return (req, res, next) => {
        const missingFields = [];
        fields.forEach(field => {
            if (!req.body[field] || (typeof req.body[field] === 'string' && req.body[field].trim() === '')) {
                missingFields.push({
                    field,
                    message: `${field} is required`,
                    value: req.body[field]
                });
            }
        });
        if (missingFields.length > 0) {
            return (0, apiResponse_1.validationErrorResponse)(res, 'Required fields missing', missingFields);
        }
        next();
    };
};
exports.validateRequiredFields = validateRequiredFields;
