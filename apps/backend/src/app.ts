import cors from "@elysiajs/cors";
import { Elysia } from "elysia";
import { errorHandler } from "@/core/error/error-handler";
import env from "@/lib/env";
import { appInfo } from "./modules/app";
import { routeHandler } from "./routes/route-handler";
import openapi from "@elysiajs/openapi";
import { ip } from "./core/request/ip";
import { createScopedLogger } from "./lib/logger";
import prometheusPlugin from "elysia-prometheus";

const logger = createScopedLogger("app");

const app = new Elysia({
  prefix: "/v1",
})
  .use(cors())
  .use(
    prometheusPlugin({
      metricsPath: "/metrics",
      staticLabels: { service: "z3-wallet" },
      dynamicLabels: {
        userAgent: (ctx) => ctx.request.headers.get("user-agent") ?? "unknown",
      },
    }),
  )
  .use(openapi())
  .use(ip)
  .use(errorHandler)
  .use(appInfo)
  .use(routeHandler)
  .listen(env.PORT);

logger.info("🦊 Elysia is running", {
  host: app.server?.hostname,
  port: app.server?.port,
});

export default app;
