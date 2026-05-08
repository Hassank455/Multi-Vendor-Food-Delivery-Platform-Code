import winston from "winston";
import dotenv from "dotenv";

dotenv.config();

type LogMeta = Record<string, unknown>;

export class LoggerService {
  private logger: winston.Logger;

  constructor(route: string) {
    const logDir = process.env.LOG_FILE_PATH || "logs";
    const isProduction = process.env.NODE_ENV === "production";

    const consoleFormat = winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.printf(({ timestamp, level, message, route, ...meta }) => {
        const metaString = Object.keys(meta).length
          ? ` | ${JSON.stringify(meta)}`
          : "";

        return `${timestamp} | ${level} | ${route} | ${message}${metaString}`;
      }),
    );

    const fileFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
    );

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || "info",
      defaultMeta: {
        route,
        service: "food-delivery-api",
      },
      format: isProduction ? fileFormat : consoleFormat,
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          filename: `${logDir}/${route}.log`,
        }),
        new winston.transports.File({
          filename: `${logDir}/error.log`,
          level: "error",
        }),
      ],
    });
  }

  info(message: string, meta?: LogMeta) {
    this.logger.info(message, meta);
  }

  warn(message: string, meta?: LogMeta) {
    this.logger.warn(message, meta);
  }

  error(message: string, error?: unknown, meta?: LogMeta) {
    if (error instanceof Error) {
      this.logger.error(message, {
        ...meta,
        errorName: error.name,
        errorMessage: error.message,
        stack: error.stack,
      });
      return;
    }

    this.logger.error(message, {
      ...meta,
      error,
    });
  }

  debug(message: string, meta?: LogMeta) {
    this.logger.debug(message, meta);
  }
}

// Usage example:
// import { LoggerService } from "services/logger.service";
// const logger = new LoggerService("myRoute"); myRoute like auth, user, etc.
// logger.info("This is an info message");
// logger.error("This is an error message", { errorCode: 123 });
