import z from "zod";
import { BaseModel } from "./base.model";

export namespace UserModel {
  export const UserSchema = BaseModel.BaseRowSchema.extend({
    public_id: z.string(),
    email: z.email(),
    username: z.string(),
    avatar_url: z.string().nullable().optional(),
    last_login_at: z.iso.datetime().nullable().optional(),
  });

  export const UpsertUserSchema = UserSchema.pick({
    email: true,
    username: true,
    last_login_at: true,
    public_id: true,
    updated_at: true,
    avatar_url: true,
  });

  export const UserPublicSchema = UserSchema.omit({
    id: true,
    last_login_at: true,
  });

  export const UpdateProfileSchema = z.object({
    username: z.string().min(1).optional(),
    avatar_url: z.string().nullable().optional(),
  });

  export const UserSessionSchema = z.object({
    session_token: z.string(),
    expires_at: z.iso.datetime(),
    user: z.lazy(() => UserSchema),
  });

  export const UserPublicSessionSchema = z.object({
    expires_at: z.iso.datetime(),
    user: z.lazy(() => UserPublicSchema),
  });

  export type UserPublicDto = z.infer<typeof UserPublicSchema>;
  export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;
  export type UpsertUserDto = z.infer<typeof UpsertUserSchema>;
  export type UserSessionDto = z.infer<typeof UserSessionSchema>;
  export type UserPublicSessionDto = z.infer<typeof UserPublicSessionSchema>;
}
