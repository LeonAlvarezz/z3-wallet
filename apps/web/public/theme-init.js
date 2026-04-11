try {
  const storageKey = "vite-ui-theme";
  const storedTheme = localStorage.getItem(storageKey);
  const theme =
    storedTheme === "light" ||
    storedTheme === "dark" ||
    storedTheme === "system"
      ? storedTheme
      : "dark";
  const root = document.documentElement;
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
  const resolvedTheme = theme === "system" ? systemTheme : theme;

  root.classList.remove("light", "dark");
  root.classList.add(resolvedTheme);
} catch {
  // Ignore storage and media query access errors during bootstrap.
}
