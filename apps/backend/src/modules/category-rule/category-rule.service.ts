import { CategoryRuleModel } from "@z3-wallet/types";
import { CategoryRuleRepository } from "./category-rule.repository";
import { NotFoundException } from "@z3-wallet/exception";
import { CategoryRepository } from "../category/category.repository";

export class CategoryRuleService {
  static async quickFindAllRules(user_id: number) {
    return CategoryRuleRepository.quickFindAllRules(user_id);
  }

  static async findByCategoryId(category_id: number, user_id: number) {
    const categoryExists = await CategoryRepository.checkIfExists(category_id);
    if (!categoryExists) {
      throw new NotFoundException({ message: "Category not found" });
    }

    return CategoryRuleRepository.findByCategoryId(category_id, user_id);
  }

  static async countByCategory(user_id: number) {
    return CategoryRuleRepository.countByCategory(user_id);
  }

  static async create(
    payload: CategoryRuleModel.CreateCategoryRuleDto,
    user_id: number,
  ) {
    const categoryExists = await CategoryRepository.checkIfExists(
      payload.category_id,
    );
    if (!categoryExists) {
      throw new NotFoundException({ message: "Category not found" });
    }

    return CategoryRuleRepository.create(payload, user_id);
  }
  static async update(
    id: number,
    user_id: number,
    payload: CategoryRuleModel.UpdateCategoryRuleDto,
  ) {
    if (payload.category_id !== undefined) {
      const categoryExists = await CategoryRepository.checkIfExists(
        payload.category_id,
      );
      if (!categoryExists) {
        throw new NotFoundException({ message: "Category not found" });
      }
    }

    const result = await CategoryRuleRepository.update(id, user_id, payload);
    if (!result) {
      throw new NotFoundException({ message: "Category rule not found" });
    }

    return result;
  }

  static async delete(id: number, user_id: number) {
    const result = await CategoryRuleRepository.delete(id, user_id);
    if (!result) {
      throw new NotFoundException({ message: "Category rule not found" });
    }

    return result;
  }
}
