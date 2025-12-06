"use client";

import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, PencilRuler, Home, Trash2 } from 'lucide-react';
import { getDeletedCustomers } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { Separator } from './ui/separator';
// StoreSwitcher removed
import { useEffect, useState } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useStaff } from '@/context/staff-context';
import type { StoreId } from '@/lib/types';

export function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { staffName, storeId, isHydrated, logout } = useStaff();
  const isTrashPage = pathname === '/trash';
  const [trashCount, setTrashCount] = useState(0);
  const urlStoreRaw = (searchParams.get('store') || '').toUpperCase();
  const initialStore: StoreId = urlStoreRaw === 'PARRAMATTA' ? 'PARRAMATTA' : 'EASTWOOD';
  const currentStore: StoreId = isHydrated
    ? (storeId === 'PARRAMATTA' ? 'PARRAMATTA' : 'EASTWOOD')
    : initialStore;

  useEffect(() => {
    let mounted = true;
    getDeletedCustomers(currentStore)
      .then((list) => { if (mounted) setTrashCount(list.length || 0); })
      .catch(() => {});
    return () => { mounted = false; };
  }, [currentStore]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <div className="flex items-center">
          <Link href={`/?store=${currentStore}`} className="mr-6 flex items-center space-x-2">
            <PencilRuler className="h-6 w-6 text-accent" />
            <span className="font-bold sm:inline-block font-headline text-lg uppercase">
              PHONE MECHANIC
            </span>
          </Link>
        </div>
        
        <div className="flex flex-1 items-center justify-center">
            <span className="font-bold font-headline text-lg uppercase tracking-wide text-accent">
              {currentStore}
            </span>
        </div>

        <div className="flex items-center justify-end space-x-2">
          <nav className="hidden md:flex items-center space-x-4">
            {!isTrashPage && (
              <Link href={`/trash?store=${currentStore}`}>
                <Button variant="outline" className="relative font-bold">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Trash
                  {trashCount > 0 && (
                    <Badge variant="destructive" className="absolute -right-2 -top-2 px-2">
                      {trashCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}
            <span suppressHydrationWarning className="text-sm text-white">
              Staff: {isHydrated ? (staffName || '-') : '-'}
            </span>
            <Button variant="outline" onClick={() => { logout(); router.push('/staff-login'); }}>
              Logout
            </Button>
          </nav>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
                <SheetHeader className="text-left mb-8">
                    <SheetTitle className="sr-only">Navigation</SheetTitle>
                    <Link href={`/?store=${currentStore}`} className="flex items-center space-x-2">
                        <PencilRuler className="h-6 w-6 text-accent" />
                        <span className="font-bold font-headline text-lg uppercase">
                        PHONE MECHANIC
                        </span>
                    </Link>
                </SheetHeader>

                

              <nav className="grid gap-4 text-lg font-medium">
                 <Link
                  href={`/?store=${currentStore}`}
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <Home className="h-5 w-5" />
                  Dashboard
                </Link>
                <Separator />
                <Link
                  href={`/trash?store=${currentStore}`}
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground font-bold"
                >
                  <Trash2 className="h-5 w-5" />
                  Trash
                  {trashCount > 0 && (
                     <Badge variant="destructive" className="text-xs">
                      {trashCount}
                    </Badge>
                  )}
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
