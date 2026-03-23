import { api } from "@/api";
import type { CategoryModel } from "@z3-wallet/types";
import { useQuery } from "@tanstack/react-query";
import { queryKey } from "@/api/keys";

export const useCategories = () => {
  return useQuery<CategoryModel.CategoryDto[]>({
    queryKey: queryKey.category.all,
    queryFn: () => {
      return api.category.getAll();
    },
    staleTime: Infinity,
  });
};
