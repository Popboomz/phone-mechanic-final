import { Header } from "@/components/header";
import { getCustomers } from "@/lib/data";
import { CustomerDashboard } from "@/components/customer-dashboard";

export default async function Home({
  searchParams,
}: {
  searchParams?: {
    query?: string;
  };
}) {
  const query = searchParams?.query || "";
  const customers = await getCustomers(query);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 sm:p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2 font-headline">
            Customer Info Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your customer profiles, view details, and generate invoices.
          </p>
        </div>
        <CustomerDashboard initialCustomers={customers} query={query} />
      </main>
    </div>
  );
}