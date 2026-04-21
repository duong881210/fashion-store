'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import Link from 'next/link';

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px]">
        <SheetHeader>
          <SheetTitle className="text-left font-display text-2xl">Fashion Store</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 mt-8">
          <Link href="/collections/new" onClick={() => setOpen(false)} className="text-lg font-medium">New Arrivals</Link>
          <Link href="/collections/women" onClick={() => setOpen(false)} className="text-lg font-medium">Women</Link>
          <Link href="/collections/men" onClick={() => setOpen(false)} className="text-lg font-medium">Men</Link>
          <Link href="/collections/accessories" onClick={() => setOpen(false)} className="text-lg font-medium">Accessories</Link>
          <Link href="/sale" onClick={() => setOpen(false)} className="text-lg font-medium text-primary">Sale</Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
