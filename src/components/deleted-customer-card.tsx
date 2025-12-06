import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Phone, Calendar, Hash, User, Trash2, Undo, AlertTriangle } from "lucide-react";
import type { Customer } from "@/lib/types";
import { restoreCustomerAction, permanentlyDeleteCustomerAction } from "@/lib/actions";
import { formatAUDate } from "@/lib/utils";

export function DeletedCustomerCard({ customer }: { customer: Customer }) {
  const restoreCustomerWithId = restoreCustomerAction.bind(null, customer.id);
  const permDeleteCustomerWithId = permanentlyDeleteCustomerAction.bind(null, customer.id);

  return (
    <Card className="flex flex-col overflow-hidden bg-muted/30 border-dashed">
      <CardHeader>
        <div>
          <CardTitle className="font-headline text-xl leading-tight">
            {customer.customerName}
          </CardTitle>
          <CardDescription className="flex items-center mt-1">
            <Phone className="w-3 h-3 mr-1.5" /> {customer.phoneModel}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <div className="text-sm text-muted-foreground space-y-2">
            <div className="flex items-center text-destructive">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Deleted on: {customer.deletedAt ? formatAUDate(customer.deletedAt) : 'N/A'}
            </div>
            <div className="flex items-center">
                <Hash className="w-4 h-4 mr-2 text-primary" />
                <span>IMEI: {customer.phoneImei}</span>
            </div>
            <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-primary" />
                <span>{formatAUDate(customer.transactionDate)}</span>
            </div>
            <div className="flex items-center">
                <span className="w-4 h-4 mr-2" />
                <span>Staff: {customer.staffName || '-'}</span>
            </div>
        </div>
        <Badge variant="secondary" className="font-mono text-base">
          ${customer.phonePrice}
        </Badge>
      </CardContent>
      <CardFooter className="bg-muted/50 p-3 grid grid-cols-2 gap-2">
        <form action={restoreCustomerWithId}>
            <Button variant="outline" size="sm" className="w-full">
              <Undo className="w-4 h-4 mr-2" />
              Restore
            </Button>
        </form>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="w-full">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Permanently
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the customer profile for {customer.customerName} and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <form action={permDeleteCustomerWithId}>
                <AlertDialogAction type="submit" className="w-full bg-destructive hover:bg-destructive/90">
                    Delete Permanently
                </AlertDialogAction>
              </form>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
