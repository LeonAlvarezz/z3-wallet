import { normalizeForMatch } from "@/utils/string";
import {
  CategoryRuleModel,
  TransactionModel,
  type CategoryModel,
} from "@z3-wallet/types";

export type SmartInputParseResult = {
  amount?: number;
  category?: CategoryModel.CategoryDto;
  note?: string;
  categorySource: "tag" | "rule" | "tail" | "none";
  parsed: {
    amount: boolean;
    category: boolean;
    note: boolean;
  };
  warnings: string[];
  type: TransactionModel.TransactionTypeEnum;
};

function parseAmountToken(token: string): number | undefined {
  const cleaned = token.trim().replace(/[$,]/g, "");
  if (!/^[+-]?\d+(?:\.\d+)?$/.test(cleaned)) return undefined;
  const num = Number.parseFloat(cleaned);
  if (!Number.isFinite(num)) return undefined;
  return num;
}

function bestCategoryMatch(
  candidateNormalized: string,
  categories: CategoryModel.CategoryDto[],
  rules: CategoryRuleModel.CategoryRuleListDto[],
): {
  category: CategoryModel.CategoryDto | undefined;
  source: "rule" | "keyword" | "none";
  note: string | undefined;
} {
  let note: string | undefined;
  if (!candidateNormalized)
    return {
      category: undefined,
      source: "none",
      note,
    };

  const normalizedCategories = categories.map((c) => ({
    category: c,
    normalized: normalizeForMatch(c.name),
  }));

  const categoryByNormalizedName = new Map(
    normalizedCategories.map((entry) => [entry.normalized, entry.category]),
  );

  // User Rule first (exact keyword match)
  const normalizedRules = rules.map((rule) => ({
    categoryNameNormalized: normalizeForMatch(rule.name ?? ""),
    keywords: rule.keywords.map((k) => normalizeForMatch(k)),
  }));

  const exactRule = normalizedRules.find((rule) => {
    const result = rule.keywords.find((data) => data === candidateNormalized);
    if (result) note = result;
    return result;
  });

  if (exactRule) {
    const matchCategory = categoryByNormalizedName.get(
      exactRule.categoryNameNormalized,
    );

    if (matchCategory) {
      return {
        category: matchCategory,
        source: "rule",
        note,
      };
    }
  }

  // Then prefix rule match
  const prefixRuleMatches = normalizedRules
    .flatMap((rule) =>
      rule.keywords
        .filter((keyword) => keyword.startsWith(candidateNormalized))
        .map((keyword) => ({
          keyword,
          categoryNameNormalized: rule.categoryNameNormalized,
        })),
    )
    .sort((a, b) => a.keyword.length - b.keyword.length);
  if (prefixRuleMatches.length > 0) {
    const matchCategory = categoryByNormalizedName.get(
      prefixRuleMatches[0].categoryNameNormalized,
    );
    if (matchCategory) {
      return {
        category: matchCategory,
        source: "rule",
        note: prefixRuleMatches[0].keyword,
      };
    }
  }

  // Then exact category-name match
  const exact = normalizedCategories.find(
    (c) => c.normalized === candidateNormalized,
  );
  if (exact)
    return {
      category: exact.category,
      source: "keyword",
      note: undefined,
    };

  // Then prefix category-name match (e.g., #trans -> Transportation)
  const prefixMatches = normalizedCategories
    .filter((c) => c.normalized.startsWith(candidateNormalized))
    .sort((a, b) => a.normalized.length - b.normalized.length);

  return prefixMatches.length > 0
    ? {
        category: prefixMatches[0].category,
        source: "keyword",
        note: undefined,
      }
    : {
        category: undefined,
        source: "none",
        note: undefined,
      };
}

/**
 * Parses a natural language string into amount/category/note.
 * - "5 Starbucks #coffee" (tag)
 * - "5 Starbucks coffee" (tail match)
 * - "Starbucks 12 coffee" (amount can appear anywhere)
 */
export function parseSmartInput(
  text: string,
  categories: CategoryModel.CategoryDto[],
  rules: CategoryRuleModel.CategoryRuleListDto[],
): SmartInputParseResult {
  const warnings: string[] = [];
  const raw = text.trim();

  if (!raw) {
    return {
      categorySource: "none",
      parsed: { amount: false, category: false, note: false },
      warnings,
      type: TransactionModel.TransactionTypeEnum.EXPENSE,
    };
  }
  let tokens = raw.split(/\s+/g).filter(Boolean);
  // 1) Amount: first standalone numeric token (allows $12, 12.50, 1,234)

  let amount: number | undefined;
  const amountIndex = tokens.findIndex(
    (t) => parseAmountToken(t) !== undefined,
  );

  if (amountIndex >= 0) {
    amount = parseAmountToken(tokens[amountIndex]);
    tokens = tokens.filter((_, idx) => idx !== amountIndex);
  }

  let type: TransactionModel.TransactionTypeEnum =
    TransactionModel.TransactionTypeEnum.EXPENSE;

  if (raw.startsWith("+")) {
    type = TransactionModel.TransactionTypeEnum.TOP_UP;
  }

  switch (type) {
    case TransactionModel.TransactionTypeEnum.TOP_UP: {
      const noteText = tokens.join(" ").trim();
      const note = noteText ? noteText : undefined;
      return {
        amount,
        category: undefined,
        note,
        categorySource: "none",
        parsed: {
          amount: amount !== undefined,
          category: false,
          note: note !== undefined,
        },
        warnings,
        type,
      };
    }

    // Default to expense
    default: {
      // 2) Category: explicit tag (#coffee/@coffee) preferred
      let category: CategoryModel.CategoryDto | undefined;
      let categorySource: SmartInputParseResult["categorySource"] = "none";
      let note: string | undefined;

      const tagIndex = tokens.findIndex(
        (t) => t.startsWith("#") || t.startsWith("@"),
      );
      if (tagIndex >= 0) {
        const tag = tokens[tagIndex].slice(1);
        const tagNormalized = normalizeForMatch(tag);
        const match = bestCategoryMatch(tagNormalized, categories, rules);
        tokens = tokens.filter((_, idx) => idx !== tagIndex);
        if (match.category) {
          category = match.category;
          categorySource = "tag";
        }
      }

      // 3) Category fallback: tail match (longest match wins)
      if (!category) {
        const maxTailTokens = Math.min(3, tokens.length);
        for (let size = maxTailTokens; size >= 1; size -= 1) {
          const tail = tokens.slice(-size).join(" ");
          const tailNormalized = normalizeForMatch(tail);
          const match = bestCategoryMatch(tailNormalized, categories, rules);
          if (match.category) {
            if (match.source === "rule") {
              category = match.category;
              categorySource = "rule";
              note = match.note;
              break;
            }
            category = match.category;
            categorySource = "tail";
            tokens = tokens.slice(0, -size);
            warnings.push(`Category guessed: ${match.category.name}`);
            break;
          }
        }
      }

      // 4) Note: whatever remains
      if (!note) {
        const noteText = tokens.join(" ").trim();
        note = noteText ? noteText : undefined;
      }

      return {
        amount,
        category,
        note,
        categorySource,
        parsed: {
          amount: amount !== undefined,
          category: category !== undefined,
          note: note !== undefined,
        },
        warnings,
        type,
      };
    }
  }
}
