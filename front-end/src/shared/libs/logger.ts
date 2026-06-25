/* eslint-disable no-console */
import { asError } from "@/shared/utils";

export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

export interface LogContext {
  [key: string]: unknown;
}

export interface LoggerConfig {
  userId?: string;
  companyId?: string;
  [key: string]: unknown;
  isLocal: boolean;
}

// Datadog HTTP log intake (US5). Only active server-side when DD_API_KEY is set.
const DD_INTAKE_URL = "https://http-intake.logs.us5.datadoghq.com/api/v2/logs";

class Logger {
  private config: LoggerConfig;

  constructor(config: LoggerConfig) {
    this.config = config;
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    if (this.config.isLocal) {
      switch (level) {
        case "debug":
          console.debug(message, context);
          break;
        case "info":
          console.info(message, context);
          break;
        case "warn":
          console.warn(message, context);
          break;
        case "error":
          console.error(message, context);
          break;
        default:
          break;
      }
    } else {
      // Also write to stdout so Railway's log viewer always has the line.
      console[level === LogLevel.ERROR ? "error" : level === LogLevel.WARN ? "warn" : "log"](
        JSON.stringify({ level, message, ...context })
      );
      this.sendToDatadog(level, message, context);
    }
  }

  /**
   * Fire-and-forget POST to Datadog's HTTP log intake.
   *
   * Guards:
   * - Server-side only (`typeof window === "undefined"`): DD_API_KEY is never
   *   exposed to the browser bundle and `fetch` in RSC/API routes runs in Node.
   * - Requires DD_API_KEY env var; silently skips when absent (e.g. local dev
   *   without the flag, or client-side hydration).
   * - Errors are swallowed so a Datadog outage never surfaces to users.
   */
  private sendToDatadog(level: LogLevel, message: string, context?: LogContext): void {
    if (typeof window !== "undefined") return;

    const apiKey = process.env.DD_API_KEY;
    if (!apiKey) return;

    const env =
      process.env.RAILWAY_ENVIRONMENT_NAME ?? process.env.RAILWAY_ENVIRONMENT ?? "unknown";

    const payload = JSON.stringify([
      {
        message,
        level,
        service: "base-app",
        ddsource: "nodejs",
        ddtags: `env:${env}`,
        ...(context !== undefined && { context }),
      },
    ]);

    void fetch(DD_INTAKE_URL, {
      method: "POST",
      headers: {
        "DD-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: payload,
    }).catch(() => {
      // Intentional: log transport failures must never bubble up to callers.
    });
  }

  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(error?: unknown, context?: LogContext): void {
    this.log(LogLevel.ERROR, asError(error).message, context);
  }
}

export { Logger };
export const createLogger = (config: LoggerConfig): Logger => new Logger(config);

export const logger = createLogger({
  isLocal: process.env.NEXT_PUBLIC_ENV === "local",
});
