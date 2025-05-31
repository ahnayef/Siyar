
"use client";

import { useState, useEffect } from 'react';
import { differenceInSeconds, formatDistanceStrict, intervalToDuration } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Hourglass, CheckCircle2, AlertTriangle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils'; // Added missing import

interface CountdownBadgeProps {
  dueDate: Date | string;
}

const calculateTimeLeft = (targetDate: Date) => {
  const now = new Date();
  const secondsRemaining = differenceInSeconds(targetDate, now);

  if (secondsRemaining <= 0) {
    return { text: "Past Due", isPast: true, variant: 'destructive' as const, icon: <AlertTriangle className="h-3 w-3 mr-1" /> };
  }

  const duration = intervalToDuration({ start: now, end: targetDate });
  
  let text = '';
  if (duration.years && duration.years > 0) text += `${duration.years}y `;
  if (duration.months && duration.months > 0) text += `${duration.months}m `;
  if (duration.days && duration.days > 0) text += `${duration.days}d `;
  // Show hours only if less than a few days, or if it's the largest unit
  if (duration.hours && duration.hours > 0 && (!duration.days || duration.days < 3) && !duration.months && !duration.years) text += `${duration.hours}h `;
  if (duration.minutes && duration.minutes > 0 && !duration.days && !duration.months && !duration.years) text += `${duration.minutes}min `;
  if (duration.seconds && duration.seconds > 0 && !duration.hours && !duration.days && !duration.months && !duration.years) text += `${duration.seconds}s`;
  
  text = text.trim() || `${secondsRemaining}s left`;


  let variantStyle: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';
  let icon = <Hourglass className="h-3 w-3 mr-1" />;

  if (secondsRemaining < 3600 * 24) { // Less than 1 day
    variantStyle = 'destructive';
    icon = <Zap className="h-3 w-3 mr-1 text-destructive-foreground" />; // Use Zap for urgency
  } else if (secondsRemaining < 3600 * 24 * 3) { // Less than 3 days
    variantStyle = 'secondary'; // Pink
    icon = <Hourglass className="h-3 w-3 mr-1 text-secondary-foreground" />;
  } else { // More than 3 days
    variantStyle = 'default'; // Yellow
    icon = <CheckCircle2 className="h-3 w-3 mr-1 text-primary-foreground" />;
  }


  return { text, isPast: false, variant: variantStyle, icon };
};

export default function CountdownBadge({ dueDate }: CountdownBadgeProps) {
  const target = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(target));

  useEffect(() => {
    if (timeLeft.isPast) return;

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(target));
    }, 1000);

    return () => clearInterval(timer);
  }, [target, timeLeft.isPast]);
  
  if (target.toString() === "Invalid Date") {
    return <Badge variant="outline" className="border-2 border-foreground text-xs text-muted-foreground">Invalid Date</Badge>;
  }

  // Custom styling for neo-brutalism: thick border, specific bg/text based on variant
  let badgeClasses = "border-2 text-xs font-semibold px-2 py-1 shadow-[1px_1px_0px_0px_black]";
  if (timeLeft.variant === 'destructive') {
    badgeClasses += " bg-destructive text-destructive-foreground border-black";
  } else if (timeLeft.variant === 'secondary') {
    badgeClasses += " bg-secondary text-secondary-foreground border-black";
  } else { // default variant (primary)
    badgeClasses += " bg-primary text-primary-foreground border-black";
  }


  return (
    <div className={cn('inline-flex items-center rounded-sm', badgeClasses)}>
      {timeLeft.icon}
      {timeLeft.text}
    </div>
  );
}
