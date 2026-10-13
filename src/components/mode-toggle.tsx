"use client";

import { useI18n } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";

export function ModeToggle() {
  const { t } = useI18n();
  const { theme, setTheme } = useTheme();

  return (
    <Button
      aria-label={theme === 'dark' ? t('Switch to light theme', '切换浅色主题', 'ライトテーマに切り替え') : t('Switch to dark theme', '切换深色主题', 'ダークテーマに切り替え')}
      variant="ghost"
      type="button"
      size="icon"
      className="px-2"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <SunIcon className="h-[1.2rem] w-[1.2rem] text-neutral-800 dark:hidden dark:text-neutral-200" />
      <MoonIcon className="hidden h-[1.2rem] w-[1.2rem] text-neutral-800 dark:block dark:text-neutral-200" />
    </Button>
  );
}
