import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger, SheetHeader } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, PencilRuler, Home, Trash2 } from 'lucide-react';
import { getDeletedCustomers } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { SydneyTime } from './sydney-time';
import { Separator } from './ui/separator';

export async function Header() {
  const deletedCustomers = await getDeletedCustomers();
  const trashCount = deletedCustomers.length;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <PencilRuler className="h-6 w-6 text-accent" />
            <span className="font-bold sm:inline-block font-headline text-lg uppercase">
              PHONE MECHANIC
            </span>
          </Link>
        </div>
        
        <div className="hidden md:flex flex-1 items-center justify-center">
            <SydneyTime />
        </div>

        <div className="flex items-center justify-end space-x-2">
          <nav className="hidden md:flex items-center space-x-4">
            <Link href="/trash">
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
                    <Link href="/" className="flex items-center space-x-2">
                        <PencilRuler className="h-6 w-6 text-accent" />
                        <span className="font-bold font-headline text-lg uppercase">
                        PHONE MECHANIC
                        </span>
                    </Link>
                </SheetHeader>

                <div className="mb-8 flex justify-center">
                    <SydneyTime />
                </div>

              <nav className="grid gap-4 text-lg font-medium">
                 <Link
                  href="/"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <Home className="h-5 w-5" />
                  Dashboard
                </Link>
                <Separator />
                <Link
                  href="/trash"
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