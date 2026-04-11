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
  cookie: {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
  },
})
  .use(
    cors({
      origin: env.CORS_ORIGINS_LIST,
      credentials: true,
    }),
  );

if (env.METRICS_ENABLED) {
  app
    .onBeforeHandle(({ path, request }) => {
      if (!path.endsWith("/metrics")) return;

      const authorization = request.headers.get("authorization");
      if (authorization === `Bearer ${env.METRICS_TOKEN}`) return;

      return new Response("Not Found", { status: 404 });
    })
    .use(
      prometheusPlugin({
        metricsPath: "/metrics",
        staticLabels: { service: "z3-wallet" },
      }),
    );
}

app.use(openapi()).use(ip).use(errorHandler).use(appInfo).use(routeHandler);

if (import.meta.main) {
  app.listen(env.PORT);
  logger.info("🦊 Elysia is running", {
    host: app.server?.hostname,
    port: app.server?.port,
  });
}

export default app;
