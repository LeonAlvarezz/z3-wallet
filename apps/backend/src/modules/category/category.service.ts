import { NotFoundException } from "@z3-wallet/exception";
import { CategoryRepository } from "./category.repository";
import { CategoryModel } from "@z3-wallet/types";

export class CategoryService {
  static async findAll() {
    return await CategoryRepository.findAll();
  }

  static async findById(id: number) {
    const data = await CategoryRepository.findById(id);
    if (!data) throw new NotFoundException();
    return data;
  }

  static async create(payload: CategoryModel.CreateCategoryDto) {
    return await CategoryRepository.create(payload);
  }

  static async update(id: number, payload: CategoryModel.UpdateCategoryDto) {
    const category = await CategoryRepository.findById(id);
    if (!category) throw new NotFoundException();
    return await CategoryRepository.update(id, payload);
  }

  static async delete(id: number) {
    const category = await CategoryRepository.findById(id);
    if (!category) throw new NotFoundException();
    return await CategoryRepository.delete(id);
  }
}
