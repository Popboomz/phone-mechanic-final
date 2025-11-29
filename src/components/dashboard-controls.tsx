
"use client";

import Link from "next/link";
import { Search, PlusCircle, Loader2, Calendar, Wrench } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import type { Customer } from "@/lib/types";
import { getCustomerSuggestions } from "@/lib/actions";
import { getFullLabelPathForRepairItem } from "@/lib/data";
import { formatAUDate } from "@/lib/utils";
import { Card, CardContent } from "./ui/card";
import { Phone } from "lucide-react";
import { useRouter } from 'next/navigation';

type Suggestion = Pick<Customer, 'id' | 'customerName' | 'phoneModel' | 'transactionDate' | 'repairItems'>;

export function DashboardControls({ query: initialQuery }: { query: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (debouncedQuery.length > 1) {
      setIsLoading(true);
      setShowSuggestions(true);
      getCustomerSuggestions(debouncedQuery)
        .then(results => {
          setSuggestions(results);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedQuery]);
  
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      router.push(`/?query=${encodeURIComponent(query)}`);
      setShowSuggestions(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    if(newQuery.length <= 1) {
        setShowSuggestions(false);
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      <div className="relative flex-1" ref={containerRef}>
        <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
            type="search"
            name="query"
            placeholder="Search by name, model, IMEI, date, price, or repair..."
            className="w-full pl-10 bg-card text-base md:text-sm"
            value={query}
            onChange={handleInputChange}
            onFocus={() => query.length > 1 && setShowSuggestions(true)}
            autoComplete="off"
            />
        </form>
        {showSuggestions && (
          <Card className="absolute top-full mt-2 w-full z-10 shadow-lg">
            <CardContent className="p-2">
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : suggestions.length > 0 ? (
                <ul className="space-y-1">
                  {suggestions.map(customer => (
                    <li key={customer.id}>
                      <Link href={`/${customer.id}`} className="block">
                        <Button variant="ghost" className="w-full h-auto justify-start items-start text-left p-2">
                          <div className="space-y-1">
                            <p className="font-semibold">{customer.customerName}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <Phone className="w-3 h-3"/>{customer.phoneModel}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <Calendar className="w-3 h-3"/>{formatAUDate(customer.transactionDate)}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <Wrench className="w-3 h-3"/>{(customer.repairItems || []).map(id => id.startsWith('custom:') ? id.slice(7) : getFullLabelPathForRepairItem(id)).join('; ')}
                            </p>
                          </div>
                        </Button>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-sm text-muted-foreground p-4">No customers found.</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      <Link href="/new" className="flex-shrink-0">
        <Button className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
          <PlusCircle className="mr-2 h-5 w-5" />
          Add New Customer
        </Button>
      </Link>
    </div>
  );
}
