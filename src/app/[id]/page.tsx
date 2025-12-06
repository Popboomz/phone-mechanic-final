import { notFound } from "next/navigation";
import Link from "next/link";
import { DashboardLinkFromSession } from "@/components/dashboard-link-session";
import { getCustomerById, getFullLabelPathForRepairItem } from "@/lib/data";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Home } from "lucide-react";
import { InvoiceActions } from "@/components/invoice-actions";
import { getPolicyText } from "@/lib/policies";

export default async function TaxInvoicePage({ params }: { params: { id: string } }) {
  const customer = await getCustomerById(params.id);

  if (!customer) {
    notFound();
  }

  const transactionDate = new Date(customer.transactionDate);
  const invoiceNumber = customer.invoiceNumber || `${transactionDate.getFullYear()}${String(
    transactionDate.getMonth() + 1
  ).padStart(2, "0")}${String(transactionDate.getDate()).padStart(2, "0")}-000`;

  const devices = Array.isArray(customer.devices) ? customer.devices : [];
  const repairLinesAll = Array.isArray(customer.repairLineItems) ? customer.repairLineItems : [];
  const repairLines = repairLinesAll.filter((li) => (parseFloat(String(li.price)) || 0) > 0);
  const deviceTotal = devices.length > 0 ? devices.reduce((sum, d) => sum + (parseFloat(d.price) || 0), 0) : 0;
  const repairTotal = repairLines.length > 0 ? repairLines.reduce((sum, li) => sum + (parseFloat(String(li.price)) || 0), 0) : 0;
  const baseTotal = (devices.length > 0 || repairLines.length > 0)
    ? deviceTotal + repairTotal
    : parseFloat(customer.phonePrice);
  const subtotal = baseTotal / 1.1;
  const gst = baseTotal - subtotal;

  return (
    <div id="invoice-root" className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="no-print">
        <Header />
      </div>
      <main className="flex-1 container mx-auto p-4 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb + Actions */}
          <div className="mb-4 no-print">
            <nav aria-label="breadcrumb">
              <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
                <li>
                  <DashboardLinkFromSession className="hover:text-primary transition-colors flex items-center gap-2" />
                </li>
                <li>
                  <span className="text-muted-foreground">/</span>
                </li>
                <li className="font-medium text-foreground" aria-current="page">
                  Invoice {invoiceNumber}
                </li>
              </ol>
            </nav>
            <div className="mt-2 flex items-center gap-2">
              <InvoiceActions customer={customer} />
              <Link href={`/dashboard/invoices/${customer.id}/receipt`} target="_blank" className="no-print">
                <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-2 text-xs sm:h-10 sm:px-4 sm:text-sm">
                  Print 80mm Receipt
                </button>
              </Link>
            </div>
          </div>

          {/* Invoice */}
          <Card id="printable-area" className="printable-area bg-white dark:bg-card shadow-lg rounded-lg">
            <CardHeader className="p-8">
              <div className="flex flex-col gap-1 text-left">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 font-headline">Tax Invoice</h1>
                <p className="text-muted-foreground">Invoice #{invoiceNumber}</p>
                <div className="mt-4 font-semibold text-gray-700 dark:text-gray-200">PHONE MECHANIC</div>
                <div className="text-sm text-muted-foreground leading-tight space-y-0.5">
                  <p>ABN 50 629 357 937</p>
                  <p>Shop C3A Eastwood Shopping Centre</p>
                  <p>160 Rowe Street, EASTWOOD NSW 2122</p>
                  <p>info@phonemechanic.com.au</p>
                  <p>www.PhoneMechanic.com.au</p>
                  <p>0450779688, 0414640101</p>
                </div>
              </div>
              <Separator className="my-6" />

              {/* Bill To */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h3 className="font-semibold text-gray-600 dark:text-gray-300 mb-1">Bill To:</h3>
                  <p className="font-bold text-primary">{customer.customerName}</p>

                  {/* Phone Number >>> 新增 */}
                  {customer.phoneNumber && (
                    <p>Phone: {customer.phoneNumber}</p>
                  )}

                  <p>
                    {customer.phoneModel}
                    {customer.phoneStorage && ` ${customer.phoneStorage}`}
                  </p>

                  {customer.phoneImei && <p>IMEI: {customer.phoneImei}</p>}
                </div>

                <div className="text-right">
                  <p>
                    <span className="font-semibold text-gray-600 dark:text-gray-300">Invoice Date:</span>{" "}
                    {transactionDate.toLocaleDateString("en-AU")}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-600 dark:text-gray-300">Warranty:</span>{" "}
                    {customer.warrantyPeriod} months
                  </p>
                </div>
              </div>
            </CardHeader>

            {/* Table */}
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
                    {devices.length > 0 ? (
                      devices.map((d, i) => (
                        <tr key={i} className="border-b dark:border-gray-700">
                          <td className="p-3">
                            <p className="font-medium">Device {i + 1}: {d.model}{d.storage ? ` ${d.storage}` : ''}{d.imei ? ` (IMEI: ${d.imei})` : ''}</p>
                          </td>
                          <td className="p-3 text-right font-mono">${(parseFloat(d.price) || 0).toFixed(2)}</td>
                        </tr>
                      ))
                    ) : repairLines.length > 0 ? (
                      repairLines.map((li, idx) => (
                        <tr key={idx} className="border-b dark:border-gray-700">
                          <td className="p-3">
                            <p className="font-medium">{li.name}</p>
                          </td>
                          <td className="p-3 text-right font-mono">${(parseFloat(String(li.price)) || 0).toFixed(2)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr className="border-b dark:border-gray-700">
                        <td className="p-3">
                          <p className="font-medium">
                            {(customer.repairItems || []).length > 0
                              ? customer.repairItems
                                  .map((id) =>
                                    id.startsWith("custom:")
                                      ? id.slice(7)
                                      : getFullLabelPathForRepairItem(id)
                                  )
                                  .join("; ")
                              : "Phone Sale"}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {customer.phoneModel}
                            {customer.phoneStorage && ` ${customer.phoneStorage}`}
                            {customer.phoneImei && ` (IMEI: ${customer.phoneImei})`}
                          </p>
                        </td>
                        <td className="p-3 text-right font-mono">${(parseFloat(customer.phonePrice) || 0).toFixed(2)}</td>
                      </tr>
                    )}
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
                      <td className="p-3 text-right font-bold font-mono text-lg text-primary">${baseTotal.toFixed(2)}</td>
                    </tr>
                    {repairLines.length > 0 && (
                      <tr>
                        <td className="p-3 text-right font-semibold text-gray-600 dark:text-gray-400">Repair Total</td>
                        <td className="p-3 text-right font-mono">${repairTotal.toFixed(2)}</td>
                      </tr>
                    )}
                  </tfoot>
                </table>
              </div>

              <Separator className="my-8" />

              {/* Notes */}
              <div>
                <h3 className="font-semibold text-gray-600 dark:text-gray-300 mb-2">Notes</h3>
                <p className="text-muted-foreground text-xs whitespace-pre-wrap">
                  {customer.notes || "Thank you for your business. Please retain this invoice for warranty purposes."}
                </p>
              </div>

              <Separator className="my-8" />

              {/* Warranty & Policy */}
              {(() => {
                const policyTypes = new Set<string>();
                if (customer.policyType) policyTypes.add(customer.policyType);
                devices.forEach((d) => { if (d.policyType) policyTypes.add(d.policyType); });
                const list = Array.from(policyTypes);
                if (list.length === 0) return null;
                return (
                  <div>
                    <h3 className="font-semibold text-gray-600 dark:text-gray-300 mb-2">Warranty & Policy</h3>
                    {list.map((pt, idx) => (
                      <p key={idx} className="text-muted-foreground text-xs whitespace-pre-wrap mb-4">
                        {getPolicyText(pt as any, undefined)}
                      </p>
                    ))}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
