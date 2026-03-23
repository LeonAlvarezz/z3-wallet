import { requestClient } from "@/lib/request";
import type { CategoryRuleModel } from "@z3-wallet/types";

const key = "/category-rules";

const categoryRule = {
  getRuleList: () =>
    requestClient.get<CategoryRuleModel.CategoryRuleListDto[]>(`${key}`),
  getRuleByCategory: (id: number) =>
    requestClient.get<CategoryRuleModel.CategoryRuleDto[]>(
      `${key}/category/${id}`,
    ),
  getCountByCategory: () =>
    requestClient.get<CategoryRuleModel.CategoryRuleCountDto[]>(`${key}/count`),
  create: (payload: CategoryRuleModel.CreateCategoryRuleDto) =>
    requestClient.post<CategoryRuleModel.CategoryRuleDto>(`${key}`, payload),
  update: (id: number, payload: CategoryRuleModel.UpdateCategoryRuleDto) =>
    requestClient.put<CategoryRuleModel.CategoryRuleDto>(
      `${key}/${id}`,
      payload,
    ),
  delete: (id: number) => requestClient.delete(`${key}/${id}`),
};

export default categoryRule;
