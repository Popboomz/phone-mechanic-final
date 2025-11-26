
"use client";

import { useTransition } from "react";
import Link from "next/link";
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
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import type { Customer } from "@/lib/types";
import { deleteCustomerAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";


export function CustomerCardActions({ customer, isFooter = false }: { customer: Customer, isFooter?: boolean }) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent dialog from closing immediately
    startTransition(async () => {
      const result = await deleteCustomerAction(customer.id);
      if (result?.message) {
        toast({
            title: "Success",
            description: `Customer "${customer.customerName}" moved to trash.`,
        });
      } else {
         toast({
            title: "Error",
            description: result.message || 'An unexpected error occurred.',
            variant: "destructive",
        });
      }
    });
  };

  if (isFooter) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full" onClick={stopPropagation}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action will move the customer profile for {customer.customerName} to the trash. You can restore it later.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  disabled={isPending}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Moving...
                    </>
                  ) : "Move to Trash"}
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
  }

  return (
    <div className="flex items-center">
        <Link href={`/${customer.id}/edit`}>
            <Button variant="ghost" size="icon">
                <Pencil className="w-4 h-4" />
            </Button>
        </Link>
    </div>
  );
}
