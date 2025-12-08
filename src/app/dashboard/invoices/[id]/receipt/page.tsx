import { notFound } from "next/navigation";
import { getCustomerById } from "@/lib/data";
import { Receipt80mm } from "@/components/receipt/Receipt80mm";

export default async function ReceiptPage({ params }: { params: { id: string } }) {
  const customer = await getCustomerById(params.id);
  if (!customer) notFound();
  return (
    <div id="receipt-root" className="bg-white text-black p-4 dark:bg-white dark:text-black">
      <div className="no-print mb-3 flex items-center justify-between text-sm">
        <a href={`/?store=${customer.storeId}`} className="hover:text-primary">← Back to Dashboard</a>
        <a href={`/${customer.id}`} className="hover:text-primary">Open Invoice</a>
      </div>
      <Receipt80mm customer={customer} />
    </div>
  );
}
