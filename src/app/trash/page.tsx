import Link from "next/link";
import { getDeletedCustomers } from "@/lib/data";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Home } from "lucide-react";
import { DeletedCustomerCard } from "@/components/deleted-customer-card";

export default async function TrashPage() {
  const deletedCustomers = await getDeletedCustomers();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 sm:p-6 md:p-8">
        <div className="flex items-center justify-between mb-8">
            <div>
                 <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2 font-headline">
                    Trash
                </h1>
                <p className="text-muted-foreground">
                    Deleted customer profiles. You can restore or permanently delete them.
                </p>
            </div>
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
                    Trash
                </li>
              </ol>
            </nav>
        </div>

        {deletedCustomers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {deletedCustomers.map((customer) => (
              <DeletedCustomerCard key={customer.id} customer={customer} />
            ))}
          </div>
        ) : (
          <Card className="col-span-full mt-10">
            <CardContent className="flex flex-col items-center justify-center p-16 text-center">
              <User className="w-16 h-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2 font-headline">The trash is empty</h2>
              <p className="text-muted-foreground mb-6 max-w-sm">
                When you delete a customer, their profile will appear here.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
