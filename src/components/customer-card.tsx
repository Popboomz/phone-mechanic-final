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
    <Card className="flex flex-col overflow-hidden h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            {/* 客户名字 */}
            <CardTitle className="font-headline text-xl leading-tight">
              <Link
                href={`/${customer.id}`}
                className="hover:text-primary transition-colors"
              >
                {customer.customerName}
              </Link>
            </CardTitle>

            {/* 电话（只有填写了才显示） */}
            {customer.phoneNumber && (
              <CardDescription className="flex items-center mt-1">
                <Phone className="w-3 h-3 mr-1.5" /> {customer.phoneNumber}
              </CardDescription>
            )}

            {/* 手机型号 */}
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Model: {customer.phoneModel}
            </CardDescription>
          </div>

          {/* 右上角菜单（三个点） */}
          <CustomerCardActions customer={customer} />
        </div>
      </CardHeader>

      {/* 中间显示信息 */}
      <CardContent className="flex-grow space-y-3">
        <Link href={`/${customer.id}`} className="block">
          <div className="text-sm text-muted-foreground space-y-2">
            <div className="flex items-center">
              <Hash className="w-4 h-4 mr-2 text-primary" />
              <span>IMEI: {customer.phoneImei}</span>
            </div>

            <div className="flex items-start">
              <Wrench className="w-4 h-4 mr-2 text-primary flex-shrink-0 mt-0.5" />
              <span className="truncate">
                Repair: {(customer.repairItems || [])
                  .map((id) => (id.startsWith('custom:') ? id.slice(7) : getFullLabelPathForRepairItem(id)))
                  .join('; ')}
              </span>
            </div>

            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-primary" />
              <span>
                {formatAUDate(customer.transactionDate)}  {/* ← ★ 改為澳洲格式 */}
              </span>
            </div>
          </div>
        </Link>

        <Badge variant="secondary" className="font-mono text-base">
          ${customer.phonePrice}
        </Badge>
      </CardContent>

      <CardFooter className="bg-muted/50 p-3">
        <CustomerCardActions customer={customer} isFooter />
      </CardFooter>
    </Card>
  );
}
