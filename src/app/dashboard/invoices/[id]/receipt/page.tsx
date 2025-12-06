import { notFound } from "next/navigation";
import { getCustomerById } from "@/lib/data";
import { Receipt80mm } from "@/components/receipt/Receipt80mm";

export default async function ReceiptPage({ params }: { params: { id: string } }) {
  const customer = await getCustomerById(params.id);
  if (!customer) notFound();
  return (
    <div id="receipt-root" className="bg-white text-black p-4 dark:bg-white dark:text-black">
      <Receipt80mm customer={customer} />
    </div>
  );
}
