import { requestClient } from "@/lib/request";
import type { UserModel } from "@z3-wallet/types";

const key = "/users";

const user = {
  updateMe: (payload: UserModel.UpdateProfileDto) =>
    requestClient.put<UserModel.UserPublicDto>(`${key}/me`, payload),
};

export default user;
