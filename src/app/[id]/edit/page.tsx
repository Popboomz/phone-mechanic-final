import { notFound } from "next/navigation";
import { getCustomerById } from "@/lib/data";
import { CustomerForm } from "@/components/customer-form";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function EditCustomerPage({
  params,
}: {
  params: { id: string };
}) {
  const id = params.id;
  const customer = await getCustomerById(id);

  if (!customer) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-headline">Edit Customer Profile</CardTitle>
              <CardDescription>Update the details for {customer.customerName}.</CardDescription>
            </CardHeader>
            <CardContent>
                <CustomerForm customer={customer} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
