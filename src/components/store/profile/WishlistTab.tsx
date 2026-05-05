'use client';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function WishlistTab({ wishlist }: { wishlist: any[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-1">Danh Sách Yêu Thích Của Bạn</h3>
        <p className="text-gray-500 text-sm">Các mục bạn đã lưu để xem sau.</p>
      </div>

      {(!wishlist || wishlist.length === 0) ? (
        <div className="text-center py-16 border-2 border-dashed rounded-xl bg-gray-50 flex flex-col items-center">
          <ShoppingBag className="h-10 w-10 text-gray-300 mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Chưa có mục nào được lưu</h4>
          <p className="text-gray-500 mb-6 max-w-sm">
            Bắt đầu xây dựng danh sách yêu thích của bạn bằng cách nhấp vào biểu tượng trái tim trên các sản phẩm bạn thích.
          </p>
          <Button asChild>
            <Link href="/collections/new">Khám Phá Sản Phẩm</Link>
          </Button>
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-xl">
          <p className="text-gray-500">Các sản phẩm yêu thích sẽ được hiển thị ở đây sau khi danh mục được xây dựng.</p>
        </div>
      )}
    </div>
  );
}
