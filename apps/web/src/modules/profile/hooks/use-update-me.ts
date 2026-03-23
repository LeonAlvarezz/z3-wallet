import { api } from "@/api";
import { queryKey } from "@/api/keys";
import type { UserModel } from "@z3-wallet/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateMe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UserModel.UpdateProfileDto) =>
      api.user.updateMe(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKey.auth.me,
      });
    },
  });
}
