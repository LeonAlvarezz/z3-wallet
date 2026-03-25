import { useState } from "react";
import { HubSection } from "../components/HubSection";
import { CommonHeader } from "@/components/header/CommonHeader";
import { useSettings } from "../hooks/use-settings";

export default function CategorySettingsPage() {
  const { settings, setAutoPairEnabled, setAutoPairThreshold } = useSettings();
  return (
    <div className="flex h-full w-full flex-col overflow-y-auto p-4 pb-[calc(var(--bottom-nav-total-h)+1rem)]">
      <CommonHeader title="Category" />
      <HubSection
        title="Matching"
        items={[
          {
            title: "Rules",
            description: "Create keywords that auto-match transactions",
            icon: "solar:tag-bold-duotone",
            to: "/settings/category/rule",
          },
          {
            title: "Auto pair",
            description: "Whether to auto pair",
            icon: "solar:lightbulb-bolt-bold-duotone",
            switch: {
              checked: settings.auto_pair.enabled,
              onCheckedChange: setAutoPairEnabled,
            },
          },
          {
            title: "Pair Threshold",
            description:
              "Control how many data is paired before show suggestion ",
            icon: "solar:lightbulb-bolt-bold-duotone",
            disabled: !settings.auto_pair.enabled,
            inputNumber: {
              onValueChange: setAutoPairThreshold,
              value: settings.auto_pair.threshold,
              max: 10,
            },
          },
        ]}
      />
    </div>
  );
}
