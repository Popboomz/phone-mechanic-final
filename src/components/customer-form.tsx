
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
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Minus, Plus, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { createCustomer, updateCustomerAction } from "@/lib/actions";
import type { Customer } from "@/lib/types";
import { FileUpload } from "./file-upload";
import { useToast } from "@/hooks/use-toast";
import { RepairItemsSelector } from "./repair-items-selector";
import { Textarea } from "./ui/textarea";
import { PhoneModelInput } from "./phone-model-input";

const FormSchema = z.object({
  customerName: z.string().min(2, "Customer name must be at least 2 characters."),
  phoneModel: z.string().min(2, "Phone model is required."),
  phoneImei: z.string().max(15, "IMEI cannot be more than 15 digits.").optional().or(z.literal("")),
  phonePrice: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Price must be a valid positive number.",
  }),
  phoneStorage: z.string().optional(),
  transactionDate: z.date({
    required_error: "A transaction date is required.",
  }),
  repairItem: z.string().min(1, "Please select a repair item."),
  warrantyPeriod: z.number().int().min(0, "Warranty period cannot be negative."),
  notes: z.string().optional(),
  images: z.array(z.union([z.instanceof(File), z.string()]))
    .optional()
    .default([]),
});

type FormValues = z.infer<typeof FormSchema>;

// Helper to format date as YYYY-MM-DD in local timezone
const formatDateToLocalYYYYMMDD = (date: Date) => {
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - offset * 60 * 1000);
    return adjustedDate.toISOString().split('T')[0];
};

const storageOptions = ["32GB", "64GB", "128GB", "256GB", "512GB", "1TB"];

export function CustomerForm({ customer }: { customer?: Customer }) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    mode: "onChange",
    defaultValues: {
      customerName: customer?.customerName || "",
      phoneModel: customer?.phoneModel || "",
      phoneImei: customer?.phoneImei || "",
      phonePrice: customer?.phonePrice || "",
      phoneStorage: customer?.phoneStorage || "",
      transactionDate: customer ? new Date(customer.transactionDate) : null,
      repairItem: customer?.repairItem || "",
      warrantyPeriod: customer?.warrantyPeriod || 3,
      notes: customer?.notes || "",
      images: customer?.images || [],
    },
  });
  
  useEffect(() => {
    // Set the date on the client to avoid hydration mismatch
    if (!form.getValues('transactionDate')) {
      form.setValue('transactionDate', new Date());
    }
  }, [form]);


  const clientAction = async (formData: FormData) => {
    // Manually trigger client-side validation
    const result = await form.trigger();
    if (!result) {
      // If validation fails, react-hook-form will automatically show errors.
      return;
    }
    
    // If validation passes, get the validated data
    const data = form.getValues();
    const newImages = data.images.filter((img): img is File => img instanceof File);

    // Append form values to the formData object that will be sent to the server
    formData.set('customerName', data.customerName);
    formData.set('phoneModel', data.phoneModel);
    formData.set('phoneImei', data.phoneImei || '');
    formData.set('phonePrice', data.phonePrice);
    formData.set('phoneStorage', data.phoneStorage || '');
    // Send date as YYYY-MM-DD string to avoid timezone issues
    formData.set('transactionDate', formatDateToLocalYYYYMMDD(data.transactionDate));
    formData.set('warrantyPeriod', data.warrantyPeriod.toString());
    formData.set('repairItem', data.repairItem);
    formData.set('notes', data.notes || '');

    formData.delete('images');
    newImages.forEach(file => formData.append('images', file));

    // For updates, pass along existing image URLs
    if (customer) {
      const existingImages = data.images.filter((img): img is string => typeof img === 'string');
      formData.set('existingImages', existingImages.join(','));
    }

    startTransition(async () => {
        const action = customer ? updateCustomerAction.bind(null, customer.id) : createCustomer;
        const response = await action(formData);
        
        // Handle server response
        if (response?.message) {
            toast({
                title: response.errors ? 'Error' : 'Success',
                description: response.message,
                variant: response.errors ? 'destructive' : 'default',
            });
        }
        
        // On successful creation, reset the form. Redirect is handled by server action.
        if (!response?.errors && !customer) {
            form.reset();
            // Also explicitly clear the images in the form state
            form.setValue('images', []);
        }
    });
  };


  return (
    <Form {...form}>
      <form
        ref={formRef}
        action={clientAction}
        className="space-y-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
           <FormField
            control={form.control}
            name="phoneImei"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone IMEI</FormLabel>
                <FormControl>
                  <Input placeholder="15-digit IMEI number (optional)" {...field} maxLength={15} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                        <SelectItem key={size} value={size}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phonePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Price</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="e.g., 999.99" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                          format(field.value, "PPP")
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
                        onClick={() => field.value > 0 && field.onChange(field.value - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                       <Input
                          type="number"
                          className="w-16 text-center"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                       />
                      <span className="text-muted-foreground">month{field.value !== 1 ? 's' : ''}</span>
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
                      <Button key={months} type="button" variant="outline" size="sm" onClick={() => field.onChange(months)}>
                        {months} month{months > 1 ? 's' : ''}
                      </Button>
                    ))}
                  </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="repairItem"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Repair Item</FormLabel>
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
        
        <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Upload Images</FormLabel>
                <FormControl>
                    <FileUpload 
                        value={field.value} 
                        onChange={(files) => {
                            form.setValue('images', files, { shouldValidate: true });
                        }}
                    />
                </FormControl>
                <FormDescription>Upload pictures of the phone or transaction.</FormDescription>
                <FormMessage />
            </FormItem>
            )}
        />
        
        <div className="flex justify-end gap-4">
            <Link href={customer ? `/${customer.id}` : "/"}>
                <Button type="button" variant="outline">
                    Cancel
                </Button>
            </Link>
          <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : customer ? "Save Changes" : "Create Customer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

    