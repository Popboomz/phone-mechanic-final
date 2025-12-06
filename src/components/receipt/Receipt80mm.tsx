import type { Customer } from "@/lib/types";
import { getFullLabelPathForRepairItem } from "@/lib/data";
import { getPolicyText } from "@/lib/policies";

export function Receipt80mm({ customer }: { customer: Customer }) {
  const transactionDate = new Date(customer.transactionDate);
  const invoiceNumber = customer.invoiceNumber || `${transactionDate.getFullYear()}${String(transactionDate.getMonth() + 1).padStart(2, "0")}${String(transactionDate.getDate()).padStart(2, "0")}-000`;
  const devices = Array.isArray(customer.devices) ? customer.devices : [];
  const repairLinesAll = Array.isArray(customer.repairLineItems) ? customer.repairLineItems : [];
  const repairLines = repairLinesAll.filter((li) => (parseFloat(String(li.price)) || 0) > 0);
  const deviceTotal = devices.length > 0 ? devices.reduce((sum, d) => sum + (parseFloat(d.price) || 0), 0) : 0;
  const repairTotal = repairLines.length > 0 ? repairLines.reduce((sum, li) => sum + (parseFloat(String(li.price)) || 0), 0) : 0;
  const baseTotal = (devices.length > 0 || repairLines.length > 0) ? deviceTotal + repairTotal : parseFloat(customer.phonePrice);
  const subtotal = baseTotal / 1.1;
  const gst = baseTotal - subtotal;

  const policyTypes = (() => {
    const set = new Set<string>();
    if (customer.policyType) set.add(customer.policyType);
    (devices || []).forEach((d) => { if ((d as any).policyType) set.add((d as any).policyType as string); });
    return Array.from(set);
  })();

  return (
    <div className="mx-auto w-full max-w-[576px] text-black">
      <div className="px-4 py-3">
        <div className="text-center">
          <div className="font-semibold">PHONE MECHANIC</div>
          <div className="text-xs">ABN 50 629 357 937</div>
          <div className="text-xs">Shop C3A Eastwood Shopping Centre</div>
          <div className="text-xs">160 Rowe Street, EASTWOOD NSW 2122</div>
          <div className="text-xs">0450779688 / 0414640101</div>
        </div>
        <div className="my-2 text-[10px]">----------------------------------------</div>
        <div className="text-left">
          <div className="text-sm font-semibold">Tax Invoice</div>
          <div className="text-xs">Invoice #: {invoiceNumber}</div>
          <div className="text-xs">Date: {transactionDate.toLocaleDateString("en-AU")}</div>
        </div>
        <div className="my-2 text-[10px]">----------------------------------------</div>
        <div className="text-left text-xs leading-tight space-y-0.5">
          <div>Customer: {customer.customerName}</div>
          {customer.phoneNumber && (<div>Phone: {customer.phoneNumber}</div>)}
          <div>Device: {customer.phoneModel}{customer.phoneStorage ? ` ${customer.phoneStorage}` : ""}</div>
          {customer.phoneImei && (<div>IMEI/SN: {customer.phoneImei}</div>)}
        </div>
        <div className="my-2 text-[10px]">----------------------------------------</div>
        <div className="text-xs">
          <div className="flex justify-between font-semibold">
            <span>Description</span>
            <span>Amount</span>
          </div>
          {(devices.length > 0 ? devices : repairLines.length > 0 ? repairLines : [{ name: (customer.repairItems || []).length > 0 ? (customer.repairItems || []).map((id) => id.startsWith("custom:") ? id.slice(7) : getFullLabelPathForRepairItem(id)).join("; ") : "Phone Sale", price: customer.phonePrice }]).map((item: any, idx: number) => (
            <div key={idx} className="flex justify-between">
              <span className="pr-2 mr-2 break-words min-w-0">{item.model ? `Device ${idx + 1}: ${item.model}${item.storage ? ` ${item.storage}` : ""}${item.imei ? ` (IMEI: ${item.imei})` : ""}` : item.name}</span>
              <span className="text-right font-mono">${(parseFloat(item.price) || 0).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="my-2 text-[10px]">----------------------------------------</div>
        <div className="text-xs">
          <div className="flex justify-between"><span>Subtotal</span><span className="font-mono">${subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>GST (10%)</span><span className="font-mono">${gst.toFixed(2)}</span></div>
          <div className="flex justify-between font-semibold"><span>Total</span><span className="font-mono">${baseTotal.toFixed(2)}</span></div>
        </div>
        <div className="my-2 text-[10px]">----------------------------------------</div>
        {policyTypes.length > 0 && (
          <div className="text-[10px] leading-tight whitespace-pre-wrap space-y-2">
            {policyTypes.map((pt, i) => (
              <div key={i}>{getPolicyText(pt as any, undefined)}</div>
            ))}
          </div>
        )}
        <div className="my-2 text-[10px]">----------------------------------------</div>
        <div className="text-[10px] whitespace-pre-wrap leading-tight">
          <div className="font-semibold mb-1">Notes:</div>
          <div>{customer.notes || "Thank you for your business."}</div>
        </div>
        <div className="my-2 text-[10px]">----------------------------------------</div>
        <div className="text-center text-[10px]">Thank you for your business.</div>
      </div>
    </div>
  );
}

