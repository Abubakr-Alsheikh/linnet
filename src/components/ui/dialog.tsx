"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * shadcn/ui Dialog, restyled: a `scrim` backdrop with no blur, surface,
 * shadow-float. Two layouts: `DialogContent` (centred) and `DialogSheet`
 * (full width from the top, the mobile nav). Neither holds copy: pass
 * `closeLabel` to show the corner close button.
 *
 * Focus: Radix returns focus to `DialogTrigger` on close. A dialog opened
 * without a trigger returns it to <body>; restore it in `onCloseAutoFocus`.
 */
function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-scrim duration-(--duration-base) data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 data-closed:duration-(--duration-quick)",
        className
      )}
      {...props}
    />
  )
}

function CornerClose({ label }: { label: string }) {
  return (
    <DialogPrimitive.Close data-slot="dialog-close" asChild>
      <Button variant="ghost" size="icon" className="absolute top-2 right-2" aria-label={label}>
        <XIcon />
      </Button>
    </DialogPrimitive.Close>
  )
}

function DialogContent({
  className,
  children,
  closeLabel,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  /** The corner close button's accessible name. Omit it to leave the button out. */
  closeLabel?: string
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-card border border-line bg-surface p-6 text-ink shadow-float outline-none duration-(--duration-base) ease-out-quint sm:max-w-md data-open:animate-in data-open:fade-in-0 data-open:zoom-in-98 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-98 data-closed:duration-(--duration-quick)",
          className
        )}
        {...props}
      >
        {children}
        {closeLabel && <CornerClose label={closeLabel} />}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

/** Full width from the top edge: enters 12 px down with a fade, leaves faster. */
function DialogSheet({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-sheet"
        className={cn(
          "fixed inset-x-0 top-0 z-50 flex max-h-dvh flex-col overflow-y-auto border-b border-line bg-surface text-ink shadow-float outline-none duration-(--duration-base) ease-out-quint data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-top-3 data-closed:animate-out data-closed:fade-out-0 data-closed:slide-out-to-top-3 data-closed:duration-(--duration-quick)",
          className
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("font-display text-h3 font-bold text-ink", className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-base text-ink-muted", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogSheet,
  DialogTitle,
  DialogTrigger,
}
