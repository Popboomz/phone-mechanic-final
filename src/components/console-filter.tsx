"use client";
import { useEffect, useRef } from "react";

export default function ConsoleFilter() {
  const original = useRef<typeof console.error | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as any).__consoleFilterPatched) return;
    original.current = console.error;
    (window as any).__consoleFilterPatched = true;
    console.error = (...args: any[]) => {
      const msg = args && args[0] && String(args[0]);
      if (
        msg &&
        msg.includes("google.firestore.v1.Firestore/Listen/channel") &&
        msg.includes("net::ERR_ABORTED")
      ) {
        return;
      }
      original.current?.(...args);
    };
  }, []);
  return null;
}
