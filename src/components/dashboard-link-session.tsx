"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import { useStaff } from "@/context/staff-context";

export function DashboardLinkFromSession({ className = "" }: { className?: string }) {
  const { storeId } = useStaff();
  const current = storeId === "PARRAMATTA" ? "PARRAMATTA" : "EASTWOOD";
  const href = `/?store=${current}`;
  return (
    <Link href={href} className={className}>
      <Home className="w-4 h-4" /> Dashboard
    </Link>
  );
}
