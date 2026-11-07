"use client";

import { XIcon } from "lucide-react";
import { useRef, useState, type MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogSheet, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MenuButton, type MobileNavProps } from "./MobileNav";
import { Wordmark } from "./Wordmark";

/**
 * Moves to a section after the sheet has closed: the dialog's scroll lock is
 * gone by then, and focus lands on the section (tabIndex -1), so the next Tab
 * continues from there instead of from the Menu button.
 */
function goTo(href: string) {
  const target = document.getElementById(href.slice(1));
  if (!target) return;
  history.pushState(null, "", href);
  target.focus({ preventScroll: true });
  target.scrollIntoView();
}

/** Mounts open in place of MobileNav's plain button. Esc and Close return focus to Menu. */
export default function MobileNavSheet({ labels, wordmark, links, cta, className }: MobileNavProps) {
  const [open, setOpen] = useState(true);
  const pending = useRef<string | null>(null);

  const follow = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault();
    pending.current = href;
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <MenuButton label={labels.open} className={className} />
      </DialogTrigger>
      <DialogSheet
        aria-describedby={undefined}
        onCloseAutoFocus={(event) => {
          const href = pending.current;
          if (!href) return;
          pending.current = null;
          event.preventDefault();
          requestAnimationFrame(() => goTo(href));
        }}
      >
        <DialogTitle className="sr-only">{labels.title}</DialogTitle>
        <div className="page-width flex h-16 shrink-0 items-center justify-between">
          <span aria-hidden="true">
            <Wordmark name={wordmark} />
          </span>
          <DialogClose asChild>
            <Button variant="ghost" className="px-3">
              <XIcon className="size-5" />
              {labels.close}
            </Button>
          </DialogClose>
        </div>
        <nav aria-label={labels.nav} className="page-width">
          <ul className="border-t border-line">
            {links.map((link) => (
              <li key={link.href} className="border-b border-line">
                <a
                  href={link.href}
                  onClick={(event) => follow(event, link.href)}
                  className="flex min-h-16 items-center font-display text-h3 font-bold text-ink -outline-offset-2 hover:text-brand-ink"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="page-width py-6">
          <Button asChild variant="primary" className="w-full">
            <a href={cta.href} onClick={(event) => follow(event, cta.href)}>
              {cta.label}
            </a>
          </Button>
        </div>
      </DialogSheet>
    </Dialog>
  );
}
