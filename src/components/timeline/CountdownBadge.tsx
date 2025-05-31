
"use client";

import React from 'react';
import { useState, useEffect } from 'react';
import { differenceInSeconds, intervalToDuration, differenceInDays, isPast } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Hourglass, CheckCircle2, AlertTriangle, Zap, Clock } from 'lucide-react'; // Added Clock
import { cn } from '@/lib/utils';

interface CountdownBadgeProps {
  dueDate: Date | string;
}

interface BadgeStyle {
  variant: 'destructive' | 'warning' | 'neutral-status' | 'complete-status' | 'overdue-status' | 'default';
  icon: JSX.Element;
  textPrefix: string;
  textColorClass?: string; // For specific text color on the badge itself, if needed
}

const getBadgeStyle = (dueDate: Date): BadgeStyle => {
  const now = new Date();
  if (isPast(dueDate)) { 
    return { 
      variant: 'overdue-status' as const, 
      icon: <AlertTriangle className="h-3.5 w-3.5 mr-1" />, 
      textPrefix: "Overdue by ",
      textColorClass: "text-overdue-status-foreground"
    };
  }
  const daysLeft = differenceInDays(dueDate, now);
  if (daysLeft <= 2) { 
    return { 
      variant: 'destructive' as const, 
      icon: <Zap className="h-3.5 w-3.5 mr-1" />, 
      textPrefix: "",
      textColorClass: "text-destructive-foreground"
    };
  }
  if (daysLeft <= 7) { 
    return { 
      variant: 'warning' as const, 
      icon: <Hourglass className="h-3.5 w-3.5 mr-1" />,
      textPrefix: "",
      textColorClass: "text-warning-foreground"
    };
  }
  // Neutral for future events
  return { 
    variant: 'neutral-status' as const, 
    icon: <Clock className="h-3.5 w-3.5 mr-1" />, // Using Clock for neutral
    textPrefix: "",
    textColorClass: "text-black"
  }; 
};


const calculateTimeLeftText = (targetDate: Date) => {
  const now = new Date();
  const secondsRemaining = differenceInSeconds(targetDate, now);

  if (secondsRemaining <= 0) { // Overdue
    const durationPast = intervalToDuration({ start: targetDate, end: now });
    let text = '';
    if (durationPast.years && durationPast.years > 0) text += `${durationPast.years}y `;
    if (durationPast.months && durationPast.months > 0) text += `${durationPast.months}m `;
    // Only show days if significant, otherwise hours/mins might be more relevant for "just overdue"
    if (durationPast.days && durationPast.days > 0) {
       text += `${durationPast.days}d `;
    } else if (!text && durationPast.hours && durationPast.hours > 0) {
        text += `${durationPast.hours}h `;
    } else if (!text && durationPast.minutes && durationPast.minutes > 0) {
        text += `${durationPast.minutes}min `;
    }
    return text.trim() || (Math.abs(secondsRemaining) < 60 ? `${Math.abs(secondsRemaining)}s` : "just now");
  }

  // Upcoming
  const duration = intervalToDuration({ start: now, end: targetDate });
  let text = '';
  if (duration.years && duration.years > 0) text += `${duration.years}y `;
  if (duration.months && duration.months > 0) text += `${duration.months}m `;
  if (duration.days && duration.days > 0) text += `${duration.days}d `;
  if (duration.hours && duration.hours > 0 && (!duration.days || duration.days < 3) && !duration.months && !duration.years) text += `${duration.hours}h `; // Show hours if less than 3 days
  if (duration.minutes && duration.minutes > 0 && !duration.days && !duration.months && !duration.years && (!duration.hours || duration.hours < 1) ) text += `${duration.minutes}m `; // Show minutes if less than 1 hour
  
  text = text.trim() || (secondsRemaining < 60 ? `${secondsRemaining}s` : "Soon");
  return text + (secondsRemaining > 0 && text !== "Soon" ? " left" : "");
};

export default function CountdownBadge({ dueDate }: CountdownBadgeProps) {
  const target = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  
  const [timeLeftText, setTimeLeftText] = useState(calculateTimeLeftText(target));
  const [badgeStyle, setBadgeStyle] = useState(getBadgeStyle(target));

  useEffect(() => {
    const updateBadge = () => {
      setTimeLeftText(calculateTimeLeftText(target));
      setBadgeStyle(getBadgeStyle(target));
    };

    updateBadge(); 

    const timer = setInterval(updateBadge, 1000 * 30); 
    return () => clearInterval(timer);
  }, [target]);
  
  if (target.toString() === "Invalid Date") {
    return <Badge variant="outline" className="border-2 border-strong-border-color text-xs font-space-mono text-muted-foreground shadow-neo-active rounded-[4px]">Invalid Date</Badge>;
  }

  return (
    <Badge 
        variant={badgeStyle.variant as any} 
        className={cn(
            "text-xs font-space-mono px-2 py-0.5 shadow-neo-active border-2 border-strong-border-color rounded-[4px]",
            badgeStyle.textColorClass // Apply specific text color for the badge content
        )}
    >
      {React.cloneElement(badgeStyle.icon, {className: cn(badgeStyle.icon.props.className, "text-current")})} {/* Icon inherits badge text color */}
      {badgeStyle.textPrefix}{timeLeftText}
    </Badge>
  );
}

// Ensure BadgeProps allows for the new semantic variants
import type { VariantProps } from "class-variance-authority";
import { badgeVariants } from "@/components/ui/badge";

declare module "@/components/ui/badge" {
  interface BadgeProps {
    // Make sure this includes all variants defined in badgeVariants + custom ones
    variant: VariantProps<typeof badgeVariants>["variant"] | 'warning' | 'neutral-status' | 'complete-status' | 'overdue-status';
  }
}
    
