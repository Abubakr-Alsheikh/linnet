"use client";

import { RotateCcwIcon } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { durations } from "@/lib/motion";

/** Snap every step to its first frame, then let the transitions play back to rest. */
function play(frame: HTMLElement) {
  frame.dataset.phase = "from";
  void frame.offsetWidth; // commit the first frame before the steps start
  delete frame.dataset.phase;
}

/**
 * Plays a feature diagram once (linnet-motion recipe 5). The server renders
 * the final frame. While the card is still below the viewport the frame
 * snaps to the first frame, out of sight; at 40% visible it plays (at most
 * 1.6 s) and stops, and a Replay button appears. A diagram already on screen
 * when the page hydrates stays still and offers Replay, so nothing jumps.
 * Under reduced motion it stays on the final frame with no Replay. No timer
 * or observer runs once it has played.
 */
export function DiagramFrame({ label, replayLabel, children }: { label: string; replayLabel: string; children: ReactNode }) {
  const frame = useRef<HTMLDivElement>(null);
  const [played, setPlayed] = useState(false);

  useEffect(() => {
    const element = frame.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let armed = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const observers: IntersectionObserver[] = [];
    const stop = () => observers.forEach((observer) => observer.disconnect());

    // First report: is it on screen already? If so, keep the still.
    const seen = new IntersectionObserver(([entry]) => {
      seen.disconnect();
      if (entry.isIntersecting) {
        stop();
        setPlayed(true);
      }
    });
    // Within half a screen below the viewport: snap to the first frame.
    const arm = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !armed && entry.boundingClientRect.top >= window.innerHeight) {
          armed = true;
          element.dataset.phase = "from";
        }
      },
      { rootMargin: "0px 0px 50% 0px" },
    );
    // 40% visible: play once.
    const show = new IntersectionObserver(
      ([entry]) => {
        // The callback also fires when isIntersecting flips at a sliver, so check the ratio.
        if (!entry.isIntersecting || entry.intersectionRatio < 0.4) return;
        stop();
        if (!armed) return setPlayed(true);
        delete element.dataset.phase;
        timer = setTimeout(() => setPlayed(true), durations.diagram * 1000);
      },
      { threshold: 0.4 },
    );
    observers.push(seen, arm, show);
    observers.forEach((observer) => observer.observe(element));
    return () => {
      stop();
      clearTimeout(timer);
    };
  }, []);

  return (
    <div ref={frame} className="group/dg relative">
      <div role="img" aria-label={label} className="relative aspect-[4/3] overflow-hidden rounded-t-lg border-b border-line bg-canvas">
        {children}
      </div>
      {played && (
        <Button
          variant="ghost"
          size="icon"
          aria-label={replayLabel}
          className="absolute top-1 right-1 text-ink-muted animate-in fade-in-0 duration-(--duration-quick) hover:text-ink"
          onClick={() => frame.current && play(frame.current)}
        >
          <RotateCcwIcon />
        </Button>
      )}
    </div>
  );
}
