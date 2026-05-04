import { createContext, useContext, useRef, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { TransactionModel } from "@z3-wallet/types";
import { useCategories } from "@/modules/category/hooks/query/use-categories";
import { toast } from "sonner";
import z from "zod";
import { useUpdateTransaction } from "@/modules/transaction/hooks/use-update-transaction";
import { useCreateTransaction } from "@/modules/transaction/hooks/use-create-transaction";
import { parseSmartInput } from "@/modules/transaction/lib/smart-input";
import { useGetCategoryRuleList } from "@/modules/category-rule/hooks/use-get-category-rule-list";
import { prepareTransactionCreatedAt } from "@/modules/transaction/lib/transaction-date";
type CreateProps = {
  defaultValue?: TransactionModel.CreateTransactionDto;
  action?: "create";
  afterSubmit?: (value: TransactionModel.CreateTransactionDto) => void;
};

type UpdateProps = {
  defaultValue: TransactionModel.CreateTransactionDto;
  transactionId: number;
  action: "update";
  afterSubmit?: (value: TransactionModel.CreateTransactionDto) => void;
};

type Props = CreateProps | UpdateProps;
export const useMutateTransactionForm = (props: Props) => {
  const [initialCreatedAt] = useState(() => new Date().toISOString());
  const [smartText, setSmartText] = useState("");
  const [loading, setLoading] = useState(false);
  const [smartAppliedOnce, setSmartAppliedOnce] = useState(false);
  const noteTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(false);
  const [submitAttempts, setSubmitAttempts] = useState(0);
  const defaultValues: TransactionModel.CreateTransactionDto = props.defaultValue
    ? {
        ...props.defaultValue,
        created_at: props.defaultValue.created_at ?? initialCreatedAt,
      }
    : {
        amount: 0,
        category_id: 0,
        description: "",
        type: TransactionModel.TransactionTypeEnum.EXPENSE,
        created_at: initialCreatedAt,
      };
  const resetAll = () => {
    form.reset();
    setSmartText("");
    setSmartAppliedOnce(false);
    setSubmitAttempts(0);
  };

  const { data: categories = [], isLoading: isCategoryLoading } =
    useCategories();

  const { data: rules = [] } = useGetCategoryRuleList();
  const addMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();

  const CATEGORY_PREVIEW_COUNT = 6;

  const form = useForm({
    defaultValues,

    validators: {
      onSubmit:
        props.action !== "update"
          ? TransactionModel.CreateTransactionSchema.extend({
              description: z.string(),
            })
          : TransactionModel.CreateTransactionSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      setLoading(true);
      const created_at = prepareTransactionCreatedAt(value.created_at, {
        originalCreatedAt: props.defaultValue?.created_at,
      });
      const payload = {
        ...value,
        created_at,
        category_id: value.category_id === 0 ? null : value.category_id,
      };

      try {
        if (props.action !== "update") {
          await addMutation.mutateAsync(payload);
          toast.success("Transaction added");
        } else {
          await updateMutation.mutateAsync({
            id: props.transactionId,
            payload,
          });
          toast.success("Transaction updated");
        }

        props.afterSubmit?.({ ...value, created_at });

        formApi.reset();
        if (props.action !== "update") {
          formApi.setFieldValue("created_at", created_at);
        }
        setSmartText("");
        setSmartAppliedOnce(false);
        setSubmitAttempts(0);
      } finally {
        setLoading(false);
      }
    },
  });
  const isFormComplete = () => {
    const amount = form.getFieldValue("amount");
    const category = form.getFieldValue("category_id");
    const type = form.getFieldValue("type");
    if (type === TransactionModel.TransactionTypeEnum.TOP_UP) {
      return amount > 0;
    }
    return amount > 0 && (category ?? 0) > 0;
  };

  const applySmartInput = (options?: {
    focusNote?: boolean;
    showToasts?: boolean;
  }) => {
    const showToasts = options?.showToasts ?? true;
    const focusNote = options?.focusNote ?? false;

    const result = parseSmartInput(smartText, categories, rules);
    const didParseAnything =
      result.parsed.amount || result.parsed.category || result.parsed.note;

    if (result.amount !== undefined) {
      form.setFieldValue("amount", result.amount);
    }
    if (result.category !== undefined) {
      form.setFieldValue("category_id", result.category.id);

      // If smart input selects a category that's currently hidden,
      // expand so the user can see the selected state.
      const isInPreview = categories
        .slice(0, CATEGORY_PREVIEW_COUNT)
        .some((c) => c.name === result.category?.name);

      if (!isCategoryExpanded && !isInPreview) {
        setIsCategoryExpanded(true);
      }
    }

    if (result.note !== undefined) {
      form.setFieldValue(
        "description",
        result.note.charAt(0).toUpperCase() + result.note.slice(1),
      );
    }

    if (result.type !== undefined) {
      form.setFieldValue("type", result.type);
    }

    if (showToasts) {
      if (!didParseAnything) {
        toast("Couldn't understand that input", {
          description: "Try: 5 Starbucks #coffee or 5 Starbucks coffee",
        });
      } else if (result.warnings.length > 0) {
        toast(result.warnings[0]);
      }
    }

    if (focusNote && (!result.note || !result.category)) {
      noteTextareaRef.current?.scrollIntoView({
        block: "center",
        behavior: "smooth",
      });
      noteTextareaRef.current?.focus();
    }

    setSmartAppliedOnce(true);
  };

  const handleSmartSubmit = () => {
    // 1st tap: apply smart input into the form
    // 2nd tap: if the form is complete, submit
    setSubmitAttempts((n) => n + 1);

    if (!smartAppliedOnce) {
      applySmartInput({ focusNote: false, showToasts: false });
      return;
    }

    if (isFormComplete()) {
      form.handleSubmit();
      return;
    }

    applySmartInput({ focusNote: false, showToasts: false });
  };

  return {
    form,
    smartText,
    setSmartText,
    loading,
    smartAppliedOnce,
    setSmartAppliedOnce,
    submitAttempts,
    setSubmitAttempts,
    applySmartInput,
    handleSmartSubmit,
    isFormComplete,
    categories,
    isCategoryLoading,
    CATEGORY_PREVIEW_COUNT,
    isCategoryExpanded,
    setIsCategoryExpanded,
    noteTextareaRef,
    resetAll,
  };
};

export type UseMutateTransactionFormReturn = ReturnType<
  typeof useMutateTransactionForm
>;

const MutateTransactionContext = createContext<
  UseMutateTransactionFormReturn | undefined
>(undefined);

export const useMutateTransactionContext = () => {
  const context = useContext(MutateTransactionContext);
  if (!context) {
    throw new Error(
      "useMutateTransaction must be used within MutateTransactionForm",
    );
  }
  return context;
};

export default MutateTransactionContext;
