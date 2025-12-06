"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { STORES, StoreId } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STORE_IDS: StoreId[] = ["EASTWOOD", "PARRAMATTA"];

export function StoreSwitcherLite() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const storeFromUrl = (searchParams.get("store") || "").toUpperCase() as StoreId;
  const currentStore: StoreId = STORE_IDS.includes(storeFromUrl) ? storeFromUrl : "EASTWOOD";

  const updateStore = (nextStore: StoreId) => {
    const params = new URLSearchParams(searchParams.toString());
    if (nextStore === "EASTWOOD") {
      params.delete("store");
    } else {
      params.set("store", nextStore);
    }
    const query = params.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    router.push(url);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-white/70">Store:</span>
      <Select value={currentStore} onValueChange={(v) => updateStore(v as StoreId)}>
        <SelectTrigger className="w-[260px] h-8 bg-transparent border border-white/30 text-white text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper" sideOffset={6} className="z-[9999] bg-[#020817] text-white border border-white/30">
          {STORE_IDS.map((id) => (
            <SelectItem
              key={id}
              value={id}
              className="text-sm text-white data-[highlighted]:bg-[#f97316] data-[highlighted]:text-black hover:bg-[#f97316] hover:text-black focus:bg-[#f97316] focus:text-black"
            >
              {STORES[id].name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
