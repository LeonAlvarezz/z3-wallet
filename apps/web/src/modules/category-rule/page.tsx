import { CommonHeader } from "@/components/header/CommonHeader";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import { useGetCategoryRuleCount } from "./hooks/use-get-category-rule-count";
import { getCategoryVariantColors } from "../category/constants/category-color-map";
import { CategoryRulePageSkeleton } from "./components/skeletons/CategoryRulePageSkeleton";
import CategoryRuleList from "./components/category-rule/CategoryRuleList";

export default function CategoryMatchPage() {
  const { data, isLoading } = useGetCategoryRuleCount();
  const [expanded, setExpanded] = useState<string>("");

  if (isLoading) {
    return <CategoryRulePageSkeleton />;
  }

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto p-4 pb-[calc(var(--bottom-nav-total-h))]">
      <CommonHeader title="Category Rules" />
      <Accordion
        type="single"
        collapsible
        value={expanded}
        onValueChange={setExpanded}
        className="space-y-2"
      >
        {data?.map((item) => {
          const color = getCategoryVariantColors(item.category.color);
          const itemValue = `category-${item.category.id}`;
          const isExpanded = expanded === itemValue;

          return (
            <div
              key={item.category.id}
              className="bg-card border-input/30 rounded-xl border px-4"
            >
              <AccordionItem value={itemValue}>
                <AccordionTrigger badge={item.total}>
                  <div className="flex items-center gap-4">
                    <div className={cn("flex rounded-md p-2", color.bg)}>
                      <Icon
                        icon={item.category.icon}
                        className={cn("text-xl", color.text)}
                      />
                    </div>
                    <p>{item.category.name}</p>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4">
                  {isExpanded ? (
                    <CategoryRuleList id={item.category.id} />
                  ) : null}
                </AccordionContent>
              </AccordionItem>
            </div>
          );
        })}
      </Accordion>
    </div>
  );
}
