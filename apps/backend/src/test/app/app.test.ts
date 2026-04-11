import { describe, it, expect } from "bun:test";
import app from "@/app";
import { APP_VERSION } from "@/constant/app-version";
import { ApiSuccess, BaseModel } from "@z3-wallet/types";

describe("App Health Check", () => {
  it("Should return health check with 200 status", async () => {
    const response = await app.handle(
      new Request("http://localhost:3000/v1/health-check"),
    );

    expect(response.status).toBe(200);
    const data =
      (await response.json()) as ApiSuccess<BaseModel.HealthCheckDto>;
    expect(data).toHaveProperty("success", true);
    expect(data).toHaveProperty("data");
    expect(data.data).toHaveProperty("message", "OK");
    expect(data.data).toHaveProperty("uptime");
    expect(data.data).toHaveProperty("version", APP_VERSION);
    expect(typeof data.data.uptime).toBe("number");
    expect(data.data.uptime).toBeGreaterThanOrEqual(0);
  });

  it("Should have a valid uptime value", async () => {
    const response = await app.handle(
      new Request("http://localhost:3000/v1/health-check"),
    );

    const data = await response.json();
    expect(data.data.uptime).toBeGreaterThan(0);
  });

  it("Should only allow configured CORS origins", async () => {
    const allowedResponse = await app.handle(
      new Request("http://localhost:3000/v1/health-check", {
        headers: {
          Origin: "http://localhost:5173",
        },
      }),
    );
    expect(allowedResponse.headers.get("access-control-allow-origin")).toBe(
      "http://localhost:5173",
    );

    const deniedResponse = await app.handle(
      new Request("http://localhost:3000/v1/health-check", {
        headers: {
          Origin: "https://evil.example",
        },
      }),
    );
    expect(deniedResponse.headers.get("access-control-allow-origin")).toBeNull();
  });

  it("Should not expose metrics by default", async () => {
    const response = await app.handle(
      new Request("http://localhost:3000/v1/metrics"),
    );

    expect(response.status).toBe(404);
  });
});
