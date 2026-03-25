import { useSyncExternalStore } from "react";

type OS = "ios" | "android" | "macos" | "windows" | "linux" | "unknown";
type DeviceInfo = {
  os: OS;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isIos: boolean;
  isAndroid: boolean;
  isMac: boolean;
  isWindows: boolean;
  isLinux: boolean;
  isAppleDevice: boolean;
  isTouchDevice: boolean;
  viewportWidth: number;
  shortcutModifierLabel: "⌘" | "Ctrl";
  normalizeShortcut: (shortcut: string) => string;
};

function normalizeShortcutToken(token: string, isAppleDevice: boolean): string {
  const normalizedToken = token.trim().toLowerCase();

  switch (normalizedToken) {
    case "meta":
    case "cmd":
    case "command":
    case "⌘":
      return isAppleDevice ? "⌘" : "Ctrl";
    case "ctrl":
    case "control":
      return isAppleDevice ? "⌃" : "Ctrl";
    case "alt":
    case "option":
      return isAppleDevice ? "⌥" : "Alt";
    case "shift":
      return isAppleDevice ? "⇧" : "Shift";
    default:
      if (normalizedToken.length === 1) {
        return normalizedToken.toUpperCase();
      }

      return token.trim();
  }
}

const normalizeAppleShortcut = (shortcut: string) =>
  shortcut
    .split("+")
    .map((token) => normalizeShortcutToken(token, true))
    .join(" ");

const normalizeDefaultShortcut = (shortcut: string) =>
  shortcut
    .split("+")
    .map((token) => normalizeShortcutToken(token, false))
    .join(" + ");

const DEFAULT_DEVICE_INFO: DeviceInfo = {
  os: "unknown",
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  isIos: false,
  isAndroid: false,
  isMac: false,
  isWindows: false,
  isLinux: false,
  isAppleDevice: false,
  isTouchDevice: false,
  viewportWidth: 0,
  shortcutModifierLabel: "Ctrl",
  normalizeShortcut: normalizeDefaultShortcut,
};

// Cache the last computed snapshot
let cachedSnapshot: DeviceInfo = DEFAULT_DEVICE_INFO;

function computeDeviceInfo(): DeviceInfo {
  if (typeof window === "undefined") return DEFAULT_DEVICE_INFO;

  const ua = window.navigator.userAgent;
  const platform = window.navigator.platform;
  const maxTouchPoints = window.navigator.maxTouchPoints;
  const viewportWidth = window.innerWidth;

  const isIos =
    /iPhone|iPad|iPod/i.test(ua) ||
    (platform === "MacIntel" && maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);
  const isMac = /Macintosh|MacIntel|MacPPC|Mac68K/i.test(platform) && !isIos;
  const isWindows = /Win/i.test(platform);
  const isLinux = /Linux/i.test(platform) && !isAndroid;
  const isTouchDevice = maxTouchPoints > 0;
  const isTablet =
    /Tablet|iPad|PlayBook|Silk/i.test(ua) ||
    (!isIos && !isAndroid && viewportWidth >= 768 && viewportWidth < 1024);
  const isMobile = !isTablet && (isIos || isAndroid || viewportWidth < 768);
  const isDesktop = !isMobile && !isTablet;
  const isAppleDevice = isIos || isMac;

  let os: OS = "unknown";
  if (isIos) os = "ios";
  else if (isAndroid) os = "android";
  else if (isMac) os = "macos";
  else if (isWindows) os = "windows";
  else if (isLinux) os = "linux";

  return {
    os,
    isMobile,
    isTablet,
    isDesktop,
    isIos,
    isAndroid,
    isMac,
    isWindows,
    isLinux,
    isAppleDevice,
    isTouchDevice,
    viewportWidth,
    shortcutModifierLabel: isAppleDevice ? "⌘" : "Ctrl",
    normalizeShortcut: isAppleDevice
      ? normalizeAppleShortcut
      : normalizeDefaultShortcut,
  };
}

function getDeviceSnapshot(): DeviceInfo {
  const next = computeDeviceInfo();

  // Return the cached reference if all values are identical
  const keys = Object.keys(next) as (keyof DeviceInfo)[];
  const changed = keys.some((k) => next[k] !== cachedSnapshot[k]);

  if (changed) cachedSnapshot = next;
  return cachedSnapshot;
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("resize", onStoreChange);
  return () => window.removeEventListener("resize", onStoreChange);
}

const useDevice = (): DeviceInfo => {
  return useSyncExternalStore(
    subscribe,
    getDeviceSnapshot,
    () => DEFAULT_DEVICE_INFO,
  );
};

export default useDevice;
