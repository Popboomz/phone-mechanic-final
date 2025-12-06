"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStaff } from "@/context/staff-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { StoreId } from "@/lib/types";
import { Inter } from "next/font/google";

const interHeadline = Inter({ subsets: ["latin"], weight: ["700"], display: "swap" });

export default function StaffLoginPage() {
  const [name, setName] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession } = useStaff();

  const rawNext = searchParams.get("next") || "";

  const storeFromNext = useMemo<StoreId | null>(() => {
    if (!rawNext) return null;
    try {
      const url = new URL(rawNext, "https://dummy.base");
      const s = url.searchParams.get("store");
      return s === "EASTWOOD" || s === "PARRAMATTA" ? (s as StoreId) : null;
    } catch {
      return null;
    }
  }, [rawNext]);

  const [store, setStore] = useState<StoreId | "">(storeFromNext || "");

  const handleLogin = () => {
    const trimmedName = name.trim();
    if (!trimmedName || !store) return;

    const base = rawNext && rawNext.startsWith("/") ? rawNext : "/";
    const url = new URL(base, "https://dummy.base");
    url.searchParams.delete("store");
    url.searchParams.set("store", store as string);

    setSession(trimmedName, store as StoreId);
    router.push(url.pathname + url.search);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <h1 className={`${interHeadline.className} text-5xl font-bold uppercase mb-8 text-center`}>
        <span className="block">PHONE</span>
        <span className="block">MECHANIC</span>
      </h1>
      <div className="w-full max-w-sm space-y-6 p-6 border rounded-md shadow bg-card">
        <h1 className="text-xl font-bold text-center mb-2">Staff Login</h1>

        <div className="space-y-2">
          <label className="text-sm font-medium">Store</label>
          <Select value={store} onValueChange={(v) => setStore(v as StoreId)}>
            <SelectTrigger>
              <SelectValue placeholder="Select store" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EASTWOOD">PHONE MECHANIC EASTWOOD</SelectItem>
              <SelectItem value="PARRAMATTA">PHONE MECHANIC PARRAMATTA</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Pin</label>
          <Input
            placeholder="Input allowed PIN"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <Button className="w-full" onClick={handleLogin}>
          Continue
        </Button>
      </div>
    </div>
  );
}
