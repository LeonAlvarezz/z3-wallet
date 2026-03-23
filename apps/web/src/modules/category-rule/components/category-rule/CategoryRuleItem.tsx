import DeleteButton from "@/components/delete-button/DeleteButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@iconify/react";
import type { CategoryRuleModel } from "@z3-wallet/types";
import { useState } from "react";
import { useUpdateCategoryRule } from "../../hooks/use-update-category-rule";
import { useDeleteCategoryRule } from "../../hooks/use-delete-category-rule";

type Props = {
  rule: CategoryRuleModel.CategoryRuleDto;
};

export default function CategoryRuleItem({ rule }: Props) {
  const updateMutation = useUpdateCategoryRule();
  const deleteMutation = useDeleteCategoryRule();
  const [isEditing, setIsEditing] = useState(false);
  const [draftKeyword, setDraftKeyword] = useState(rule.keyword);

  const handleSave = async () => {
    const nextKeyword = draftKeyword.trim();
    if (!nextKeyword || nextKeyword === rule.keyword) {
      setIsEditing(false);
      setDraftKeyword(rule.keyword);
      return;
    }

    await updateMutation.mutateAsync({
      id: rule.id,
      payload: {
        keyword: nextKeyword,
      },
    });

    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <li className="flex items-center gap-2">
        <Input
          value={draftKeyword}
          onChange={(e) => setDraftKeyword(e.target.value)}
          onKeyDown={async (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              await handleSave();
            }
            if (e.key === "Escape") {
              e.preventDefault();
              setDraftKeyword(rule.keyword);
              setIsEditing(false);
            }
          }}
        />
        <Button
          variant="outline"
          className="h-9 px-3"
          loading={updateMutation.isPending}
          disabled={!draftKeyword.trim()}
          onClick={handleSave}
        >
          Save
        </Button>
        <Button
          variant="ghost"
          className="h-9 px-3"
          onClick={() => {
            setDraftKeyword(rule.keyword);
            setIsEditing(false);
          }}
        >
          Cancel
        </Button>
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between">
      <div>{rule.keyword}</div>
      <div className="flex items-center">
        <Button
          variant="simple"
          className="p-2!"
          onClick={() => setIsEditing(true)}
        >
          <Icon icon="solar:pen-line-duotone" />
        </Button>
        <DeleteButton
          variant="icon"
          loading={deleteMutation.isPending}
          title="Delete this keyword rule?"
          description="This action cannot be undone and the rule will be removed permanently."
          onConfirm={async () => {
            await deleteMutation.mutateAsync(rule.id);
          }}
        />
      </div>
    </li>
  );
}
