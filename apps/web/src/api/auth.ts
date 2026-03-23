import { requestClient } from "@/lib/request";
import type { AuthModel, SimpleSuccess, UserModel } from "@z3-wallet/types";

const key = "/auth";

const auth = {
  signIn: (payload: AuthModel.SignInDto) =>
    requestClient.post<UserModel.UserPublicSessionDto>(
      `${key}/sign-in`,
      payload,
    ),
  signOut: () => requestClient.post<SimpleSuccess>(`${key}/sign-out`),
  signUp: (payload: AuthModel.SignUpDto) =>
    requestClient.post<SimpleSuccess>(`${key}/sign-up`, payload),
  getMe: () => requestClient.get<UserModel.UserPublicDto>(`${key}/me`),
  changePassword: (payload: AuthModel.ChangePasswordDto) =>
    requestClient.post<SimpleSuccess>(`${key}/change-password`, payload),
};

export default auth;
