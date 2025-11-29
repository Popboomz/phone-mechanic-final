import type { ControllerRenderProps } from "react-hook-form";

export type Customer = {
  id: string;
  customerName: string;

  // ✅ 新增：客户电话（可选）
  phoneNumber?: string;

  phoneModel: string;
  phoneImei?: string;
  phonePrice: string;
  phoneStorage?: string; // e.g., "128GB"
  transactionDate: Date;
  images: string[]; // array of base64 data URLs
  repairItems: string[]; // multiple items
  policyType?: 'standard' | 'water' | 'mainboard' | 'sale' | 'custom';
  policyText?: string;
  warrantyPeriod: number; // in months
  deletedAt: Date | null; // Changed from optional to nullable
  notes?: string;
};

export type CustomerFormValues = Omit<Customer, "id" | "images"> & {
  images: (File | string)[];
  repairItems: string[];
};

export type PhoneModelInputProps = Omit<ControllerRenderProps, "ref"> & {
  // You can add any additional props your component might need
};
