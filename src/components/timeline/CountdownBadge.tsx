
"use client";

import * as React from 'react';
import { useState, useEffect } from 'react';
import { differenceInSeconds, intervalToDuration, differenceInDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Hourglass, CheckCircle2, AlertTriangle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CountdownBadgeProps {
  dueDate: Date | string;
}

const getBadgeStyle = (dueDate: Date) => {
  const now = new Date();
  if (dueDate < now) { // Overdue
    return { 
      variant: 'overdue-status' as const, 
      icon: <AlertTriangle className="h-3.5 w-3.5 mr-1" />, 
      textPrefix: "Overdue by " 
    };
  }
  const daysLeft = differenceInDays(dueDate, now);
  if (daysLeft <= 2) { // Urgent
    return { 
      variant: 'destructive' as const, // maps to --destructive (Urgent #FF3A5D)
      icon: <Zap className="h-3.5 w-3.5 mr-1" />, 
      textPrefix: ""
    };
  }
  if (daysLeft <= 7) { // Warning
    return { 
      variant: 'warning' as const, // maps to --warning (#FFCE3A)
      icon: <Hourglass className="h-3.5 w-3.5 mr-1" />,
      textPrefix: ""
    };
  }
  // Neutral
  return { 
    variant: 'neutral-status' as const, // maps to --neutral-status (#8491A7)
    icon: <CheckCircle2 className="h-3.5 w-3.5 mr-1" />,
    textPrefix: ""
  }; 
};


const calculateTimeLeftText = (targetDate: Date) => {
  const now = new Date();
  const secondsRemaining = differenceInSeconds(targetDate, now);

  if (secondsRemaining <= 0) {
    const durationPast = intervalToDuration({ start: targetDate, end: now });
    let text = '';
    if (durationPast.years && durationPast.years > 0) text += `${durationPast.years}y `;
    if (durationPast.months && durationPast.months > 0) text += `${durationPast.months}m `;
    if (durationPast.days && durationPast.days > 0) text += `${durationPast.days}d `;
    if (!text && durationPast.hours && durationPast.hours > 0) text += `${durationPast.hours}h`;
    if (!text && durationPast.minutes && durationPast.minutes > 0) text += `${durationPast.minutes}min`;
    return text.trim() || (Math.abs(secondsRemaining) < 60 ? `${Math.abs(secondsRemaining)}s ago` : "Past Due");
  }

  const duration = intervalToDuration({ start: now, end: targetDate });
  let text = '';
  if (duration.years && duration.years > 0) text += `${duration.years}y `;
  if (duration.months && duration.months > 0) text += `${duration.months}m `;
  if (duration.days && duration.days > 0) text += `${duration.days}d `;
  if (duration.hours && duration.hours > 0 && (!duration.days || duration.days < 2) && !duration.months && !duration.years) text += `${duration.hours}h `;
  if (duration.minutes && duration.minutes > 0 && !duration.days && !duration.months && !duration.years && !duration.hours) text += `${duration.minutes}min`;
  
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

    updateBadge(); // Initial calculation

    const timer = setInterval(updateBadge, 1000 * 30); // Update every 30 seconds
    return () => clearInterval(timer);
  }, [target]);
  
  if (target.toString() === "Invalid Date") {
    return <Badge variant="outline" className="border-2 border-strong-border-color text-xs font-space-mono text-muted-foreground shadow-neo-active rounded-[4px]">Invalid Date</Badge>;
  }

  // Determine foreground color based on variant for icon styling
  let iconColorClass = "text-current"; // Default
  if (badgeStyle.variant === 'destructive') iconColorClass = "text-destructive-foreground";
  else if (badgeStyle.variant === 'warning') iconColorClass = "text-warning-foreground";
  else if (badgeStyle.variant === 'neutral-status') iconColorClass = "text-neutral-status-foreground";
  else if (badgeStyle.variant === 'overdue-status') iconColorClass = "text-overdue-status-foreground";


  return (
    <Badge variant={badgeStyle.variant as any} className={cn("text-xs font-space-mono px-2 py-0.5 shadow-neo-active border-2 border-strong-border-color rounded-[4px]")}>
      {React.cloneElement(badgeStyle.icon, {className: cn(badgeStyle.icon.props.className, iconColorClass)})}
      {badgeStyle.textPrefix}{timeLeftText}
    </Badge>
  );
}

declare module "@/components/ui/badge" {
  interface BadgeProps {
    variant: VariantProps<typeof badgeVariants>["variant"] | 'warning' | 'neutral-status' | 'complete-status' | 'overdue-status';
  }
}
    