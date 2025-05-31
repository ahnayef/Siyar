
"use client";

import * as React from 'react'; // Added this line
import { useState, useEffect } from 'react';
import { differenceInSeconds, intervalToDuration } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Hourglass, CheckCircle2, AlertTriangle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CountdownBadgeProps {
  dueDate: Date | string;
}

const calculateTimeLeft = (targetDate: Date) => {
  const now = new Date();
  const secondsRemaining = differenceInSeconds(targetDate, now);

  if (secondsRemaining <= 0) {
    return { text: "Past Due", isPast: true, variant: 'destructive' as const, icon: <AlertTriangle className="h-3.5 w-3.5 mr-1" /> };
  }

  const duration = intervalToDuration({ start: now, end: targetDate });
  
  let text = '';
  if (duration.years && duration.years > 0) text += `${duration.years}y `;
  if (duration.months && duration.months > 0) text += `${duration.months}m `;
  if (duration.days && duration.days > 0) text += `${duration.days}d `;
  if (duration.hours && duration.hours > 0 && (!duration.days || duration.days < 2) && !duration.months && !duration.years) text += `${duration.hours}h `;
  if (duration.minutes && duration.minutes > 0 && !duration.days && !duration.months && !duration.years && !duration.hours) text += `${duration.minutes}min`;
  
  text = text.trim() || (secondsRemaining < 60 ? `${secondsRemaining}s` : "Soon");


  let variantStyle: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';
  let icon = <Hourglass className="h-3.5 w-3.5 mr-1 text-primary-foreground" />; // Default icon for primary badge

  if (secondsRemaining < 3600 * 24) { // Less than 1 day
    variantStyle = 'destructive'; 
    icon = <Zap className="h-3.5 w-3.5 mr-1 text-destructive-foreground" />; 
  } else if (secondsRemaining < 3600 * 24 * 3) { // Less than 3 days
    variantStyle = 'secondary'; 
    icon = <Hourglass className="h-3.5 w-3.5 mr-1 text-secondary-foreground" />; // Icon for secondary badge
  } else { // More than 3 days
    variantStyle = 'default'; 
    icon = <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-primary-foreground" />; // Icon for primary badge
  }

  return { text: text + (secondsRemaining > 0 && text !== "Soon" ? " left" : ""), isPast: false, variant: variantStyle, icon };
};

export default function CountdownBadge({ dueDate }: CountdownBadgeProps) {
  const target = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(target));

  useEffect(() => {
    if (timeLeft.isPast) return;

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(target));
    }, 1000 * 30); 

    return () => clearInterval(timer);
  }, [target, timeLeft.isPast]);
  
  if (target.toString() === "Invalid Date") {
    return <Badge variant="outline" className="border-2 border-strong-border text-xs text-muted-foreground shadow-neo-button-active-light rounded-sm">Invalid Date</Badge>;
  }

  let badgeClasses = "text-xs font-medium px-2 py-0.5 shadow-neo-button-active-light border-2 border-strong-border rounded-sm";
  if (timeLeft.variant === 'destructive') {
    badgeClasses += " bg-destructive text-destructive-foreground";
  } else if (timeLeft.variant === 'secondary') {
    badgeClasses += " bg-secondary text-secondary-foreground";
  } else { 
    badgeClasses += " bg-primary text-primary-foreground";
  }

  return (
    <div className={cn('inline-flex items-center', badgeClasses)}>
      {React.cloneElement(timeLeft.icon, {className: cn(timeLeft.icon.props.className, "text-current")})}
      {timeLeft.text}
    </div>
  );
}
