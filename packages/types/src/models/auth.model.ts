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

  export const OAuthSourceSchema = z.enum(["login", "register"]);

  export const OAuthErrorSchema = z.enum([
    "cancelled",
    "expired",
    "no_verified_email",
    "failed",
  ]);

  export const GitHubStartQuerySchema = z.object({
    source: OAuthSourceSchema,
    redirect: z.string().optional(),
  });

  export const GitHubCallbackQuerySchema = z.object({
    code: z.string().optional(),
    state: z.string().optional(),
    error: z.string().optional(),
  });

  export type OAuthSourceDto = z.infer<typeof OAuthSourceSchema>;
  export type OAuthErrorDto = z.infer<typeof OAuthErrorSchema>;
  export type GitHubStartQueryDto = z.infer<typeof GitHubStartQuerySchema>;
  export type GitHubCallbackQueryDto = z.infer<
    typeof GitHubCallbackQuerySchema
  >;

  export type SignUpDto = z.infer<typeof SignUpSchema>;
  export type SignInDto = z.infer<typeof SignInSchema>;
  export type UpsertAuthDto = z.infer<typeof UpsertAuthSchema>;
  export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;
}
