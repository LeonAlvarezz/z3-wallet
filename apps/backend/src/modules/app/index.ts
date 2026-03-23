import { BaseModel, SuccessSchema } from "@z3-wallet/types";
import { Success } from "@/core/response";
import Elysia from "elysia";
import { OpenApiKey } from "./openapi";
import { randomNumber } from "@z3-wallet/utils/number";

export const appInfo = new Elysia().get(
  "/health-check",
  () => {
    const uptime = process.uptime();
    console.log(randomNumber(0, 10));
    return Success({
      uptime,
      message: "OK",
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
