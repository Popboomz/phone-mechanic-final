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
  policyType?: 'standard' | 'water' | 'mainboard' | 'sale' | 'sale_used' | 'sale_new' | 'custom';
  policyText?: string;
  customerType?: 'repair' | 'sales';
  devices?: Array<{
    model: string;
    imei?: string;
    price: string;
    storage?: string;
    policyType?: 'sale_used' | 'sale_new';
  }>;
  warrantyPeriod: number; // in months
  deletedAt: Date | null; // Changed from optional to nullable
  notes?: string;
  repairLineItems?: Array<{ name: string; price: number }>;
  invoiceNumber?: string;
};

export type PhoneModelDoc = {
  id: string;
  brand: string;
  modelName: string;
  series?: string;
  isActive: boolean;
  sortOrder?: number;
  createdAt: Date;
  updatedAt: Date;
};

export type CustomerFormValues = Omit<Customer, "id" | "images"> & {
  images: (File | string)[];
  repairItems: string[];
};

export type PhoneModelInputProps = Omit<ControllerRenderProps, "ref"> & {
  // You can add any additional props your component might need
};
