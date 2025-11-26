'use client';

import Link from 'next/link';
import { User, PlusCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { Customer } from '@/lib/types';
import { CustomerCard } from '@/components/customer-card';
import { DashboardControls } from '@/components/dashboard-controls';
import { Button } from '@/components/ui/button';

export function CustomerDashboard({
  initialCustomers,
  query,
}: {
  initialCustomers: Customer[];
  query: string;
}) {
  const customers = initialCustomers;

  const groupedCustomers = customers.reduce((acc, customer) => {
    const date = new Date(customer.transactionDate).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(customer);
    return acc;
  }, {} as Record<string, Customer[]>);

  const sortedDates = Object.keys(groupedCustomers).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <>
      <DashboardControls query={query} />

      {customers.length > 0 ? (
        <Accordion
          type="single"
          collapsible
          defaultValue={sortedDates[0]}
          className="w-full space-y-4"
        >
          {sortedDates.map((date) => (
            <AccordionItem value={date} key={date} className="border-none">
              <AccordionTrigger className="text-lg font-semibold text-foreground bg-muted hover:bg-muted/80 px-4 py-3 rounded-lg data-[state=open]:rounded-b-none">
                {new Date(date + 'T00:00:00Z').toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  timeZone: 'UTC',
                })}
              </AccordionTrigger>
              <AccordionContent className="p-4 border border-t-0 rounded-b-lg bg-card">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {groupedCustomers[date].map((customer) => (
                    <CustomerCard key={customer.id} customer={customer} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <Card className="col-span-full mt-10">
          <CardContent className="flex flex-col items-center justify-center p-16 text-center">
            <User className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2 font-headline">
              No Customers Found
            </h2>
            <p className="text-muted-foreground mb-6 max-w-sm">
              {query
                ? `Your search for "${query}" did not match any customers.`
                : "It looks like you haven't added any customers yet. Get started by creating a new customer profile."}
            </p>
            {!query && (
              <Link href="/new">
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add First Customer
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}
