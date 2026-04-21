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
            Elevating your style with our curated collections of premium fashion and accessories.
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
          <h3 className="font-semibold text-lg mb-4">Shop</h3>
          <ul className="space-y-2 text-sm text-foreground/70">
            <li><Link href="/collections/new" className="hover:text-primary transition-colors">New Arrivals</Link></li>
            <li><Link href="/collections/women" className="hover:text-primary transition-colors">Women</Link></li>
            <li><Link href="/collections/men" className="hover:text-primary transition-colors">Men</Link></li>
            <li><Link href="/collections/accessories" className="hover:text-primary transition-colors">Accessories</Link></li>
            <li><Link href="/sale" className="hover:text-primary transition-colors">Sale</Link></li>
          </ul>
        </div>

        {/* Help */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Help</h3>
          <ul className="space-y-2 text-sm text-foreground/70">
            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
            <li><Link href="/shipping" className="hover:text-primary transition-colors">Shipping & Returns</Link></li>
            <li><Link href="/track-order" className="hover:text-primary transition-colors">Track Order</Link></li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Company</h3>
          <ul className="space-y-2 text-sm text-foreground/70">
            <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
            <li><Link href="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
            <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
          </ul>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center text-sm text-foreground/60">
        <p>&copy; {new Date().getFullYear()} Fashion Store. All rights reserved.</p>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <CreditCard className="h-6 w-6" />
          {/* Add more payment badges here if needed */}
        </div>
      </div>
    </footer>
  );
}
