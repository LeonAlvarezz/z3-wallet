import { z } from "zod";

export namespace BaseModel {
  export const SimpleBaseRowSchema = z.object({
    id: z.number(),
    created_at: z.iso.datetime(),
    updated_at: z.iso.datetime().nullable().optional(),
  });
  export const BaseRowSchema = z.object({
    id: z.number(),
    created_at: z.iso.datetime(),
    updated_at: z.iso.datetime().nullable().optional(),
    deleted_at: z.iso.datetime().nullable().optional(),
  });

  export const BaseRowNullableSchema = BaseRowSchema.extend({
    updated_at: z.iso.datetime().nullable().optional(),
    deleted_at: z.iso.datetime().nullable().optional(),
  });

  export const HealthCheckSchema = z.object({
    uptime: z.number(),
    message: z.string().default("OK"),
    version: z.string(),
  });

  export const CookieSchema = z.object({
    session_token: z.string().optional(),
  });

  export const NumberIdSchema = z.object({
    id: z.coerce.number(),
  });

  export type CookieDto = z.infer<typeof CookieSchema>;
  export type NumberIdDto = z.infer<typeof NumberIdSchema>;
  export type HealthCheckDto = z.infer<typeof HealthCheckSchema>;

  export enum TimeFrameEnum {
    TODAY = "today",
    YESTERDAY = "yesterday",
    WEEK = "week",
    MONTH = "month",
    YEAR = "year",
    ALL_TIME = "all",
  }
}
