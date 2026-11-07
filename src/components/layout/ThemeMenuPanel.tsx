"use client";

import { useEffect, useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { THEME_CHOICES, isThemeChoice, setThemeChoice } from "@/lib/theme";
import { THEME_ICONS, ThemeTrigger, useThemeChoice, type ThemeMenuLabels } from "./ThemeMenu";

/**
 * The Radix theme menu. It replaces ThemeMenu's plain button on first use and
 * mounts open. Radix moves focus to the first item only when it saw the key
 * press itself, so after a keyboard open this moves focus to the checked item.
 */
export default function ThemeMenuPanel({
  labels,
  openedWithKeyboard,
}: {
  labels: ThemeMenuLabels;
  openedWithKeyboard: boolean;
}) {
  const choice = useThemeChoice();
  const content = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openedWithKeyboard) return;
    const frame = requestAnimationFrame(() => {
      content.current?.querySelector<HTMLElement>('[role="menuitemradio"][aria-checked="true"]')?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [openedWithKeyboard]);

  return (
    <DropdownMenu defaultOpen modal={false}>
      <DropdownMenuTrigger asChild>
        <ThemeTrigger label={labels.label} />
      </DropdownMenuTrigger>
      <DropdownMenuContent ref={content} inline>
        <DropdownMenuRadioGroup value={choice} onValueChange={(value) => isThemeChoice(value) && setThemeChoice(value)}>
          {THEME_CHOICES.map((option) => {
            const Icon = THEME_ICONS[option];
            return (
              <DropdownMenuRadioItem key={option} value={option}>
                <Icon className="text-ink-muted" />
                {labels.options[option]}
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
