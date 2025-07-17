import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  
  // NextAuth
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  
  // API Keys
  ABACUSAI_API_KEY: z.string().min(1, 'ABACUSAI_API_KEY is required'),
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required'),
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required'),
  
  // Security Configuration
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).pipe(z.number().min(60000)).default('900000'),
  RATE_LIMIT_MAX_ATTEMPTS: z.string().transform(Number).pipe(z.number().min(1).max(10)).default('5'),
  SESSION_TIMEOUT_MINUTES: z.string().transform(Number).pipe(z.number().min(5).max(1440)).default('30'),
  MAX_FILE_SIZE_MB: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('50'),
  BCRYPT_ROUNDS: z.string().transform(Number).pipe(z.number().min(10).max(15)).default('12'),
  
  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL'),
  
  // Security Headers
  CSP_NONCE_SECRET: z.string().min(32, 'CSP_NONCE_SECRET must be at least 32 characters'),
  
  // File Upload
  UPLOAD_VIRUS_SCAN_ENABLED: z.string().transform(val => val === 'true').default('false'),
  UPLOAD_MAX_FILES_PER_USER: z.string().transform(Number).pipe(z.number().min(1).max(1000)).default('100'),
  UPLOAD_ALLOWED_EXTENSIONS: z.string().default('.jpg,.jpeg,.png,.webp,.mp4,.webm,.ogg'),
  
  // Database Security
  DB_CONNECTION_LIMIT: z.string().transform(Number).pipe(z.number().min(1).max(50)).default('10'),
  DB_QUERY_TIMEOUT_MS: z.string().transform(Number).pipe(z.number().min(1000).max(60000)).default('30000'),
  
  // Monitoring
  ENABLE_SECURITY_LOGGING: z.string().transform(val => val === 'true').default('true'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

export type EnvConfig = z.infer<typeof envSchema>;

class EnvValidationError extends Error {
  constructor(message: string, public errors: z.ZodError) {
    super(message);
    this.name = 'EnvValidationError';
  }
}

let validatedEnv: EnvConfig | null = null;

export function validateEnv(): EnvConfig {
  if (validatedEnv) {
    return validatedEnv;
  }

  const result = envSchema.safeParse(process.env);
  
  if (!result.success) {
    const errorMessages = result.error.errors.map(
      (error) => `${error.path.join('.')}: ${error.message}`
    );
    
    throw new EnvValidationError(
      `Environment validation failed:\n${errorMessages.join('\n')}`,
      result.error
    );
  }

  validatedEnv = result.data;
  return validatedEnv;
}

export function getEnvConfig(): EnvConfig {
  return validateEnv();
}

// Validate environment on import in production
if (process.env.NODE_ENV === 'production') {
  validateEnv();
} 