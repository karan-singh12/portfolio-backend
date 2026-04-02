import { ErrorType, CustomError, HttpStatus } from '../types/api.types';

export class AppError extends Error implements CustomError {
  public readonly type: ErrorType;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: any[];
  public readonly context?: any;

  constructor(
    message: string,
    type: ErrorType = ErrorType.INTERNAL_SERVER_ERROR,
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
    isOperational: boolean = true,
    errors?: any[],
    context?: any
  ) {
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

// Specific Error Classes
export class ValidationError extends AppError {
  constructor(message: string, errors?: any[], context?: any) {
    super(message, ErrorType.VALIDATION_ERROR, HttpStatus.UNPROCESSABLE_ENTITY, true, errors, context);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed', context?: any) {
    super(message, ErrorType.AUTHENTICATION_ERROR, HttpStatus.UNAUTHORIZED, true, undefined, context);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied', context?: any) {
    super(message, ErrorType.AUTHORIZATION_ERROR, HttpStatus.FORBIDDEN, true, undefined, context);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', context?: any) {
    super(message, ErrorType.NOT_FOUND_ERROR, HttpStatus.NOT_FOUND, true, undefined, context);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict', context?: any) {
    super(message, ErrorType.CONFLICT_ERROR, HttpStatus.CONFLICT, true, undefined, context);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request', context?: any) {
    super(message, ErrorType.BAD_REQUEST_ERROR, HttpStatus.BAD_REQUEST, true, undefined, context);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error', context?: any) {
    super(message, ErrorType.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR, true, undefined, context);
  }
}

// Error Factory Functions
export const createValidationError = (message: string, errors?: any[], context?: any) => {
  return new ValidationError(message, errors, context);
};

export const createAuthenticationError = (message?: string, context?: any) => {
  return new AuthenticationError(message, context);
};

export const createAuthorizationError = (message?: string, context?: any) => {
  return new AuthorizationError(message, context);
};

export const createNotFoundError = (message?: string, context?: any) => {
  return new NotFoundError(message, context);
};

export const createConflictError = (message?: string, context?: any) => {
  return new ConflictError(message, context);
};

export const createBadRequestError = (message?: string, context?: any) => {
  return new BadRequestError(message, context);
};

export const createInternalServerError = (message?: string, context?: any) => {
  return new InternalServerError(message, context);
};
