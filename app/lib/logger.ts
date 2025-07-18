import { NextRequest } from 'next/server';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  SECURITY = 'security'
}

export enum SecurityEventType {
  AUTH_SUCCESS = 'auth_success',
  AUTH_FAILURE = 'auth_failure',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  FILE_UPLOAD = 'file_upload',
  DATA_ACCESS = 'data_access',
  PERMISSION_DENIED = 'permission_denied',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity'
}

interface LogContext {
  userId?: string;
  userEmail?: string;
  userRole?: string;
  ip?: string;
  userAgent?: string;
  endpoint?: string;
  method?: string;
  requestId?: string;
  sessionId?: string;
  [key: string]: any;
}

interface SecurityLogContext extends LogContext {
  eventType: SecurityEventType;
  resource?: string;
  action?: string;
  success: boolean;
  reason?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatLog(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      environment: process.env.NODE_ENV,
      service: 'tjbasketballapp',
      ...context
    };

    return JSON.stringify(logEntry);
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) return true;
    
    const logLevels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.SECURITY];
    const currentLevelIndex = logLevels.indexOf(process.env.LOG_LEVEL as LogLevel || LogLevel.INFO);
    const messageLevelIndex = logLevels.indexOf(level);
    
    return messageLevelIndex >= currentLevelIndex;
  }

  private log(level: LogLevel, message: string, context?: LogContext) {
    if (!this.shouldLog(level)) return;

    const formattedLog = this.formatLog(level, message, context);
    
    if (level === LogLevel.ERROR || level === LogLevel.SECURITY) {
      console.error(formattedLog);
    } else if (level === LogLevel.WARN) {
      console.warn(formattedLog);
    } else {
      console.log(formattedLog);
    }
  }

  debug(message: string, context?: LogContext) {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: LogContext) {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: LogContext) {
    const errorContext = {
      ...context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined
    };
    this.log(LogLevel.ERROR, message, errorContext);
  }

  security(message: string, context: SecurityLogContext) {
    this.log(LogLevel.SECURITY, message, context);
  }

  createRequestContext(request: NextRequest, userId?: string, userEmail?: string, userRole?: string): LogContext {
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    return {
      userId,
      userEmail,
      userRole,
      ip,
      userAgent: request.headers.get('user-agent') || 'unknown',
      endpoint: request.nextUrl.pathname,
      method: request.method,
      requestId: request.headers.get('x-request-id') || crypto.randomUUID()
    };
  }
}

export const logger = new Logger();
