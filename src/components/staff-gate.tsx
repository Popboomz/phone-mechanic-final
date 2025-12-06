"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useStaff } from "@/context/staff-context";

export function StaffGate({ children }: { children: React.ReactNode }) {
  const { staffName, storeId, isHydrated } = useStaff();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated) return;
    if (pathname === "/staff-login") return;
    if (!staffName || !storeId) {
      const query = searchParams.toString();
      const next = query ? `${pathname}?${query}` : pathname;
      router.replace(`/staff-login?next=${encodeURIComponent(next || "/")}`);
    }
  }, [staffName, storeId, isHydrated, pathname, searchParams, router]);

  if (!isHydrated) return null;

  return <>{children}</>;
}
