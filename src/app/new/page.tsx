import { CustomerForm } from "@/components/customer-form";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { StoreId } from "@/lib/types";

export default async function NewCustomerPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const sp = await searchParams;
  const raw = (sp.store as string) || "";
  const upper = raw.toUpperCase();
  const currentStore: StoreId = upper === "PARRAMATTA" ? "PARRAMATTA" : "EASTWOOD";

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-headline">Create New Customer Profile</CardTitle>
              <CardDescription>Fill in the details below to add a new customer to your records.</CardDescription>
            </CardHeader>
            <CardContent>
                <CustomerForm currentStoreId={currentStore} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
