"use client";

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export function SydneyTime() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    // Set initial time on client mount to avoid hydration mismatch
    setTime(new Date());

    const timerId = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  if (!time) {
    return (
      <div className="flex items-center gap-2 text-sm font-medium bg-muted text-muted-foreground px-3 py-2 rounded-md h-[54px] w-[180px]">
        <Clock className="w-4 h-4" />
        <div>Loading time...</div>
      </div>
    );
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-AU', {
      timeZone: 'Australia/Sydney',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-AU', {
      timeZone: 'Australia/Sydney',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="flex items-center gap-3 text-sm font-medium text-foreground">
      <Clock className="w-5 h-5 text-muted-foreground" />
      <div className="text-center">
        <div className="font-mono text-2xl">{formatTime(time)}</div>
        <div className="text-base font-semibold text-muted-foreground">{formatDate(time)}</div>
      </div>
    </div>
  );
}
