"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useState, useSyncExternalStore, type ComponentProps, type KeyboardEvent, type MouseEvent } from "react";
import { SystemThemeIcon } from "@/components/icons/SystemThemeIcon";
import { Button } from "@/components/ui/button";
import { getServerThemeChoice, getThemeChoice, subscribeTheme, type ThemeChoice } from "@/lib/theme";

export const THEME_ICONS = { light: SunIcon, dark: MoonIcon, system: SystemThemeIcon } satisfies Record<ThemeChoice, unknown>;

export interface ThemeMenuLabels {
  label: string;
  options: Record<ThemeChoice, string>;
}

export function useThemeChoice(): ThemeChoice {
  return useSyncExternalStore(subscribeTheme, getThemeChoice, getServerThemeChoice);
}

/** The icon button showing the current theme's glyph. Also the Radix trigger once the menu loads. */
export function ThemeTrigger({ label, ...props }: ComponentProps<"button"> & { label: string }) {
  const Icon = THEME_ICONS[useThemeChoice()];
  return (
    <Button variant="ghost" size="icon" aria-label={label} aria-haspopup="menu" {...props}>
      <Icon className="size-5" />
    </Button>
  );
}

const loadPanel = () => import("./ThemeMenuPanel");

const ThemeMenuPanel = dynamic(loadPanel, {
  ssr: false,
  loading: () => <ThemeTrigger label="" aria-hidden tabIndex={-1} />,
});

/**
 * A plain button until first used, so Radix stays out of the first load.
 * The first click (or Enter, Space, ArrowDown) swaps in the Radix menu,
 * already open; from then on Radix owns focus, keys and focus return.
 */
export function ThemeMenu({ labels }: { labels: ThemeMenuLabels }) {
  const [opened, setOpened] = useState<{ keyboard: boolean } | null>(null);

  if (opened) return <ThemeMenuPanel labels={labels} openedWithKeyboard={opened.keyboard} />;

  return (
    <ThemeTrigger
      label={labels.label}
      aria-expanded={false}
      onPointerEnter={loadPanel}
      onFocus={loadPanel}
      // A click from Enter or Space has detail 0.
      onClick={(event: MouseEvent) => setOpened({ keyboard: event.detail === 0 })}
      onKeyDown={(event: KeyboardEvent) => {
        if (event.key !== "ArrowDown") return;
        event.preventDefault();
        setOpened({ keyboard: true });
      }}
    />
  );
}
