import { useLocalStorage } from "@/hooks/use-local-storage";
type SettingState = {
  auto_pair: {
    enabled: boolean;
    threshold: number;
  };
};
export function useSettings() {
  const [settings, setSettings] = useLocalStorage<SettingState>("setting", {
    auto_pair: {
      enabled: true,
      threshold: 5,
    },
  });
  return {
    settings,
    setSettings,
    setAutoPairEnabled: (enabled: boolean) =>
      setSettings((prev) => ({
        ...prev,
        auto_pair: {
          ...prev.auto_pair,
          enabled,
        },
      })),
    setAutoPairThreshold: (threshold: number) =>
      setSettings((prev) => ({
        ...prev,
        auto_pair: {
          ...prev.auto_pair,
          threshold,
        },
      })),
  };
}
