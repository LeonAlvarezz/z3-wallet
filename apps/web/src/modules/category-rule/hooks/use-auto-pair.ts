import { useLocalStorage } from "@/hooks/use-local-storage";
import { useSettings } from "@/modules/settings/hooks/use-settings";
import { useGetCategoryRuleList } from "./use-get-category-rule-list";
import { normalizeForMatch } from "@/utils/string";

/**
 * After user click save add pair if not exist
 * {note: "McDonald", category_id: 1, category_name: "Food", amount: 1}
 * Next time, check amount if equal to threshold then show suggestion
 * Click save then request to add rule revalidate the rule
 * If not save, clear from local
 */
export type AutoPairLearningEntry = {
  phrase: string;
  category_id: number;
  count: number;
  next_prompt_count: number;
};

export function useAutoPair() {
  const [pairs, setPairs] = useLocalStorage<
    Record<string, AutoPairLearningEntry>
  >("category-pair", {});
  const { settings } = useSettings();
  const autoPairThreshold = Math.max(settings.auto_pair.threshold, 1);
  const potentialPair = Object.values(pairs).find((value) => {
    return value.count >= value.next_prompt_count;
  });
  const { data: rules = [] } = useGetCategoryRuleList();
  const existingRuleKeys = new Set(
    rules.flatMap((rule) =>
      (rule.keywords ?? []).map(
        (keyword) => `${rule.id}:${normalizeForMatch(keyword)}`,
      ),
    ),
  );
  const getPairKey = ({
    phrase,
    category_id,
  }: Pick<AutoPairLearningEntry, "category_id" | "phrase">) => {
    return `${category_id}:${normalizeForMatch(phrase)}`;
  };
  const logPair = ({
    phrase,
    category_id,
  }: Pick<AutoPairLearningEntry, "category_id" | "phrase">) => {
    const pairKey = getPairKey({ phrase, category_id });
    const alreadyHasRule = existingRuleKeys.has(pairKey);
    if (alreadyHasRule) return;

    setPairs((prev) => {
      const current = prev[pairKey];

      return {
        ...prev,
        [pairKey]: {
          phrase,
          category_id: category_id,
          count: (current?.count ?? 0) + 1,
          next_prompt_count: current?.next_prompt_count ?? autoPairThreshold,
        },
      };
    });
  };

  const deletePair = ({
    phrase,
    category_id,
  }: Pick<AutoPairLearningEntry, "category_id" | "phrase">) => {
    const pairKey = getPairKey({ phrase, category_id });

    setPairs((prev) => {
      if (!prev[pairKey]) return prev;

      const next = { ...prev };
      delete next[pairKey];
      return next;
    });
  };

  const ignorePair = ({
    phrase,
    category_id,
  }: Pick<AutoPairLearningEntry, "category_id" | "phrase">) => {
    const pairKey = getPairKey({ phrase, category_id });

    setPairs((prev) => {
      const current = prev[pairKey];
      if (!current) return prev;

      return {
        ...prev,
        [pairKey]: {
          ...current,
          next_prompt_count: current.next_prompt_count + autoPairThreshold,
        },
      };
    });
  };
  return { logPair, deletePair, potentialPair, ignorePair };
}
