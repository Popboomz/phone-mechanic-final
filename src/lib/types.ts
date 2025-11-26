
import type { ControllerRenderProps } from "react-hook-form";

export type Customer = {
  id: string;
  customerName: string;
  phoneModel: string;
  phoneImei?: string;
  phonePrice: string;
  phoneStorage?: string; // e.g., "128GB"
  transactionDate: Date;
  images: string[]; // array of base64 data URLs
  repairItem: string; // single item
  warrantyPeriod: number; // in months
  deletedAt: Date | null; // Changed from optional to nullable
  notes?: string;
};

export type CustomerFormValues = Omit<Customer, "id" | "images" | "repairItem"> & {
  images: (File | string)[];
  repairItem: string;
};

export type PhoneModelInputProps = Omit<ControllerRenderProps, 'ref'> & {
    // You can add any additional props your component might need
};
