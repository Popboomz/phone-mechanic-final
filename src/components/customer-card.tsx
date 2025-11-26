
import Link from "next/link";
import Image from "next/image";
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

export function CustomerCard({ customer }: { customer: Customer }) {

  return (
    <Card className="flex flex-col overflow-hidden h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="font-headline text-xl leading-tight">
                <Link href={`/${customer.id}`} className="hover:text-primary transition-colors">
                    {customer.customerName}
                </Link>
            </CardTitle>
            <CardDescription className="flex items-center mt-1">
              <Phone className="w-3 h-3 mr-1.5" /> {customer.phoneModel}
            </CardDescription>
          </div>
          <CustomerCardActions customer={customer} />
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <Link href={`/${customer.id}`} className="block">
            <div className="relative aspect-video w-full rounded-md overflow-hidden">
                <Image
                src={customer.images && customer.images.length > 0 ? customer.images[0] : "https://placehold.co/600x400.png"}
                alt={`${customer.customerName}'s phone`}
                fill
                className="object-cover"
                data-ai-hint="phone product"
                />
            </div>
        </Link>
        <div className="text-sm text-muted-foreground space-y-2">
          <div className="flex items-center">
            <Hash className="w-4 h-4 mr-2 text-primary" />
            <span>IMEI: {customer.phoneImei}</span>
          </div>
           <div className="flex items-start">
            <Wrench className="w-4 h-4 mr-2 text-primary flex-shrink-0 mt-0.5" />
            <span className="truncate">Repair: {getFullLabelPathForRepairItem(customer.repairItem)}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-primary" />
            <span>{new Date(customer.transactionDate).toLocaleDateString()}</span>
          </div>
        </div>
        <Badge variant="secondary" className="font-mono text-base">
          ${customer.phonePrice}
        </Badge>
      </CardContent>
      <CardFooter className="bg-muted/50 p-3">
         <CustomerCardActions customer={customer} isFooter={true}/>
      </CardFooter>
    </Card>
  );
}
