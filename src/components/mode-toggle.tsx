"use client";

import { useI18n } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ModeToggle() {
  const { t } = useI18n();
  const { resolvedTheme, setTheme } = useTheme();
  // The resolved theme is only known in the browser, so keep the server and the
  // first client render identical and swap the label in once mounted.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted ? resolvedTheme === "dark" : undefined;

  return (
    <Button
      aria-label={isDark === false ? t('Switch to dark theme', '切换深色主题', 'ダークテーマに切り替え') : t('Switch to light theme', '切换浅色主题', 'ライトテーマに切り替え')}
      variant="ghost"
      type="button"
      size="icon"
      className="size-[34px] rounded border border-border text-muted-foreground hover:border-border-strong hover:bg-transparent hover:text-foreground"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <SunIcon className="hidden size-[15px] dark:block" />
      <MoonIcon className="size-[15px] dark:hidden" />
    </Button>
  );
}
