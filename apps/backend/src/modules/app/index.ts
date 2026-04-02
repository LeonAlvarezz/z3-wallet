import { BaseModel, SuccessSchema } from "@z3-wallet/types";
import { Success } from "@/core/response";
import Elysia from "elysia";
import { OpenApiKey } from "./openapi";
import { APP_VERSION } from "@/constant/app-version";

export const appInfo = new Elysia().get(
  "/health-check",
  () => {
    const uptime = process.uptime();
    return Success({
      uptime,
      message: "OK",
      version: APP_VERSION,
    });
  },
  {
    detail: {
      summary: "Health Check",
      tags: [OpenApiKey.App],
    },
    response: {
      200: SuccessSchema(BaseModel.HealthCheckSchema),
    },
  },
);
