import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { validationErrorResponse } from '../utils/apiResponse';
import { ValidationError } from '../utils/customError';

// Validation middleware
export const validateRequest = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map(error => ({
        field: error.type === 'field' ? error.path : 'unknown',
        message: error.msg,
        value: error.type === 'field' ? error.value : undefined
      }));

      return validationErrorResponse(
        res,
        'Validation failed',
        formattedErrors
      );
    }

    next();
  };
};

// Custom validation middleware for specific fields
export const validateEmail = (field: string = 'email') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const email = req.body[field];
    if (email && !isValidEmail(email)) {
      return validationErrorResponse(
        res,
        'Invalid email format',
        [{ field, message: 'Please provide a valid email address', value: email }]
      );
    }
    next();
  };
};

export const validatePassword = (field: string = 'password') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const password = req.body[field];
    if (password && !isValidPassword(password)) {
      return validationErrorResponse(
        res,
        'Invalid password format',
        [{ 
          field, 
          message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number', 
          value: password 
        }]
      );
    }
    next();
  };
};

export const validatePhoneNumber = (field: string = 'phoneNumber') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const phoneNumber = req.body[field];
    if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
      return validationErrorResponse(
        res,
        'Invalid phone number format',
        [{ field, message: 'Please provide a valid phone number', value: phoneNumber }]
      );
    }
    next();
  };
};

export const validateObjectId = (field: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[field] || req.body[field];
    if (id && !isValidObjectId(id)) {
      return validationErrorResponse(
        res,
        'Invalid ID format',
        [{ field, message: 'Please provide a valid ID', value: id }]
      );
    }
    next();
  };
};

// Utility validation functions
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

const isValidPassword = (password: string): boolean => {
  // At least 8 characters, one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

const isValidPhoneNumber = (phoneNumber: string): boolean => {
  // Basic phone number validation (adjust regex based on your requirements)
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phoneNumber.replace(/\s/g, ''));
};

const isValidObjectId = (id: string): boolean => {
  const mongoose = require('mongoose');
  return mongoose.Types.ObjectId.isValid(id);
};

// File validation middleware
export const validateFileUpload = (options: {
  maxSize?: number;
  allowedTypes?: string[];
  maxFiles?: number;
} = {}) => {
  const { maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/gif'], maxFiles = 1 } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const files = req.files as Express.Multer.File[];
    const file = req.file;

    if (file) {
      // Single file validation
      if (file.size > maxSize) {
        return validationErrorResponse(
          res,
          'File too large',
          [{ field: 'file', message: `File size must be less than ${maxSize / (1024 * 1024)}MB`, value: file.size }]
        );
      }

      if (!allowedTypes.includes(file.mimetype)) {
        return validationErrorResponse(
          res,
          'Invalid file type',
          [{ field: 'file', message: `File type must be one of: ${allowedTypes.join(', ')}`, value: file.mimetype }]
        );
      }
    }

    if (files && files.length > 0) {
      // Multiple files validation
      if (files.length > maxFiles) {
        return validationErrorResponse(
          res,
          'Too many files',
          [{ field: 'files', message: `Maximum ${maxFiles} files allowed`, value: files.length }]
        );
      }

      for (const file of files) {
        if (file.size > maxSize) {
          return validationErrorResponse(
            res,
            'File too large',
            [{ field: 'file', message: `File size must be less than ${maxSize / (1024 * 1024)}MB`, value: file.size }]
          );
        }

        if (!allowedTypes.includes(file.mimetype)) {
          return validationErrorResponse(
            res,
            'Invalid file type',
            [{ field: 'file', message: `File type must be one of: ${allowedTypes.join(', ')}`, value: file.mimetype }]
          );
        }
      }
    }

    next();
  };
};

// Required field validation
export const validateRequiredFields = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const missingFields: any[] = [];
    
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
      return validationErrorResponse(
        res,
        'Required fields missing',
        missingFields
      );
    }

    next();
  };
};
