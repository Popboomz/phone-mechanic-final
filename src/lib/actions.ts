'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  addCustomer,
  updateCustomer,
  deleteCustomer,
  restoreCustomer,
  permanentlyDeleteCustomer,
  searchCustomers,
  getNextInvoiceNumber,
} from './data';
import type { Customer } from './types';


// This schema is used for server-side validation.
// It aligns with the data being sent from the form.
const FormSchema = z.object({
  customerName: z
    .string({ invalid_type_error: 'Please enter a customer name.'})
    .min(2, 'Customer name must be at least 2 characters.'),

  // ✅ 新增：phoneNumber（可选）
  phoneNumber: z.string().max(20).optional(),

  phoneModel: z.string().min(2, 'Phone model is required.'),
  phoneImei: z.string().max(15, "IMEI cannot be more than 15 digits.").optional(),
  phonePrice: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: "Price must be a valid positive number.",
  }),
  phoneStorage: z.string().optional(),
  // Receive date as a 'YYYY-MM-DD' string
  transactionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format."),
  repairItems: z.array(z.string()).default([]),
  policyType: z.enum(['standard','water','mainboard','sale','sale_used','sale_new','custom']).optional(),
  policyText: z.string().optional(),
  customerType: z.enum(['repair','sales']).default('repair'),
  devices: z
    .array(
      z.object({
        model: z.string(),
        imei: z.string().optional(),
        price: z.string(),
        storage: z.string().optional(),
        policyType: z.enum(['sale_used','sale_new']).optional(),
      })
    )
    .optional(),
  warrantyPeriod: z.coerce.number().int().min(0, "Warranty period cannot be negative."),
  notes: z.string().optional(),
  repairLineItems: z
    .array(
      z.object({
        name: z.string(),
        price: z.union([z.string(), z.number()]),
      })
    )
    .optional(),
});

// Helper function to process uploaded files into base64 data URIs
async function getBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return `data:${file.type};base64,${buffer.toString('base64')}`;
}

const processAndValidateForm = (formData: FormData) => {
  const rawFormData = {
    customerName: formData.get('customerName'),
    // ✅ 新增：从 formData 取出 phoneNumber
    phoneNumber: formData.get('phoneNumber'),
    phoneModel: formData.get('phoneModel'),
    phoneImei: formData.get('phoneImei'),
    phonePrice: formData.get('phonePrice'),
    phoneStorage: formData.get('phoneStorage'),
    transactionDate: formData.get('transactionDate'),
    repairItems: JSON.parse(String(formData.get('repairItems') || '[]')),
    policyType: formData.get('policyType') || undefined,
    policyText: String(formData.get('policyText') ?? ''),
    customerType: (formData.get('customerType') as string) || 'repair',
    devices: (() => {
      try {
        const s = String(formData.get('devices') ?? '');
        return s ? JSON.parse(s) : undefined;
      } catch {
        return undefined;
      }
    })(),
    warrantyPeriod: formData.get('warrantyPeriod'),
    notes: formData.get('notes'),
    repairLineItems: (() => {
      try {
        const s = String(formData.get('repairLineItems') ?? '');
        return s ? JSON.parse(s) : undefined;
      } catch {
        return undefined;
      }
    })(),
  };

  const validatedFields = FormSchema.safeParse(rawFormData);
  if (!validatedFields.success) {
    return { success: false, errors: validatedFields.error.flatten().fieldErrors, data: null };
  }
  
  // Convert the 'YYYY-MM-DD' string to a Date object at UTC noon
  const dateString = validatedFields.data.transactionDate;
  const transactionDate = new Date(`${dateString}T12:00:00Z`);

  const normalized = {
    ...validatedFields.data,
    transactionDate,
    policyText:
      validatedFields.data.policyType === 'custom'
        ? (validatedFields.data.policyText ?? '')
        : '',
    repairLineItems: (validatedFields.data.repairLineItems || [])
      .map((li) => ({ name: li.name, price: typeof li.price === 'string' ? parseFloat(li.price) : li.price }))
      .filter((li) => li.name && !isNaN(li.price as number) && (li.price as number) > 0),
  };

  return { success: true, errors: null, data: normalized };
};

export async function createCustomer(formData: FormData) {
  const imageFiles = formData.getAll('images') as File[];
  
  let uploadedImageUrls: string[] = [];
  // Process images only if there are any files selected
  if (imageFiles.length > 0 && imageFiles[0].size > 0) {
    try {
      uploadedImageUrls = await Promise.all(
        imageFiles.filter((file) => file.size > 0).map((file) => getBase64(file))
      );
    } catch (error) {
      return { 
        errors: { images: ['Error processing images.'] },
        message: 'Error processing images. Please try again.' 
      };
    }
  }
  
  const validationResult = processAndValidateForm(formData);

  if (!validationResult.success) {
    return {
      errors: validationResult.errors,
      message: 'Failed to create customer. Please check the fields and try again.',
    };
  }

  // If validation is successful, proceed to add to the database
  try {
    const invoiceNumber = await getNextInvoiceNumber(validationResult.data!.transactionDate);
    await addCustomer({
      ...validationResult.data!,
      invoiceNumber,
      images: uploadedImageUrls,
    } as Omit<Customer, 'id' | 'deletedAt'>);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error.';
    return { 
      message: `Database Error: Failed to Create Customer. ${errorMessage}` 
    };
  }

  // On success, revalidate cache and redirect
  revalidatePath('/');
  redirect('/');
}

export async function updateCustomerAction(id: string, formData: FormData) {
  const imageFiles = formData.getAll('images') as File[];
  const existingImages =
    (formData.get('existingImages') as string)?.split(',').filter(Boolean) ||
    [];

  let uploadedImageUrls: string[] = [];
  if (imageFiles.length > 0 && imageFiles[0].size > 0) {
    try {
      uploadedImageUrls = await Promise.all(
        imageFiles.filter((file) => file.size > 0).map((file) => getBase64(file))
      );
    } catch(error) {
      return { 
        errors: { images: ['Error processing images.'] },
        message: 'Error processing images. Please try again.' 
      };
    }
  }

  const allImages = [...existingImages, ...uploadedImageUrls];
  
  const validationResult = processAndValidateForm(formData);

  if (!validationResult.success) {
    return {
      errors: validationResult.errors,
      message: 'Failed to update customer. Please check the fields.',
    };
  }

  try {
    await updateCustomer(id, { 
      ...validationResult.data!, 
      images: allImages,
    });
  } catch (error) {
    return { message: 'Database Error: Failed to Update Customer.' };
  }

  revalidatePath('/');
  revalidatePath(`/${id}`);
  revalidatePath(`/${id}/edit`);
  redirect(`/${id}`);
}


export async function deleteCustomerAction(id: string) {
  try {
    await deleteCustomer(id);
    revalidatePath('/');
    revalidatePath('/trash');
    return { message: 'Deleted Customer.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Customer.' };
  }
}

export async function restoreCustomerAction(id: string) {
  try {
    await restoreCustomer(id);
    revalidatePath('/');
    revalidatePath('/trash');
    return { message: 'Restored Customer.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Restore Customer.' };
  }
}

export async function permanentlyDeleteCustomerAction(id: string) {
  try {
    await permanentlyDeleteCustomer(id);
    revalidatePath('/trash');
    return { message: 'Permanently Deleted Customer.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Permanently Delete Customer.' };
  }
}

// 👉 暂时保持只返回 id / customerName / phoneModel
// 如果将来希望在搜索建议里也显示 phoneNumber，可以把类型里加上 'phoneNumber'
export async function getCustomerSuggestions(
  query: string
): Promise<
  Array<
    Pick<
      Customer,
      'id' | 'customerName' | 'phoneModel' | 'phoneNumber' | 'transactionDate' | 'repairItems' | 'customerType' | 'phonePrice' | 'devices' | 'repairLineItems'
    >
  >
> {
  const trimmed = query.trim();
  if (trimmed.length === 0) {
    return [];
  }

  const customers = await searchCustomers(trimmed, 5);

  return customers.map((c) => ({
    id: c.id,
    customerName: c.customerName,
    phoneModel: c.phoneModel,
    phoneNumber: c.phoneNumber,
    transactionDate: c.transactionDate,
    repairItems: c.repairItems,
    customerType: c.customerType,
    phonePrice: c.phonePrice,
    devices: c.devices,
    repairLineItems: c.repairLineItems,
  }));
}
