import z from "zod";

export namespace AuthModel {
  export const SignInSchema = z.object({
    email: z.email(),
    password: z
      .string()
      .min(8, { error: "Password must be greater than 8 characters" }),
  });

  export const SignUpSchema = SignInSchema.extend({
    username: z.string(),
  });

  export const UpsertAuthSchema = z.object({
    password_hash: z.string().min(1),
    user_id: z.number().int().positive(),
    password_updated_at: z.iso.date().optional(),
  });

  export const ChangePasswordSchema = z.object({
    current_password: z.string(),
    new_password: z
      .string()
      .min(8, { error: "Password must be greater than 8 characters" }),
  });

  export enum OAuthProvider {
    GITHUB = "github",
    GOOGLE = "google",
  }

  export const OAuthTokenResponseSchema = z.object({
    access_token: z.string().optional(),
    token_type: z.string().optional(),
    scope: z.string().optional(),
    error: z.string().optional(),
    error_description: z.string().optional(),
  });

  export const OAuthSourceSchema = z.enum(["login", "register"]);

  export const OAuthErrorSchema = z.enum([
    "cancelled",
    "expired",
    "no_verified_email",
    "failed",
  ]);

  export const OAuthStartQuerySchema = z.object({
    source: OAuthSourceSchema,
    redirect: z.string().optional(),
  });

  export const OAuthCallbackQuerySchema = z.object({
    code: z.string().optional(),
    state: z.string().optional(),
    error: z.string().optional(),
  });

  export type OAuthSourceDto = z.infer<typeof OAuthSourceSchema>;
  export type OAuthErrorDto = z.infer<typeof OAuthErrorSchema>;
  export type OAuthStartQueryDto = z.infer<typeof OAuthStartQuerySchema>;
  export type OAuthCallbackQueryDto = z.infer<typeof OAuthCallbackQuerySchema>;

  export type OAuthTokenResponseDto = z.infer<typeof OAuthTokenResponseSchema>;
  export type SignUpDto = z.infer<typeof SignUpSchema>;
  export type SignInDto = z.infer<typeof SignInSchema>;
  export type UpsertAuthDto = z.infer<typeof UpsertAuthSchema>;
  export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;
}
