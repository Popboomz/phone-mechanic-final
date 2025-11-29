"use client";

import { useRef, useTransition, useEffect } from "react";
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
import type { Customer } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { RepairItemsSelector } from "./repair-items-selector";
import { Textarea } from "./ui/textarea";
import { PhoneModelInput } from "./phone-model-input";

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
  phonePrice: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Price must be a valid positive number.",
    }),
  phoneStorage: z.string().optional(),
  transactionDate: z.date({
    required_error: "A transaction date is required.",
  }),
  repairItems: z.array(z.string()).min(1, "Please select at least one repair item."),
  repairCustomText: z.string().optional(),
  warrantyPeriod: z.number().int().min(0, "Warranty period cannot be negative."),
  notes: z.string().optional(),
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
export function CustomerForm({ customer }: { customer?: Customer }) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

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
    const items = form.getValues("repairItems") || [];
    if (items.includes("none")) {
      form.setValue("policyType", "sale");
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
    formData.set("phonePrice", data.phonePrice);
    formData.set("phoneStorage", data.phoneStorage || "");
    formData.set(
      "transactionDate",
      formatDateToLocalYYYYMMDD(data.transactionDate)
    );
    formData.set("warrantyPeriod", data.warrantyPeriod.toString());
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
                  <PhoneModelInput {...field} />
                </FormControl>
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

          {/* Storage Capacity */}
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

          {/* Price */}
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

          {/* Transaction Date */}
          <FormField
            control={form.control}
            name="transactionDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Transaction Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
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

        {/* Repair Item */}
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

        {/* Custom Repair Text (always available for multiple additions) */}
        <FormField
          control={form.control}
          name="repairCustomText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Custom Repair Description</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input placeholder="Describe the repair or sale item" {...field} />
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
                  <SelectItem value="standard">Standard Repair Policy</SelectItem>
                  <SelectItem value="water">Water Damage Repair Policy</SelectItem>
                  <SelectItem value="mainboard">Motherboard Repair Policy</SelectItem>
                  <SelectItem value="sale">Device Sale Policy</SelectItem>
                  <SelectItem value="custom">Custom Policy</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

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
