'use client';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function WishlistTab({ wishlist }: { wishlist: any[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-1">Your Favourites</h3>
        <p className="text-gray-500 text-sm">Items you've saved for later.</p>
      </div>

      {(!wishlist || wishlist.length === 0) ? (
        <div className="text-center py-16 border-2 border-dashed rounded-xl bg-gray-50 flex flex-col items-center">
          <ShoppingBag className="h-10 w-10 text-gray-300 mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No items saved yet</h4>
          <p className="text-gray-500 mb-6 max-w-sm">
            Start building your wishlist by clicking the heart icon on products you love.
          </p>
          <Button asChild>
            <Link href="/collections/new">Explore Products</Link>
          </Button>
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-xl">
          <p className="text-gray-500">Wishlist products will be displayed here once catalog is built.</p>
        </div>
      )}
    </div>
  );
}
