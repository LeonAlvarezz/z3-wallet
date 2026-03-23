import CategoryRuleItem from "./CategoryRuleItem";
import { useGetCategoryRuleByCategory } from "../../hooks/use-get-category-rule-by-category";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useCreateCategoryRule } from "../../hooks/use-create-category-rule";

type Props = {
  id: number;
  enabled?: boolean;
};

export default function CategoryRuleList({ id, enabled = true }: Props) {
  const { data: rules } = useGetCategoryRuleByCategory(id, enabled);
  const createMutation = useCreateCategoryRule();
  const [newKeyword, setNewKeyword] = useState("");
  const isEmpty = rules?.length === 0;

  const handleCreate = async () => {
    const keyword = newKeyword.trim();
    if (!keyword) return;

    await createMutation.mutateAsync({
      category_id: id,
      keyword,
    });

    setNewKeyword("");
  };

  return (
    <div className="space-y-4 rounded-lg py-2">
      <div className="flex items-center gap-2">
        <Input
          value={newKeyword}
          placeholder="Add new keyword"
          className="h-8"
          onChange={(e) => setNewKeyword(e.target.value)}
          onKeyDown={async (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              await handleCreate();
            }
          }}
        />
        <Button
          className="h-8 px-3"
          loading={createMutation.isPending}
          disabled={!newKeyword.trim()}
          onClick={handleCreate}
        >
          Add
        </Button>
      </div>
      <ul className="space-y-2">
        {isEmpty ? (
          <p className="text-muted-foreground border-dashed text-sm">
            No rules yet. Add your first keyword above.
          </p>
        ) : (
          rules?.map((rule) => <CategoryRuleItem key={rule.id} rule={rule} />)
        )}
      </ul>
    </div>
  );
}
