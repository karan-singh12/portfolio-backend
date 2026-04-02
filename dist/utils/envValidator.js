"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnvConfig = exports.validateEnvironment = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
const requiredEnvVars = [
    'NODE_ENV',
    'API_PORT',
    'DB_URL',
    'TOKEN_SECRET_KEY_1',
    'ADMIN_TOKEN_EXPIRE'
];
const optionalEnvVars = [
    'DB_USER',
    'DB_PASS',
    'COUNTRY_CODE',
    'ADMIN_RESET_PASSWORD_URL',
    'FORGOT_PASSWORD_ADMIN',
    'USER_SEND_PASSWORD',
    'USER_TOKEN_EXPIRE_TIME',
    'OTP_EXPIRE_TIME',
    'HOST',
    'EMAIL_PORT',
    'EMAIL',
    'PASS',
    'USER_VERIFY_URL',
    'FORGOT_PASSWORD_USER',
    'VERIFY_ACCOUNT_USER',
    'PRIVACY_POLICY',
    'TERMS',
    'ABOUT_US',
    'APP_WELCOME_SCREEN',
    'COMMUNITY_GUIDELINES'
];
const validateEnvironment = () => {
    const missingRequired = [];
    const missingOptional = [];
    // Check required environment variables
    requiredEnvVars.forEach(envVar => {
        if (!process.env[envVar]) {
            missingRequired.push(envVar);
        }
    });
    // Check optional environment variables
    optionalEnvVars.forEach(envVar => {
        if (!process.env[envVar]) {
            missingOptional.push(envVar);
        }
    });
    // Log missing variables
    if (missingRequired.length > 0) {
        console.error('❌ Missing required environment variables:');
        missingRequired.forEach(envVar => {
            console.error(`   - ${envVar}`);
        });
        console.error('\nPlease add these variables to your .env file');
        process.exit(1);
    }
    if (missingOptional.length > 0) {
        console.warn('⚠️  Missing optional environment variables:');
        missingOptional.forEach(envVar => {
            console.warn(`   - ${envVar}`);
        });
        console.warn('These features may not work properly\n');
    }
    // Return validated config
    return {
        NODE_ENV: process.env.NODE_ENV || 'development',
        API_PORT: process.env.API_PORT || '3000',
        DB_URL: process.env.DB_URL,
        DB_USER: process.env.DB_USER,
        DB_PASS: process.env.DB_PASS,
        TOKEN_SECRET_KEY_1: process.env.TOKEN_SECRET_KEY_1,
        TOKEN_SECRET_KEY_2: process.env.TOKEN_SECRET_KEY_2,
        ADMIN_TOKEN_EXPIRE: process.env.ADMIN_TOKEN_EXPIRE,
        USER_TOKEN_EXPIRE_TIME: process.env.USER_TOKEN_EXPIRE_TIME,
        COUNTRY_CODE: process.env.COUNTRY_CODE,
        ADMIN_RESET_PASSWORD_URL: process.env.ADMIN_RESET_PASSWORD_URL,
        USER_VERIFY_URL: process.env.USER_VERIFY_URL,
        FORGOT_PASSWORD_ADMIN: process.env.FORGOT_PASSWORD_ADMIN,
        FORGOT_PASSWORD_USER: process.env.FORGOT_PASSWORD_USER,
        VERIFY_ACCOUNT_USER: process.env.VERIFY_ACCOUNT_USER,
        USER_SEND_PASSWORD: process.env.USER_SEND_PASSWORD,
        OTP_EXPIRE_TIME: process.env.OTP_EXPIRE_TIME,
        HOST: process.env.HOST,
        EMAIL_PORT: process.env.EMAIL_PORT,
        EMAIL: process.env.EMAIL,
        PASS: process.env.PASS,
        PRIVACY_POLICY: process.env.PRIVACY_POLICY,
        TERMS: process.env.TERMS,
        ABOUT_US: process.env.ABOUT_US,
        APP_WELCOME_SCREEN: process.env.APP_WELCOME_SCREEN,
        COMMUNITY_GUIDELINES: process.env.COMMUNITY_GUIDELINES,
        API_VERSION: process.env.API_VERSION,
    };
};
exports.validateEnvironment = validateEnvironment;
const getEnvConfig = () => {
    return (0, exports.validateEnvironment)();
};
exports.getEnvConfig = getEnvConfig;
