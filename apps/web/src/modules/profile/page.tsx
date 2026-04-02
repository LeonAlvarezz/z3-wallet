import { Icon } from "@iconify/react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useSignOut } from "@/modules/auth/hooks/use-sign-out";
import { useGetMe } from "@/modules/auth/hooks/use-get-me";
import { HubSection } from "@/modules/settings/components/HubSection";
import { useTheme } from "@/modules/theme/use-theme";
import SystemAvatar from "@/components/system-avatar/SystemAvatar";
import { APP_VERSION } from "@/lib/app-version";

export function ProfilePage() {
  const signOutMutation = useSignOut();
  const { data: me } = useGetMe();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="flex h-full w-full flex-col gap-6 overflow-y-auto p-4 pb-[calc(var(--bottom-nav-total-h)+1rem)]">
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <SystemAvatar
            id={me?.avatar_url ?? "1"}
            alt={`${me?.username}-avatar`}
            fallback={me?.username[0]}
            className="size-12"
          />

          <div className="flex flex-1 flex-col">
            <div className="flex items-center justify-between gap-2">
              <p className="text-base font-semibold">
                {me?.username || "Unknown"}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Edit profile"
                onClick={() => {
                  navigate({ to: "/profile/edit" });
                }}
              >
                <Icon icon="solar:pen-new-square-linear" className="size-5" />
              </Button>
            </div>
            <p className="text-muted-foreground text-xs">
              {me?.email || "Unknown"}
            </p>
          </div>
        </div>
      </section>

      <HubSection
        title="Preferences"
        items={[
          {
            title: "Dark Mode",
            description: "Dark Mode",
            icon: "solar:lightbulb-bolt-bold-duotone",
            switch: {
              checked: theme === "dark",
              onCheckedChange: (checked) => {
                setTheme(checked ? "dark" : "light");
              },
            },
          },

          {
            title: "Category Matching",
            description: "Rules and category preferences",
            icon: "solar:tag-bold-duotone",
            to: "/settings/category",
          },
        ]}
      />

      <HubSection
        title="Security"
        items={[
          {
            title: "Change password",
            description: "Change account password",
            icon: "solar:lock-keyhole-minimalistic-unlocked-bold-duotone",
            onClick: () => {
              navigate({
                to: "/profile/change-password",
              });
            },
          },
        ]}
      />

      <Button
        variant="destructive"
        className="w-full"
        loading={signOutMutation.isPending}
        disabled={signOutMutation.isPending}
        onClick={async () => {
          await signOutMutation.mutateAsync();
        }}
      >
        <Icon icon="solar:logout-2-bold" className="size-5" />
        Sign out
      </Button>

      <p className="text-muted-foreground text-center text-xs">
        Version v{APP_VERSION}
      </p>
    </div>
  );
}
