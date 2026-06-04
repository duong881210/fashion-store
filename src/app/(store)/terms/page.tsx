import { Metadata } from 'next';
import { FileText, Shield, UserCheck, CreditCard, RefreshCw, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Điều khoản dịch vụ | Fashion Store',
  description: 'Đọc kỹ các điều khoản dịch vụ và chính sách hoạt động của Fashion Store trước khi mua sắm.',
};

const SECTIONS = [
  {
    id: 'general',
    icon: FileText,
    title: '1. Quy định chung',
    content: 'Chào mừng bạn đến với Fashion Store. Bằng việc truy cập và sử dụng trang web này, bạn đồng ý tuân thủ và bị ràng buộc bởi các điều khoản dịch vụ này. Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, vui lòng ngừng sử dụng dịch vụ của chúng tôi.'
  },
  {
    id: 'intellectual-property',
    icon: Shield,
    title: '2. Quyền sở hữu trí tuệ',
    content: 'Mọi nội dung trên trang web này bao gồm hình ảnh thiết kế, logo, văn bản, giao diện, mã nguồn đều thuộc sở hữu của Fashion Store và được bảo hộ bởi luật sở hữu trí tuệ Việt Nam. Nghiêm cấm mọi hành vi sao chép, phân phối hoặc tự ý sử dụng bất kỳ tài liệu nào khi chưa có sự đồng ý bằng văn bản từ chúng tôi.'
  },
  {
    id: 'account',
    icon: UserCheck,
    title: '3. Tài khoản & Bảo mật',
    content: 'Khi đăng ký tài khoản tại Fashion Store, bạn có trách nhiệm cung cấp thông tin chính xác và cập nhật đầy đủ. Bạn chịu trách nhiệm bảo mật mật khẩu của mình và mọi hoạt động diễn ra dưới tài khoản cá nhân. Hãy thông báo ngay cho chúng tôi nếu phát hiện hành vi truy cập trái phép.'
  },
  {
    id: 'payment',
    icon: CreditCard,
    title: '4. Thanh toán & Mua sắm',
    content: 'Giá sản phẩm được hiển thị trên trang web đã bao gồm thuế GTGT và được niêm yết bằng Việt Nam Đồng (VND). Chúng tôi hỗ trợ nhiều phương thức thanh toán an toàn, bao gồm thanh toán qua thẻ ngân hàng, ví điện tử VNPay/PayOS, hoặc thanh toán khi nhận hàng (COD). Fashion Store cam kết bảo mật mọi thông tin thanh toán của khách hàng.'
  },
  {
    id: 'refunds',
    icon: RefreshCw,
    title: '5. Chính sách Đổi trả & Hoàn tiền',
    content: 'Chúng tôi hỗ trợ đổi trả sản phẩm trong vòng 7 ngày kể từ ngày nhận hàng với điều kiện sản phẩm còn nguyên tag, chưa qua sử dụng và không có dấu hiệu hư hỏng. Quý khách vui lòng tham khảo trang Giao Hàng & Đổi Trả để biết thêm chi tiết về thủ tục hoàn trả.'
  },
  {
    id: 'liability',
    icon: AlertCircle,
    title: '6. Giới hạn trách nhiệm',
    content: 'Fashion Store cố gắng đảm bảo các thông tin trên trang web là chính xác và cập nhật. Tuy nhiên, chúng tôi không chịu trách nhiệm đối với bất kỳ thiệt hại trực tiếp hoặc gián tiếp nào phát sinh từ việc sử dụng trang web hoặc do không thể truy cập dịch vụ vì lý do bất khả kháng (sự cố mạng, lỗi hệ thống).'
  }
];

export default function TermsPage() {
  return (
    <div className="bg-background min-h-screen font-body text-foreground pb-20">
      {/* Header */}
      <section className="relative py-16 bg-muted overflow-hidden border-b border-border">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#C9A84C_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <span className="text-primary font-semibold tracking-widest text-xs uppercase mb-2 block">Pháp lý & Quy định</span>
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Điều Khoản Dịch Vụ
          </h1>
          <p className="text-sm md:text-base text-foreground/70 max-w-xl mx-auto">
            Cập nhật lần cuối: 03 tháng 06, 2026. Vui lòng đọc kỹ các quy định trước khi thực hiện giao dịch mua hàng.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="container mx-auto px-4 mt-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Left Sidebar Table of Contents */}
          <aside className="lg:col-span-1 hidden lg:block sticky top-24 self-start">
            <div className="border border-border rounded-2xl p-6 bg-muted/30">
              <h3 className="font-display font-bold text-lg mb-4 border-b border-border pb-2">Mục lục</h3>
              <ul className="space-y-3 text-sm">
                {SECTIONS.map((sec) => (
                  <li key={sec.id}>
                    <a 
                      href={`#${sec.id}`}
                      className="text-foreground/70 hover:text-primary transition-colors font-medium block py-1"
                    >
                      {sec.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Right Content */}
          <div className="lg:col-span-3 space-y-12">
            {SECTIONS.map((sec) => {
              const Icon = sec.icon;
              return (
                <div 
                  id={sec.id} 
                  key={sec.id} 
                  className="scroll-mt-24 p-6 md:p-8 rounded-2xl border border-border bg-background hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h2 className="font-display text-xl md:text-2xl font-bold">{sec.title}</h2>
                  </div>
                  <p className="text-foreground/80 leading-relaxed text-sm md:text-base whitespace-pre-line">
                    {sec.content}
                  </p>
                </div>
              );
            })}

            {/* Support Box */}
            <div className="p-6 md:p-8 rounded-2xl bg-muted/40 border border-dashed border-border text-center">
              <h3 className="font-display font-bold text-lg mb-2">Bạn có thắc mắc về điều khoản?</h3>
              <p className="text-sm text-foreground/75 mb-4">
                Nếu bạn cần làm rõ bất kỳ điều khoản nào, hãy liên hệ trực tiếp với bộ phận chăm sóc khách hàng của chúng tôi.
              </p>
              <a 
                href="mailto:legal@fashionstore.vn" 
                className="inline-block text-primary font-bold text-sm hover:underline"
              >
                legal@fashionstore.vn
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
