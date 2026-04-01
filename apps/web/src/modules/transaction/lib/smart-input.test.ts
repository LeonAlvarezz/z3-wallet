import {
  CategoryModel,
  CategoryRuleModel,
  TransactionModel,
} from "@z3-wallet/types";
import { describe, expect, it } from "vitest";
import { parseSmartInput } from "./smart-input";

const createdAt = "2026-01-01T00:00:00.000Z";

const categories: CategoryModel.CategoryDto[] = [
  {
    id: 1,
    created_at: createdAt,
    updated_at: null,
    name: "Coffee",
    color: CategoryModel.CategoryColorEnum.YELLOW,
    order: 1,
    icon: "solar:cup-paper-bold-duotone",
  },
  {
    id: 2,
    created_at: createdAt,
    updated_at: null,
    name: "Transportation",
    color: CategoryModel.CategoryColorEnum.GRAY,
    order: 2,
    icon: "solar:scooter-bold-duotone",
  },
];

const rules: CategoryRuleModel.CategoryRuleListDto[] = [
  {
    id: 1,
    name: "Coffee",
    keywords: ["starbucks", "latte"],
  },
  {
    id: 2,
    name: "Transportation",
    keywords: ["grab", "uber"],
  },
];

describe("parseSmartInput", () => {
  it("returns default result for empty input", () => {
    const result = parseSmartInput("   ", categories, rules);

    expect(result.type).toBe(TransactionModel.TransactionTypeEnum.EXPENSE);
    expect(result.amount).toBeUndefined();
    expect(result.category).toBeUndefined();
    expect(result.note).toBeUndefined();
    expect(result.categorySource).toBe("none");
    expect(result.parsed).toEqual({
      amount: false,
      category: false,
      note: false,
    });
    expect(result.warnings).toEqual([]);
  });

  it("parses amount, tag category, and note for expense input", () => {
    const result = parseSmartInput("12.5 Starbucks #coffee", categories, rules);

    expect(result.type).toBe(TransactionModel.TransactionTypeEnum.EXPENSE);
    expect(result.amount).toBe(12.5);
    expect(result.category?.name).toBe("Coffee");
    expect(result.categorySource).toBe("tag");
    expect(result.note).toBe("Starbucks");
    expect(result.warnings).toEqual([]);
  });

  it("matches category from user rules when tail token matches keyword", () => {
    const result = parseSmartInput("morning commute grab", categories, rules);

    expect(result.category?.name).toBe("Transportation");
    expect(result.categorySource).toBe("rule");
    expect(result.note).toBe("grab");
  });

  it("treats plus-prefixed input as top-up", () => {
    const result = parseSmartInput("+100 salary topup", categories, rules);

    expect(result.type).toBe(TransactionModel.TransactionTypeEnum.TOP_UP);
    expect(result.amount).toBe(100);
    expect(result.category).toBeUndefined();
    expect(result.categorySource).toBe("none");
    expect(result.note).toBe("salary topup");
  });

  it("guesses category from tail prefix and adds warning", () => {
    const result = parseSmartInput("bus ride trans", categories, []);

    expect(result.category?.name).toBe("Transportation");
    expect(result.categorySource).toBe("tail");
    expect(result.note).toBe("bus ride");
    expect(result.warnings).toEqual(["Category guessed: Transportation"]);
  });

  it("parses currency-formatted amount tokens", () => {
    const result = parseSmartInput(
      "$1,234.50 airport ride #transportation",
      categories,
      rules,
    );

    expect(result.amount).toBe(1234.5);
    expect(result.category?.name).toBe("Transportation");
    expect(result.categorySource).toBe("tag");
  });

  it("does not parse numbers embedded inside words as amount", () => {
    const result = parseSmartInput("invoice100 #coffee", categories, rules);

    expect(result.amount).toBeUndefined();
    expect(result.category?.name).toBe("Coffee");
  });

  it("falls back to tail/rule matching when explicit tag does not match", () => {
    const result = parseSmartInput(
      "18 office commute uber #unknown",
      categories,
      rules,
    );

    expect(result.amount).toBe(18);
    expect(result.category?.name).toBe("Transportation");
    expect(result.categorySource).toBe("rule");
    expect(result.note).toBe("uber");
  });

  it("normalizes punctuation in explicit tags", () => {
    const result = parseSmartInput(
      "7 morning drink #cof-fee",
      categories,
      rules,
    );

    expect(result.amount).toBe(7);
    expect(result.category?.name).toBe("Coffee");
    expect(result.categorySource).toBe("tag");
  });

  it("supports plus-only top-up notes without amount", () => {
    const result = parseSmartInput("+ payroll pending", categories, rules);

    expect(result.type).toBe(TransactionModel.TransactionTypeEnum.TOP_UP);
    expect(result.amount).toBeUndefined();
    expect(result.note).toBe("+ payroll pending");
    expect(result.parsed.amount).toBe(false);
    expect(result.parsed.note).toBe(true);
  });
});
