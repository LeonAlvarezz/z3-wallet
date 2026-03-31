import { Elysia } from "elysia";

import {
  ErrorException,
  InvalidCredentialException,
} from "@z3-wallet/exception";
import logger from "@/lib/logger";
import { Fail } from "../response";
import { RateLimitService } from "@/lib/rate-limit";
import { ip } from "../request/ip";
import { getKey } from "@z3-wallet/types/enum";
import { isDrizzleError, parseDrizzleError } from "@/lib/db/error";
import {
  DefaultErrorMessage,
  ErrorCode,
} from "@z3-wallet/types";
import env from "@/lib/env";

export const errorHandler = new Elysia({ name: "error-handling" })
  .use(ip)
  .onError(async ({ error, code, set, ip, request }) => {
    logger.error("🔥 Error occurred", error);

    if (code === "VALIDATION") {
      return Fail({
        message: DefaultErrorMessage.VALIDATION,
        code: getKey(DefaultErrorMessage, DefaultErrorMessage.VALIDATION),
        status: error.status,
        metadata: error.messageValue,
      });
    }

    if (error instanceof ErrorException) {
      if (error instanceof InvalidCredentialException) {
        if (env.NODE_ENV !== "test") {
          const ipAddress = (ip?.address ?? "unknown").replace(/:/g, "-");
          const path = new URL(request.url).pathname;
          const key = `rate-limit:${ipAddress}:${path}`;
          const allowed = await RateLimitService.checkRateLimit({ key });

          if (!allowed) {
            return Fail({
              message: DefaultErrorMessage.RATE_LIMIT,
              status: ErrorCode.RATE_LIMIT,
              code: getKey(
                DefaultErrorMessage,
                DefaultErrorMessage.RATE_LIMIT,
              ),
            });
          }
        }
      }

      return Fail({
        message: error.message,
        status: error.status,
        code: error.code,
      });
    }

    if (isDrizzleError(error)) {
      const parsed = parseDrizzleError(error);
      return Fail({
        message: parsed.message,
        status: parsed.status,
        code: getKey(ErrorCode, parsed.status),
      });
    }

    if (code === "NOT_FOUND") {
      return Fail({
        message: DefaultErrorMessage.ENDPOINT_NOT_FOUND,
        status: error.status,
        code: getKey(DefaultErrorMessage, DefaultErrorMessage.NOT_FOUND),
      });
    }

    return {
      error: {
        status: set?.status ?? 500,
        message: error ?? DefaultErrorMessage.INTERNAL_SERVER,
        code: getKey(DefaultErrorMessage, DefaultErrorMessage.INTERNAL_SERVER),
      },
      success: false,
    };
  })
  .as("global");
