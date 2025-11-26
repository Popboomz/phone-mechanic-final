import { CustomerForm } from "@/components/customer-form";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function NewCustomerPage() {
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
                <CustomerForm />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
