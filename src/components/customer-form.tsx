"use client";

import { useRef, useTransition, useEffect, useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Minus, Plus, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { createCustomer, updateCustomerAction } from "@/lib/actions";
import type { Customer, StoreId } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { RepairItemsSelector } from "./repair-items-selector";
import { Textarea } from "./ui/textarea";
import { getActivePhoneModelNames, getFullLabelPathForRepairItem } from "@/lib/data";
import { useStaff } from "@/context/staff-context";

// ---------------- Schema ----------------
const FormSchema = z.object({
  customerName: z.string().min(2, "Customer name must be at least 2 characters."),
  phoneNumber: z.string().optional(), // ← 新增字段
  phoneModel: z.string().min(2, "Phone model is required."),
  phoneImei: z
    .string()
    .max(15, "IMEI cannot be more than 15 digits.")
    .optional()
    .or(z.literal("")),
  phonePrice: z.string().optional(),
  phoneStorage: z.string().optional(),
  transactionDate: z.date({
    required_error: "A transaction date is required.",
  }),
  repairItems: z.array(z.string()).default([]),
  repairCustomText: z.string().optional(),
  customerType: z.enum(["repair","sales"]).default("repair"),
  warrantyPeriod: z.number().int().min(0, "Warranty period cannot be negative."),
  notes: z.string().optional(),
}).superRefine((data, ctx) => {
  const val = data.phonePrice ?? "";
  const num = parseFloat(val);
  if (data.customerType === "sales") {
    if (isNaN(num) || num <= 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["phonePrice"], message: "Price must be a valid positive number for sales." });
    }
  } else {
    if (val && (isNaN(num) || num < 0)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["phonePrice"], message: "Price must be a valid number." });
    }
  }
});

type FormValues = z.infer<typeof FormSchema>;

// Format date to YYYY-MM-DD
const formatDateToLocalYYYYMMDD = (date: Date) => {
  const offset = date.getTimezoneOffset();
  const adjustedDate = new Date(date.getTime() - offset * 60 * 1000);
  return adjustedDate.toISOString().split("T")[0];
};

const storageOptions = ["32GB", "64GB", "128GB", "256GB", "512GB", "1TB"];

// ---------------- Component ----------------
export function CustomerForm({ customer, currentStoreId = "EASTWOOD" }: { customer?: Customer; currentStoreId?: StoreId }) {
  const { toast } = useToast();
  const { staffName } = useStaff();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [savedDevices, setSavedDevices] = useState<Array<{ model: string; imei?: string; price: string; storage?: string; policyType?: string }>>([]);
  const [savedRepairs, setSavedRepairs] = useState<Array<{ name: string; price: string }>>([]);
  const [repairPrice, setRepairPrice] = useState<string>("");

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    mode: "onChange",
    defaultValues: {
      customerName: customer?.customerName || "",
      phoneNumber: customer?.phoneNumber || "",
      phoneModel: customer?.phoneModel || "",
      phoneImei: customer?.phoneImei || "",
      phonePrice: customer?.phonePrice || "",
      phoneStorage: customer?.phoneStorage || "",
      transactionDate: customer ? new Date(customer.transactionDate) : null,
      repairItems: customer?.repairItems || [],
      repairCustomText: "",
      customerType: customer?.customerType || "repair",
      policyType: customer?.policyType || undefined,
      policyText: customer?.policyText || "",
      warrantyPeriod: customer?.warrantyPeriod || 3,
      notes: customer?.notes || "",
    },
  });

  useEffect(() => {
    if (!form.getValues("transactionDate")) {
      form.setValue("transactionDate", new Date());
    }
  }, [form]);

  useEffect(() => {
    (async () => {
      try {
        const list = await getActivePhoneModelNames();
        (form as any)._modelSuggestions = list;
      } catch {}
    })();
  }, [form]);

  useEffect(() => {
    const items = form.getValues("repairItems") || [];
    if (items.includes("none")) {
      form.setValue("policyType", "sale_used");
    }
  }, [form.watch("repairItems")]);

  const clientAction = async (formData: FormData) => {
    const result = await form.trigger();
    if (!result) return;

    const data = form.getValues();

    // Set data to server
    formData.set("customerName", data.customerName);
    formData.set("phoneNumber", data.phoneNumber || "");
    formData.set("phoneModel", data.phoneModel);
    formData.set("phoneImei", data.phoneImei || "");
    const phonePriceForSubmit = data.customerType === "sales" ? data.phonePrice : "0";
    formData.set("phonePrice", phonePriceForSubmit);
    formData.set("phoneStorage", data.phoneStorage || "");
    formData.set(
      "transactionDate",
      formatDateToLocalYYYYMMDD(data.transactionDate)
    );
    formData.set("warrantyPeriod", data.warrantyPeriod.toString());
    formData.set("customerType", data.customerType);
    // include custom text as a virtual item when present
    const items = [...data.repairItems];
    const customText = (data.repairCustomText || "").trim();
    if (customText) {
      const customId = `custom:${customText}`;
      const noneIndex = items.indexOf("none");
      if (noneIndex >= 0) items.splice(noneIndex, 1);
      if (!items.includes(customId)) items.push(customId);
    }
    formData.set("repairItems", JSON.stringify(items));
    if (data.policyType) formData.set("policyType", data.policyType);
    if (data.policyType === "custom") {
      formData.set("policyText", data.policyText || "");
    } else {
      formData.set("policyText", "");
    }
    formData.set("notes", data.notes || "");
    formData.set("staffName", staffName || "");

    if (data.customerType === "sales") {
      const list = [...savedDevices];
      if ((data.phoneModel || "").trim() && (data.phonePrice || "").trim()) {
        list.push({
          model: data.phoneModel.trim(),
          imei: (data.phoneImei || "").trim() || undefined,
          price: data.phonePrice.trim(),
          storage: (data.phoneStorage || "").trim() || undefined,
          policyType: form.getValues("policyType") || undefined,
        });
      }
      if (list.length > 0) {
        formData.set("devices", JSON.stringify(list));
      }
    }

    if (data.customerType === "repair") {
      const lines = [...savedRepairs];
      const currentItems = [...(form.getValues("repairItems") || [])];
      const currentCustom = (form.getValues("repairCustomText") || "").trim();
      if (currentCustom) {
        const cid = `custom:${currentCustom}`;
        const idx = currentItems.indexOf("none");
        if (idx >= 0) currentItems.splice(idx, 1);
        if (!currentItems.includes(cid)) currentItems.push(cid);
      }
      const name = currentItems.length > 0
        ? currentItems.map((id) => id.startsWith("custom:") ? id.slice(7) : getFullLabelPathForRepairItem(id)).join("; ")
        : "Repair";
      const priceStr = (repairPrice || data.phonePrice || "").trim();
      const amount = parseFloat(priceStr);
      if (name && !isNaN(amount) && amount > 0) {
        lines.push({ name, price: priceStr });
      }
      if (lines.length > 0) {
        formData.set("repairLineItems", JSON.stringify(lines));
      }
    }

    startTransition(async () => {
      const action = customer
        ? updateCustomerAction.bind(null, customer.id)
        : createCustomer;

      const response = await action(formData);

      if (response?.message) {
        toast({
          title: response.errors ? "Error" : "Success",
          description: response.message,
          variant: response.errors ? "destructive" : "default",
        });
      }

      if (!response?.errors && !customer) {
        form.reset();
      }
    });
  };

  return (
    <Form {...form}>
      <form ref={formRef} action={clientAction} className="space-y-8">
        <input type="hidden" name="storeId" value={currentStoreId} />
        <input type="hidden" name="staffName" value={staffName || ""} />
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Mode</div>
          <div className="flex items-center gap-2">
            <span className={cn("text-xs", form.watch("customerType") === "repair" ? "text-primary" : "opacity-60")}>Repair</span>
            <button
              type="button"
              aria-label="Toggle customer type"
              className={cn(
                "relative w-12 h-6 rounded-full transition-colors",
                form.watch("customerType") === "sales" ? "bg-primary" : "bg-muted"
              )}
              onClick={() => {
                const next = form.watch("customerType") === "sales" ? "repair" : "sales";
                form.setValue("customerType", next, { shouldValidate: true });
              }}
            >
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-background shadow transition-transform",
                  form.watch("customerType") === "sales" ? "translate-x-6" : "translate-x-0"
                )}
              />
            </button>
            <span className={cn("text-xs", form.watch("customerType") === "sales" ? "text-primary" : "opacity-60")}>Sales</span>
          </div>
        </div>

        <div className={cn(
          "rounded-md p-4",
          form.watch("customerType") === "repair" ? "bg-accent/5" : "bg-[#121A2E]"
        )}>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Customer Name */}
          <FormField
            control={form.control}
            name="customerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone Number */}
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 0412345678" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone Model */}
          <FormField
            control={form.control}
            name="phoneModel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Model</FormLabel>
                <FormControl>
                  <Input {...field} list="phone-models" placeholder="e.g., iPhone 15 or enter manually" />
                </FormControl>
                <datalist id="phone-models">
                  {(form as any)._modelSuggestions?.map((m: string) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone IMEI */}
          <FormField
            control={form.control}
            name="phoneImei"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone IMEI</FormLabel>
                <FormControl>
                  <Input
                    placeholder="15-digit IMEI number (optional)"
                    {...field}
                    maxLength={15}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Storage Capacity (Sales only) */}
          {form.watch("customerType") === "sales" && (
            <FormField
              control={form.control}
              name="phoneStorage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Storage Capacity</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select storage size (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {storageOptions.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Price (Sales only) */}
          {form.watch("customerType") === "sales" && (
            <FormField
              control={form.control}
              name="phonePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="e.g., 999.99"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Transaction Date */}
          <FormField
            control={form.control}
            name="transactionDate"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Transaction Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full h-10 px-3 py-2 text-sm text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => field.onChange(date || new Date())}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Warranty Period */}
          <FormField
            control={form.control}
            name="warrantyPeriod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Warranty Period</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        field.value > 0 && field.onChange(field.value - 1)
                      }
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      className="w-16 text-center"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value, 10) || 0)
                      }
                    />
                    <span className="text-muted-foreground">
                      month{field.value !== 1 ? "s" : ""}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => field.onChange(field.value + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </FormControl>
                <div className="flex gap-2 pt-2">
                  {[1, 3, 6].map((months) => (
                    <Button
                      key={months}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => field.onChange(months)}
                    >
                      {months} month{months > 1 ? "s" : ""}
                    </Button>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Repair Items (Repair mode only) */}
        {form.watch("customerType") === "repair" && (
          <FormField
            control={form.control}
            name="repairItems"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Repair Items</FormLabel>
                <FormControl>
                  <RepairItemsSelector
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Custom Repair Text (Repair mode only) */}
        {form.watch("customerType") === "repair" && (
          <FormField
            control={form.control}
            name="repairCustomText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custom Repair Description</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input placeholder="Describe the repair item" {...field} />
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const text = (form.getValues("repairCustomText") || "").trim();
                      if (!text) return;
                      const customId = `custom:${text}`;
                      const current = form.getValues("repairItems") || [];
                      const next = current.filter((id) => id !== "none");
                      if (!next.includes(customId)) next.push(customId);
                      form.setValue("repairItems", next, { shouldValidate: true });
                      form.setValue("repairCustomText", "");
                    }}
                  >
                    Add
                  </Button>
                </div>
                <FormDescription>
                  Added text becomes a tag and appears on the invoice.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {form.watch("customerType") === "repair" && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Repair Price"
                value={repairPrice}
                onChange={(e)=>setRepairPrice(e.target.value)}
                className="w-40"
              />
              <Button
                type="button"
                size="sm"
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={() => {
                  const items = form.getValues("repairItems") || [];
                  const customText = (form.getValues("repairCustomText") || "").trim();
                  const nextItems = [...items];
                  if (customText) {
                    const cid = `custom:${customText}`;
                    const idx = nextItems.indexOf("none");
                    if (idx >= 0) nextItems.splice(idx, 1);
                    if (!nextItems.includes(cid)) nextItems.push(cid);
                  }
              const name = nextItems.length > 0
                ? nextItems.map((id) => id.startsWith("custom:") ? id.slice(7) : getFullLabelPathForRepairItem(id)).join("; ")
                : "Repair";
              const price = (repairPrice || form.getValues("phonePrice") || "").trim();
              const amount = parseFloat(price);
              if (isNaN(amount) || amount <= 0) return;
              setSavedRepairs((prev)=>[...prev, { name, price }]);
                  // 清空与本次维修相关字段
                  form.setValue("repairItems", [], { shouldValidate: true });
                  form.setValue("repairCustomText", "");
                  setRepairPrice("");
                }}
              >
                Save Repair
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {savedRepairs.map((r, idx) => (
                <Button key={idx} variant="secondary" className="h-6 px-2 py-0 text-xs">
                  {r.name} • ${r.price}
                  <span
                    className="ml-2 cursor-pointer"
                    onClick={() => setSavedRepairs((prev)=>prev.filter((_,i)=>i!==idx))}
                  >
                    ✖
                  </span>
                </Button>
              ))}
            </div>
          </div>
        )}

          {/* Policy Type */}
          <FormField
            control={form.control}
            name="policyType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Policy Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a policy" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {form.watch("customerType") === "sales" ? (
                      <>
                        <SelectItem value="sale_used">Second-Hand Mobile Device Sales Policy</SelectItem>
                        <SelectItem value="sale_new">Brand-New Mobile Device Sales Policy</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="standard">Standard Repair Policy</SelectItem>
                        <SelectItem value="water">Water Damage Repair Policy</SelectItem>
                        <SelectItem value="mainboard">Motherboard Repair Policy</SelectItem>
                        <SelectItem value="custom">Custom Policy</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

        {/* Sales: Save current device */}
        {form.watch("customerType") === "sales" && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={() => {
                  const model = (form.getValues("phoneModel") || "").trim();
                  const price = (form.getValues("phonePrice") || "").trim();
                  if (!model || !price) return;
                  const imei = (form.getValues("phoneImei") || "").trim();
                  const storage = (form.getValues("phoneStorage") || "").trim();
                  const policyType = form.getValues("policyType") || undefined;
                  setSavedDevices((prev) => [
                    ...prev,
                    { model, imei: imei || undefined, price, storage: storage || undefined, policyType },
                  ]);
                  // clear device fields, keep name/phone
                  form.setValue("phoneModel", "");
                  form.setValue("phoneImei", "");
                  form.setValue("phonePrice", "");
                  form.setValue("phoneStorage", "");
                }}
              >
                Save Device
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {savedDevices.map((d, idx) => (
                <Button key={idx} variant="secondary" className="h-6 px-2 py-0 text-xs">
                  {d.model}{d.imei ? ` • IMEI ${d.imei}` : ""} • ${d.price}{d.policyType ? ` • ${d.policyType}` : ""}
                  <span
                    className="ml-2 cursor-pointer"
                    onClick={() => {
                      setSavedDevices((prev) => prev.filter((_, i) => i !== idx));
                    }}
                  >
                    ✖
                  </span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Custom Policy Text */}
        {form.watch("policyType") === "custom" && (
          <FormField
            control={form.control}
            name="policyText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custom Policy Text</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter your custom policy text here" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any special notes about the repair or sale that are not covered in the list above."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                This field is for any items or details not available in the repair list.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4">
          <Link href={customer ? `/${customer.id}` : "/"}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : customer ? (
              "Save Changes"
            ) : (
              "Create Customer"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
