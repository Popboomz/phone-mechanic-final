
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCustomerById, getFullLabelPathForRepairItem } from "@/lib/data";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Home } from "lucide-react";
import { InvoiceActions } from "@/components/invoice-actions";


export default async function TaxInvoicePage({ params }: { params: { id: string } }) {
  const customer = await getCustomerById(params.id);

  if (!customer) {
    notFound();
  }
  
  const transactionDate = new Date(customer.transactionDate);
  const invoiceNumber = `${transactionDate.getFullYear()}${String(transactionDate.getMonth() + 1).padStart(2, '0')}-${String(transactionDate.getMinutes()).padStart(2, '0')}${String(transactionDate.getSeconds()).padStart(2, '0')}`;

  const totalPrice = parseFloat(customer.phonePrice);
  const subtotal = totalPrice / 1.1;
  const gst = totalPrice - subtotal;

  return (
    <div id="invoice-root" className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1 container mx-auto p-4 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-4 no-print">
                 <nav aria-label="breadcrumb">
                  <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <li>
                      <Link href="/" className="hover:text-primary transition-colors flex items-center gap-2">
                        <Home className="w-4 h-4" /> Dashboard
                      </Link>
                    </li>
                    <li>
                      <span className="text-muted-foreground">/</span>
                    </li>
                    <li className="font-medium text-foreground" aria-current="page">
                      Invoice {invoiceNumber}
                    </li>
                  </ol>
                </nav>
                <div className="flex items-center gap-2">
                    <InvoiceActions customer={customer} />
                </div>
            </div>
          <Card id="printable-area" className="printable-area bg-white dark:bg-card shadow-lg rounded-lg">
            <CardHeader className="p-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 font-headline">Tax Invoice</h1>
                        <p className="text-muted-foreground">Invoice #{invoiceNumber}</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">PHONE MECHANIC</h2>
                        <p className="text-sm text-muted-foreground">ABN 50 629 357 937</p>
                        <p className="text-sm text-muted-foreground">shop c3a (in front of woolworth) 160 rowe street eastwood shopping centre</p>
                        <p className="text-sm text-muted-foreground">EASTWOOD NSW 2122</p>
                        <p className="text-sm text-muted-foreground">info@phonemechanic.com.au</p>
                        <p className="text-sm text-muted-foreground">www.PhoneMechanic.com.au</p>
                        <p className="text-sm text-muted-foreground">0450779699, 0414640101</p>
                    </div>
                </div>
              <Separator className="my-6" />
               <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <h3 className="font-semibold text-gray-600 dark:text-gray-300 mb-1">Bill To:</h3>
                        <p className="font-bold text-primary">{customer.customerName}</p>
                        <p>{customer.phoneModel}{customer.phoneStorage && ` ${customer.phoneStorage}`}</p>
                        {customer.phoneImei && <p>IMEI: {customer.phoneImei}</p>}
                    </div>
                    <div className="text-right">
                        <p><span className="font-semibold text-gray-600 dark:text-gray-300">Invoice Date:</span> {transactionDate.toLocaleDateString()}</p>
                        <p><span className="font-semibold text-gray-600 dark:text-gray-300">Warranty:</span> {customer.warrantyPeriod} months</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="p-3 text-left font-semibold text-gray-600 dark:text-gray-300">Description</th>
                      <th className="p-3 text-right font-semibold text-gray-600 dark:text-gray-300">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b dark:border-gray-700">
                      <td className="p-3">
                        <p className="font-medium">{getFullLabelPathForRepairItem(customer.repairItem) || 'Phone Sale'}</p>
                        <p className="text-muted-foreground text-xs">{customer.phoneModel}{customer.phoneStorage && ` ${customer.phoneStorage}`}{customer.phoneImei && ` (IMEI: ${customer.phoneImei})`}</p>
                      </td>
                      <td className="p-3 text-right font-mono">${subtotal.toFixed(2)}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-dashed">
                        <td className="p-3 text-right font-semibold text-gray-600 dark:text-gray-400">Subtotal</td>
                        <td className="p-3 text-right font-mono">${subtotal.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td className="p-3 text-right font-semibold text-gray-600 dark:text-gray-400">GST (10%)</td>
                        <td className="p-3 text-right font-mono">${gst.toFixed(2)}</td>
                    </tr>
                    <tr className="border-t bg-gray-50 dark:bg-gray-800/50">
                      <td className="p-3 text-right font-bold text-lg text-gray-700 dark:text-gray-200">Total</td>
                      <td className="p-3 text-right font-bold font-mono text-lg text-primary">${totalPrice.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <Separator className="my-8" />
               <div>
                  <h3 className="font-semibold text-gray-600 dark:text-gray-300 mb-2">Notes</h3>
                  <p className="text-muted-foreground text-xs whitespace-pre-wrap">{customer.notes || 'Thank you for your business. Please retain this invoice for warranty purposes.'}</p>
              </div>
              <Separator className="my-8" />
              <div className="text-xs text-muted-foreground">
                  <h3 className="font-semibold text-gray-600 dark:text-gray-300 mb-2 text-sm">WARRANTY POLICY</h3>
                  <p className="mb-4">Our store offers functional warranty coverage for repair services and sold items to ensure customer experience.</p>
                  
                  <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-2">✅ Warranty Covers ONLY the following non-physical damages:</h4>
                  <ul className="list-disc list-inside space-y-1 mb-4">
                      <li>Original repaired part functional faults (e.g., black screen, touch issues, fingerprint malfunction – only if not caused by drops, water, pressure, or misuse)</li>
                      <li>Motherboard or logic IC issues (e.g., no power, random shutdowns – only if not caused by external force, liquid, or power surge)</li>
                      <li>Signal-related issues (e.g., no service, Wi-Fi/Bluetooth failure – only if not caused by drop damage or antenna tampering)</li>
                      <li>Audio module issues (e.g., earpiece, speaker, mic not working – only if not due to water, dust, or impact damage)</li>
                      <li>Charging or USB port problems (e.g., not charging, unstable connection – only if not caused by improper cables, misuse, or broken pins)</li>
                  </ul>

                  <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-2">⚠️ NOT Covered Under Warranty (regardless of warranty period):</h4>
                  <ul className="list-disc list-inside space-y-1 mb-4">
                      <li>Any physical or external damage: drops, liquid, pressure, corrosion, overheating, dust</li>
                      <li>All cosmetic damage: scratches, cracks, dents, discoloration, broken frames</li>
                      <li>Battery wear: reduced runtime, fast drain, charging inefficiency (normal usage wear)</li>
                      <li>Software/system issues: freezing, boot loops, update failure, app crashes</li>
                      <li>Third-party tampering: unauthorized repair, screen replacement, flashing, root</li>
                      <li>Invalid IMEI/Serial: missing, modified, or unmatched with invoice record</li>
                  </ul>
                  
                  <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-2">📝 Additional Notes:</h4>
                  <ul className="list-disc list-inside space-y-1">
                      <li>Devices submitted for warranty must be free from any new physical or external damage.</li>
                      <li>All claims are subject to technician inspection before approval.</li>
                      <li>We reserve the final right to determine repair, replacement, or paid solution.</li>
                      <li>Data loss is not covered under warranty. Please back up your data beforehand.</li>
                  </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
