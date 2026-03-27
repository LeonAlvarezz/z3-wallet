import TopNav from "@/components/top-nav/TopNav";
import { ToggleRow } from "../components/ToggleRow";
import { useLocalStorage } from "@/hooks/use-local-storage";

type NotificationsSettings = {
  expenseAlerts: boolean;
  budgetWarnings: boolean;
  weeklyReports: boolean;
  categoryAlerts: boolean;
};

const defaultSettings: NotificationsSettings = {
  expenseAlerts: true,
  budgetWarnings: true,
  weeklyReports: false,
  categoryAlerts: false,
};

export default function NotificationsSettingsPage() {
  const [settings, setSettings] = useLocalStorage<NotificationsSettings>(
    "settings.notifications",
    defaultSettings,
  );

  return (
    <div className="flex h-full w-full flex-col gap-6 overflow-y-auto p-4 pb-[calc(var(--bottom-nav-total-h)+1rem)]">
      <TopNav
        title="Notifications"
        back={{
          backTo: "/profile",
          label: "Profile",
        }}
        // back={true}
      />

      <section className="flex flex-col gap-3">
        <h2 className="text-muted-foreground text-sm font-semibold uppercase">
          Notification Settings
        </h2>

        <div className="flex flex-col gap-2">
          <ToggleRow
            title="Expense Alerts"
            description="Get notified when you add transactions"
            checked={settings.expenseAlerts}
            onCheckedChange={(checked) =>
              setSettings((prev) => ({ ...prev, expenseAlerts: checked }))
            }
          />
          <ToggleRow
            title="Budget Warnings"
            description="Alert when approaching budget limit"
            checked={settings.budgetWarnings}
            onCheckedChange={(checked) =>
              setSettings((prev) => ({ ...prev, budgetWarnings: checked }))
            }
          />
          <ToggleRow
            title="Weekly Reports"
            description="Get a spending summary every week"
            checked={settings.weeklyReports}
            onCheckedChange={(checked) =>
              setSettings((prev) => ({ ...prev, weeklyReports: checked }))
            }
          />
          <ToggleRow
            title="Category Alerts"
            description="Alerts for specific categories"
            checked={settings.categoryAlerts}
            onCheckedChange={(checked) =>
              setSettings((prev) => ({ ...prev, categoryAlerts: checked }))
            }
          />
        </div>

        <p className="text-muted-foreground text-xs">
          Changes are saved automatically.
        </p>
      </section>
    </div>
  );
}
