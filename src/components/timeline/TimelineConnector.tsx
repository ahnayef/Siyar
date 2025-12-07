"use client";

import { cn } from "@/lib/utils";

interface TimelineConnectorProps {
  orientation: "vertical" | "horizontal";
  isFirst?: boolean;
  isLast?: boolean;
  className?: string;
}

// This component is more conceptual for styling. EventCard will position itself along this.
// The main line can be a pseudo-element on the parent container.
// This component can represent the "dot" on the line for each event.

export default function TimelineConnector({ orientation, className }: TimelineConnectorProps) {
  // For a simple dot on the line
  return (
    <div className={cn(
      "absolute bg-primary rounded-full border-2 border-background shadow-md",
      orientation === "vertical" ? "w-4 h-4 left-1/2 -translate-x-1/2" : "w-4 h-4 top-1/2 -translate-y-1/2",
      className
    )}>
    </div>
  );
}

// Usage:
// Parent div (e.g., ul for events) would have:
// - For vertical: `relative timeline-line-vertical ml-4 pl-8` (ml for dot offset, pl for content)
// - For horizontal: `relative timeline-line-horizontal mt-4 pt-8` (mt for dot offset, pt for content)

// Each EventCard li would have:
// - For vertical: `relative mb-8`, then TimelineConnector with `top-0` (or adjust based on card header)
// - For horizontal: `relative mr-8`, then TimelineConnector with `left-0` (or adjust)

// The actual line is better handled by pseudo-elements on the container of EventCards,
// as defined in globals.css (`timeline-line-vertical`, `timeline-line-horizontal`).
// This component (`TimelineConnector`) can be simplified to be a "node" or "marker" on that line
// associated with each event, or removed if card styling itself indicates the point on the timeline.

// For simplicity, we'll rely on the container's pseudo-element for the line and EventCards will align to it.
// This component might be used for the "dot" on the line if desired.
// Let's simplify the EventCard structure not to directly use this, but to assume the line exists.
// Individual EventCards could have a small ::before element to "connect" to the main timeline if they are offset.
