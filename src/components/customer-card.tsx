import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Calendar, Hash, Wrench } from "lucide-react";
import type { Customer } from "@/lib/types";
import { getFullLabelPathForRepairItem } from "@/lib/data";
import { CustomerCardActions } from "./customer-card-actions";
import { formatAUDate } from "@/lib/utils";   // ← ★ 添加这个

export function CustomerCard({ customer }: { customer: Customer }) {
  return (
    <Card className="flex flex-col overflow-hidden h-full transition-all duration-300 hover:shadow-lg border rounded-md text-white">
      <CardHeader className="p-2">
        <div className="flex items-start justify-between">
          <div>
            {/* 客户名字 */}
            <CardTitle className="font-headline text-base leading-tight">
              <Link
                href={`/${customer.id}`}
                className="hover:text-primary transition-colors"
              >
                {customer.customerName}
              </Link>
            </CardTitle>

            {/* 电话（只有填写了才显示） */}
            {customer.phoneNumber && (
              <CardDescription className="flex items-center mt-1 text-white">
                <Phone className="w-3 h-3 mr-1.5" /> {customer.phoneNumber}
              </CardDescription>
            )}

            {/* 手机型号 */}
            <CardDescription className="text-[11px] text-white/80 mt-0.5">
              Model: {customer.phoneModel}
            </CardDescription>
          </div>

          {/* 右侧：价钱 + 操作 */}
          <div className="flex items-center gap-1">
            <Badge variant="secondary" className="font-mono text-xs text-white">${customer.phonePrice}</Badge>
            <CustomerCardActions customer={customer} />
          </div>
        </div>
      </CardHeader>

      {/* 中间显示信息 */}
      <CardContent className="p-2 pt-0 flex-grow">
        <Link href={`/${customer.id}`} className="block">
          <div className="text-xs text-white flex items-center gap-2">
            <span className="flex items-center min-w-0">
              <Wrench className="w-3 h-3 mr-1 text-primary flex-shrink-0" />
              <span className="truncate">
                {(customer.repairItems || [])
                  .map((id) => (id.startsWith('custom:') ? id.slice(7) : getFullLabelPathForRepairItem(id)))
                  .join('; ')}
              </span>
            </span>
            <span className="opacity-70">·</span>
            <span className="flex items-center">
              <Calendar className="w-3 h-3 mr-1 text-primary" />
              {formatAUDate(customer.transactionDate)}
            </span>
          </div>
        </Link>
      </CardContent>

    </Card>
  );
}
