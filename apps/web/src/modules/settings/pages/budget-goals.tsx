import * as React from "react";
import { Icon } from "@iconify/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ProgressBar } from "../components/ProgressBar";
import TopNav from "@/components/top-nav/TopNav";
import { useLocalStorage } from "@/hooks/use-local-storage";

type Category = {
  id: string;
  name: string;
  icon: string;
  color:
    | "green"
    | "blue"
    | "yellow"
    | "orange"
    | "red"
    | "purple"
    | "pink"
    | "gray";
};

type BudgetGoal = {
  id: string;
  categoryId: string;
  monthlyLimit: number;
};

const categories: Category[] = [
  {
    id: "food",
    name: "Food & Dining",
    icon: "solar:donut-bold-duotone",
    color: "green",
  },
  {
    id: "travel",
    name: "Travel",
    icon: "solar:bicycling-bold-duotone",
    color: "blue",
  },
  {
    id: "entertainment",
    name: "Entertainment",
    icon: "solar:play-bold-duotone",
    color: "purple",
  },
  {
    id: "shopping",
    name: "Shopping",
    icon: "solar:bag-bold-duotone",
    color: "pink",
  },
  {
    id: "utilities",
    name: "Utilities",
    icon: "solar:lightbulb-bolt-bold-duotone",
    color: "orange",
  },
];

// Mock "spent" numbers per category (replace with real aggregation later)
const mockSpentByCategory: Record<string, number> = {
  food: 345.5,
  travel: 220.0,
  entertainment: 180.75,
  shopping: 165.25,
  utilities: 88.5,
};

function toneForPercentage(pct: number): "green" | "orange" | "red" {
  if (pct > 100) return "red";
  if (pct >= 80) return "orange";
  return "green";
}

function BudgetGoalCard({
  goal,
  onDelete,
  onUpdate,
}: {
  goal: BudgetGoal;
  onDelete: () => void;
  onUpdate: (monthlyLimit: number) => void;
}) {
  const category = categories.find((c) => c.id === goal.categoryId);
  const spent = mockSpentByCategory[goal.categoryId] ?? 0;

  const percentage =
    goal.monthlyLimit > 0 ? (spent / goal.monthlyLimit) * 100 : 0;
  const tone = toneForPercentage(percentage);
  const exceeded = spent > goal.monthlyLimit;

  const [isEditing, setIsEditing] = React.useState(false);
  const [draftLimit, setDraftLimit] = React.useState(String(goal.monthlyLimit));

  React.useEffect(() => {
    setDraftLimit(String(goal.monthlyLimit));
  }, [goal.monthlyLimit]);

  return (
    <div className="bg-card flex flex-col gap-3 rounded-lg border p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-secondary flex size-10 items-center justify-center rounded-lg">
            {category?.icon ? (
              <Icon icon={category.icon} className="size-6" />
            ) : (
              <Icon icon="solar:tag-bold-duotone" className="size-6" />
            )}
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-medium">{category?.name ?? "Unknown"}</p>
            <p className="text-muted-foreground text-xs">
              ${spent.toFixed(2)} spent • ${goal.monthlyLimit.toFixed(2)} limit
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" type="button">
              <Icon icon="solar:menu-dots-bold" className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setIsEditing(true);
              }}
            >
              <Icon icon="solar:pen-new-square-linear" className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onSelect={(e) => {
                e.preventDefault();
                onDelete();
              }}
            >
              <Icon icon="solar:trash-bin-trash-linear" className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-xs">
          {percentage.toFixed(0)}%
        </p>
        {exceeded && (
          <p className="text-xs font-medium text-red-500">Budget exceeded</p>
        )}
      </div>

      <ProgressBar value={percentage} tone={tone} />

      {isEditing && (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            value={draftLimit}
            onChange={(e) => setDraftLimit(e.target.value)}
            placeholder="Monthly limit"
          />
          <Button
            type="button"
            size="sm"
            onClick={() => {
              const next = Number(draftLimit);
              if (!Number.isFinite(next) || next < 0) return;
              onUpdate(next);
              setIsEditing(false);
            }}
          >
            Save
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setDraftLimit(String(goal.monthlyLimit));
              setIsEditing(false);
            }}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}

export default function BudgetGoalsSettingsPage() {
  const [goals, setGoals] = useLocalStorage<BudgetGoal[]>(
    "settings.budgetGoals",
    [
      { id: "goal-food", categoryId: "food", monthlyLimit: 500 },
      { id: "goal-travel", categoryId: "travel", monthlyLimit: 300 },
    ],
  );

  const [newCategoryId, setNewCategoryId] = React.useState<string>(
    categories[0]?.id ?? "",
  );
  const [newLimit, setNewLimit] = React.useState<string>("250");

  const availableCategories = categories.filter(
    (c) => !goals.some((g) => g.categoryId === c.id),
  );

  React.useEffect(() => {
    if (availableCategories.length > 0) {
      setNewCategoryId((prev) =>
        availableCategories.some((c) => c.id === prev)
          ? prev
          : availableCategories[0]!.id,
      );
    }
  }, [availableCategories]);

  const addGoal = () => {
    const limit = Number(newLimit);
    if (!newCategoryId) return;
    if (!Number.isFinite(limit) || limit <= 0) return;

    setGoals((prev) => [
      ...prev,
      {
        id: `goal-${newCategoryId}`,
        categoryId: newCategoryId,
        monthlyLimit: limit,
      },
    ]);
  };

  return (
    <div className="app-page-regular flex h-full flex-col gap-6 overflow-y-auto px-4 py-4 pb-[calc(var(--bottom-nav-total-h)+1rem)] lg:px-8 xl:px-10">
      <TopNav
        title="Budget Goals"
        back={{
          backTo: "/profile",
          label: "Profile",
        }}
        // back={true}
      />

      <section className="flex flex-col gap-2">
        <h2 className="text-muted-foreground text-sm font-semibold uppercase">
          Set monthly spending limits per category
        </h2>

        <div className="bg-card rounded-lg border p-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Icon
                      icon={
                        categories.find((c) => c.id === newCategoryId)?.icon ??
                        "solar:tag-bold-duotone"
                      }
                      className="size-5"
                    />
                    <span>
                      {categories.find((c) => c.id === newCategoryId)?.name ??
                        "Select category"}
                    </span>
                  </span>
                  <Icon icon="solar:alt-arrow-down-linear" className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {availableCategories.length === 0 ? (
                  <DropdownMenuItem disabled>
                    All categories already have goals
                  </DropdownMenuItem>
                ) : (
                  availableCategories.map((c) => (
                    <DropdownMenuItem
                      key={c.id}
                      onSelect={(e) => {
                        e.preventDefault();
                        setNewCategoryId(c.id);
                      }}
                    >
                      <Icon icon={c.icon} className="size-4" />
                      {c.name}
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Input
              type="number"
              inputMode="decimal"
              min={0}
              value={newLimit}
              onChange={(e) => setNewLimit(e.target.value)}
              placeholder="Monthly limit (USD)"
            />

            <Button
              type="button"
              onClick={addGoal}
              disabled={availableCategories.length === 0}
            >
              Add goal
            </Button>
          </div>
        </div>

        <p className="text-muted-foreground text-xs">
          Progress colors: green (safe), orange (near limit), red (exceeded).
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-muted-foreground text-sm font-semibold uppercase">
          Your goals
        </h2>

        {goals.length === 0 ? (
          <div className="bg-card/50 flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-12">
            <Icon
              icon="solar:wallet-bold"
              className="text-muted-foreground size-8"
            />
            <p className="text-muted-foreground text-sm">No goals yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {goals.map((goal) => (
              <BudgetGoalCard
                key={goal.id}
                goal={goal}
                onDelete={() =>
                  setGoals((prev) => prev.filter((g) => g.id !== goal.id))
                }
                onUpdate={(monthlyLimit) =>
                  setGoals((prev) =>
                    prev.map((g) =>
                      g.id === goal.id ? { ...g, monthlyLimit } : g,
                    ),
                  )
                }
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
