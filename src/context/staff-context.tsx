"use client";

import { createContext, useContext, useState, useEffect } from "react";
import type { StoreId } from "@/lib/types";

type StaffContextType = {
  staffName: string | null;
  storeId: StoreId | null;
  isHydrated: boolean;
  setSession: (name: string, store: StoreId) => void;
  logout: () => void;
};

const StaffContext = createContext<StaffContextType | undefined>(undefined);

export function StaffProvider({ children }: { children: React.ReactNode }) {
  const [staffName, setStaffNameState] = useState<string | null>(null);
  const [storeId, setStoreIdState] = useState<StoreId | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedName = sessionStorage.getItem("staffName") ?? localStorage.getItem("staffName");
    const storedStore = (sessionStorage.getItem("storeId") ?? localStorage.getItem("storeId")) as StoreId | null;

    if (storedName) setStaffNameState(storedName);
    if (storedStore === "EASTWOOD" || storedStore === "PARRAMATTA") {
      setStoreIdState(storedStore);
    }

    setIsHydrated(true);
  }, []);

  const setSession = (name: string, store: StoreId) => {
    sessionStorage.setItem("staffName", name);
    sessionStorage.setItem("storeId", store);
    localStorage.setItem("staffName", name);
    localStorage.setItem("storeId", store);
    setStaffNameState(name);
    setStoreIdState(store);
    setIsHydrated(true);
  };

  const logout = () => {
    sessionStorage.removeItem("staffName");
    sessionStorage.removeItem("storeId");
    localStorage.removeItem("staffName");
    localStorage.removeItem("storeId");
    setStaffNameState(null);
    setStoreIdState(null);
    setIsHydrated(true);
  };

  return (
    <StaffContext.Provider
      value={{ staffName, storeId, isHydrated, setSession, logout }}
    >
      {children}
    </StaffContext.Provider>
  );
}

export function useStaff() {
  const ctx = useContext(StaffContext);
  if (!ctx) throw new Error("useStaff must be used within StaffProvider");
  return ctx;
}
