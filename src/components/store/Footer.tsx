import Link from "next/link";
import { CreditCard } from "lucide-react";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-muted text-foreground py-12 md:py-16 mt-auto">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="space-y-4">
          <h2 className="font-display flex text-2xl font-bold tracking-tight">Fashion Store</h2>
          <p className="text-sm text-foreground/70 max-w-xs">
            Nâng tầm phong cách của bạn với bộ sưu tập thời trang và phụ kiện cao cấp của chúng tôi.
          </p>
          <div className="flex space-x-4">
            <Link href="#" className="text-foreground/70 hover:text-primary transition-colors">
              <FaFacebook className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-foreground/70 hover:text-primary transition-colors">
              <FaInstagram className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-foreground/70 hover:text-primary transition-colors">
              <FaTwitter className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Shop */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Cửa Hàng</h3>
          <ul className="space-y-2 text-sm text-foreground/70">
            <li><Link href="/collections/new" className="hover:text-primary transition-colors">Hàng Mới Về</Link></li>
            <li><Link href="/collections/women" className="hover:text-primary transition-colors">Nữ</Link></li>
            <li><Link href="/collections/men" className="hover:text-primary transition-colors">Nam</Link></li>
            <li><Link href="/collections/accessories" className="hover:text-primary transition-colors">Phụ Kiện</Link></li>
            <li><Link href="/sale" className="hover:text-primary transition-colors">Khuyến Mãi</Link></li>
          </ul>
        </div>

        {/* Help */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Trợ Giúp</h3>
          <ul className="space-y-2 text-sm text-foreground/70">
            <li><Link href="/contact" className="hover:text-primary transition-colors">Liên Hệ</Link></li>
            <li><Link href="/faq" className="hover:text-primary transition-colors">Câu Hỏi Thường Gặp</Link></li>
            <li><Link href="/shipping" className="hover:text-primary transition-colors">Giao Hàng & Đổi Trả</Link></li>
            <li><Link href="/track-order" className="hover:text-primary transition-colors">Theo Dõi Đơn Hàng</Link></li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Công Ty</h3>
          <ul className="space-y-2 text-sm text-foreground/70">
            <li><Link href="/about" className="hover:text-primary transition-colors">Về Chúng Tôi</Link></li>
            <li><Link href="/careers" className="hover:text-primary transition-colors">Tuyển Dụng</Link></li>
            <li><Link href="/terms" className="hover:text-primary transition-colors">Điều Khoản Dịch Vụ</Link></li>
            <li><Link href="/privacy" className="hover:text-primary transition-colors">Chính Sách Bảo Mật</Link></li>
          </ul>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center text-sm text-foreground/60">
        <p>&copy; {new Date().getFullYear()} Fashion Store. Đã bảo lưu mọi quyền.</p>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <CreditCard className="h-6 w-6" />
          {/* Add more payment badges here if needed */}
        </div>
      </div>
    </footer>
  );
}
