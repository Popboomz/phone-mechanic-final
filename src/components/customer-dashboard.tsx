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
import { formatOrdinalDay } from '@/lib/utils';
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

  const byYMD = Object.keys(groupedCustomers).reduce((acc, date) => {
    const year = date.slice(0, 4);
    const month = date.slice(0, 7); // YYYY-MM
    acc[year] = acc[year] || {};
    acc[year][month] = acc[year][month] || {};
    acc[year][month][date] = groupedCustomers[date];
    return acc;
  }, {} as Record<string, Record<string, Record<string, Customer[]>>>);

  const sortedYears = Object.keys(byYMD).sort((a, b) => parseInt(b) - parseInt(a));

  const todayIso = new Date().toISOString().split('T')[0];
  const todayYear = todayIso.slice(0, 4);
  const todayMonth = todayIso.slice(0, 7);
  const hasToday = Boolean(groupedCustomers[todayIso]);
  const defaultYearOpen = hasToday ? todayYear : undefined;
  const defaultMonthOpen = hasToday ? todayMonth : undefined;
  const defaultDayOpen = hasToday ? todayIso : undefined;

  return (
    <>
      <DashboardControls query={query} />

      {customers.length > 0 ? (
        <Accordion
          type="single"
          collapsible
          defaultValue={defaultYearOpen}
          className="w-full space-y-4"
        >
          {sortedYears.map((year) => {
            const monthsInYear = Object.keys(byYMD[year]).sort(
              (a, b) => new Date(b + '-01').getTime() - new Date(a + '-01').getTime()
            );
            const monthDefault = hasToday && year === todayYear ? defaultMonthOpen : undefined;
            return (
              <AccordionItem value={year} key={year} className="border-none">
                <AccordionTrigger className="text-lg font-semibold text-foreground bg-muted hover:bg-muted/80 px-4 py-3 rounded-lg data-[state=open]:rounded-b-none">
                  {year}
                </AccordionTrigger>
                <AccordionContent className="p-4 border border-t-0 rounded-b-lg bg-card">
                  <Accordion type="single" collapsible defaultValue={monthDefault} className="space-y-4">
                    {monthsInYear.map((month) => {
                      const datesInMonth = Object.keys(byYMD[year][month]).sort(
                        (a, b) => new Date(b).getTime() - new Date(a).getTime()
                      );
                      const dayDefault = hasToday && year === todayYear && month === todayMonth ? defaultDayOpen : undefined;
                      return (
                        <AccordionItem value={month} key={month} className="border-none">
                          <AccordionTrigger className="text-md font-semibold text-foreground bg-muted/70 hover:bg-muted px-4 py-2 rounded-lg data-[state=open]:rounded-b-none">
                            {new Date(month + '-01T00:00:00Z').toLocaleDateString('en-US', {
                              month: 'long',
                              timeZone: 'UTC',
                            })}
                          </AccordionTrigger>
                          <AccordionContent className="p-4 border border-t-0 rounded-b-lg bg-card">
                            <Accordion type="single" collapsible defaultValue={dayDefault} className="space-y-3">
                              {datesInMonth.map((date) => (
                                <AccordionItem value={date} key={date} className="border-none">
                                  <AccordionTrigger className="text-sm font-semibold text-foreground bg-muted/60 hover:bg-muted px-4 py-2 rounded-lg data-[state=open]:rounded-b-none">
                                    {formatOrdinalDay(Number(date.slice(8, 10)))}
                                  </AccordionTrigger>
                                  <AccordionContent className="p-4 border border-t-0 rounded-b-lg bg-card">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                      {byYMD[year][month][date].map((customer) => (
                                        <CustomerCard key={customer.id} customer={customer} />
                                      ))}
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              ))}
                            </Accordion>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </AccordionContent>
              </AccordionItem>
            );
          })}
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
