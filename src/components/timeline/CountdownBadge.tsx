"use client";

import { useState, useEffect } from 'react';
import { differenceInSeconds, formatDistanceStrict, intervalToDuration } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Hourglass, CheckCircle2, AlertTriangle } from 'lucide-react';

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
  if (duration.hours && duration.hours > 0) text += `${duration.hours}h `;
  if (duration.minutes && duration.minutes > 0 && !duration.years && !duration.months && !duration.days) text += `${duration.minutes}min `;
  if (duration.seconds && duration.seconds > 0 && !duration.years && !duration.months && !duration.days && !duration.hours) text += `${duration.seconds}s`;
  
  text = text.trim() || `${secondsRemaining}s`;


  let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';
  if (secondsRemaining < 3600 * 24) variant = 'destructive'; // Less than 1 day
  else if (secondsRemaining < 3600 * 24 * 3) variant = 'secondary'; // Less than 3 days

  return { text, isPast: false, variant, icon: <Hourglass className="h-3 w-3 mr-1" /> };
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
    return <Badge variant="outline" className="border-2 border-foreground text-xs">Invalid Date</Badge>;
  }

  return (
    <Badge variant={timeLeft.variant} className="border-2 border-current text-xs font-semibold">
      {timeLeft.icon}
      {timeLeft.text}
    </Badge>
  );
}
