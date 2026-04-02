import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface EnvConfig {
  NODE_ENV: string;
  API_PORT: string;
  DB_URL: string;
  DB_USER?: string;
  DB_PASS?: string;
  TOKEN_SECRET_KEY_1: string;
  TOKEN_SECRET_KEY_2?: string;
  ADMIN_TOKEN_EXPIRE: string;
  USER_TOKEN_EXPIRE_TIME?: string;
  COUNTRY_CODE?: string;
  ADMIN_RESET_PASSWORD_URL?: string;
  USER_VERIFY_URL?: string;
  FORGOT_PASSWORD_ADMIN?: string;
  FORGOT_PASSWORD_USER?: string;
  VERIFY_ACCOUNT_USER?: string;
  USER_SEND_PASSWORD?: string;
  OTP_EXPIRE_TIME?: string;
  HOST?: string;
  EMAIL_PORT?: string;
  EMAIL?: string;
  PASS?: string;
  PRIVACY_POLICY?: string;
  TERMS?: string;
  ABOUT_US?: string;
  APP_WELCOME_SCREEN?: string;
  COMMUNITY_GUIDELINES?: string;
  API_VERSION?: string;
}

const requiredEnvVars: (keyof EnvConfig)[] = [
  'NODE_ENV',
  'API_PORT', 
  'DB_URL',
  'TOKEN_SECRET_KEY_1',
  'ADMIN_TOKEN_EXPIRE'
];

const optionalEnvVars: (keyof EnvConfig)[] = [
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

export const validateEnvironment = (): EnvConfig => {
  const missingRequired: string[] = [];
  const missingOptional: string[] = [];

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
    DB_URL: process.env.DB_URL!,
    DB_USER: process.env.DB_USER,
    DB_PASS: process.env.DB_PASS,
    TOKEN_SECRET_KEY_1: process.env.TOKEN_SECRET_KEY_1!,
    TOKEN_SECRET_KEY_2: process.env.TOKEN_SECRET_KEY_2,
    ADMIN_TOKEN_EXPIRE: process.env.ADMIN_TOKEN_EXPIRE!,
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

export const getEnvConfig = (): EnvConfig => {
  return validateEnvironment();
};
