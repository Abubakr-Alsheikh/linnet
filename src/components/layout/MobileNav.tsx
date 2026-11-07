"use client";

import { MenuIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useState, type ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface NavLink {
  label: string;
  href: string;
}

export interface MobileNavProps {
  labels: { open: string; title: string; close: string; nav: string };
  wordmark: string;
  links: NavLink[];
  cta: NavLink;
  className?: string;
}

/** The "Menu" button. Also the Radix trigger once the sheet loads. */
export function MenuButton({ label, className, ...props }: ComponentProps<"button"> & { label: string }) {
  return (
    <Button variant="ghost" aria-haspopup="dialog" className={cn("px-3", className)} {...props}>
      <MenuIcon className="size-5" />
      {label}
    </Button>
  );
}

const loadSheet = () => import("./MobileNavSheet");

const MobileNavSheet = dynamic(loadSheet, {
  ssr: false,
  loading: () => <MenuButton label="" aria-hidden tabIndex={-1} />,
});

/**
 * Below `lg`: a plain button until first used, then the Radix dialog sheet,
 * mounted open, so Radix stays out of the first load.
 */
export function MobileNav(props: MobileNavProps) {
  const [used, setUsed] = useState(false);
  if (used) return <MobileNavSheet {...props} />;
  return (
    <MenuButton
      label={props.labels.open}
      aria-expanded={false}
      className={props.className}
      onPointerEnter={loadSheet}
      onFocus={loadSheet}
      onClick={() => setUsed(true)}
    />
  );
}
