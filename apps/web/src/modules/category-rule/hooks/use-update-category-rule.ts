import { api } from "@/api";
import { queryKey } from "@/api/keys";
import type { CategoryRuleModel } from "@z3-wallet/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateCategoryRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      id: number;
      payload: CategoryRuleModel.UpdateCategoryRuleDto;
    }) => api.categoryRule.update(params.id, params.payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKey.categoryRule.all,
        }),
      ]);
    },
  });
}
