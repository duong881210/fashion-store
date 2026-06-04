import { Metadata } from 'next';
import { Search, Database, Lock, EyeOff, Info, UserCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Chính sách bảo mật | Fashion Store',
  description: 'Chính sách bảo mật thông tin khách hàng tại Fashion Store. Chúng tôi cam kết bảo vệ dữ liệu cá nhân của bạn.',
};

const SECTIONS = [
  {
    id: 'collection',
    icon: Search,
    title: '1. Thu thập thông tin',
    content: 'Chúng tôi thu thập các thông tin cá nhân mà bạn cung cấp trực tiếp khi đăng ký tài khoản, đặt hàng, gửi yêu cầu hỗ trợ hoặc đăng ký nhận bản tin khuyến mãi. Thông tin này bao gồm: Họ tên, số điện thoại, địa chỉ email, địa chỉ giao hàng và thông tin thanh toán.'
  },
  {
    id: 'usage',
    icon: Database,
    title: '2. Sử dụng thông tin',
    content: 'Fashion Store sử dụng thông tin của bạn cho các mục đích sau:\n- Xử lý và giao các đơn hàng bạn đã đặt thành công.\n- Gửi thông tin cập nhật về đơn hàng hoặc phản hồi các yêu cầu hỗ trợ khách hàng.\n- Gửi các chương trình khuyến mãi, ưu đãi đặc quyền (nếu bạn đồng ý nhận marketing).\n- Tối ưu hóa trải nghiệm mua sắm trên trang web của chúng tôi.'
  },
  {
    id: 'security',
    icon: Lock,
    title: '3. Bảo mật dữ liệu',
    content: 'Chúng tôi áp dụng các biện pháp bảo mật tối tân về kỹ thuật và tổ chức nhằm bảo vệ thông tin cá nhân của bạn khỏi các hành vi truy cập, tiết lộ, thay đổi hoặc hủy hoại trái phép. Mọi thông tin giao dịch thanh toán đều được mã hóa và xử lý thông qua các cổng thanh toán uy tín hàng đầu.'
  },
  {
    id: 'sharing',
    icon: EyeOff,
    title: '4. Chia sẻ với bên thứ ba',
    content: 'Fashion Store cam kết không bán, trao đổi hoặc cho thuê thông tin cá nhân của bạn cho bất kỳ bên thứ ba nào. Chúng tôi chỉ chia sẻ thông tin cần thiết với các đối tác cung cấp dịch vụ đáng tin cậy nhằm phục vụ cho việc vận hành cửa hàng, ví dụ: các đơn vị vận chuyển (GHTK, Viettel Post) để giao nhận hàng, hoặc đối tác thanh toán để đối soát giao dịch.'
  },
  {
    id: 'cookies',
    icon: Info,
    title: '5. Sử dụng Cookies',
    content: 'Chúng tôi sử dụng cookies để nhận diện trình duyệt của bạn và lưu trữ một số cài đặt cá nhân (như giỏ hàng tạm thời). Bạn có thể lựa chọn tắt cookies trong cài đặt trình duyệt của mình, tuy nhiên điều này có thể ảnh hưởng đến việc sử dụng một số tính năng mua sắm tự động của hệ thống.'
  },
  {
    id: 'rights',
    icon: UserCheck,
    title: '6. Quyền lợi của bạn',
    content: 'Bạn có quyền yêu cầu truy cập, sửa đổi hoặc xóa thông tin cá nhân của mình bất kỳ lúc nào bằng cách đăng nhập vào tài khoản cá nhân trên website hoặc liên hệ trực tiếp với bộ phận chăm sóc khách hàng của chúng tôi để được trợ giúp.'
  }
];

export default function PrivacyPage() {
  return (
    <div className="bg-background min-h-screen font-body text-foreground pb-20">
      {/* Header */}
      <section className="relative py-16 bg-muted overflow-hidden border-b border-border">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#C9A84C_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <span className="text-primary font-semibold tracking-widest text-xs uppercase mb-2 block">Quyền riêng tư</span>
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Chính Sách Bảo Mật
          </h1>
          <p className="text-sm md:text-base text-foreground/70 max-w-xl mx-auto">
            Cập nhật lần cuối: 03 tháng 06, 2026. Chúng tôi cam kết bảo mật tuyệt đối thông tin cá nhân của khách hàng.
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
              <h3 className="font-display font-bold text-lg mb-2">Yêu cầu quyền riêng tư của bạn</h3>
              <p className="text-sm text-foreground/75 mb-4">
                Nếu bạn muốn cập nhật thông tin cá nhân hoặc yêu cầu gỡ bỏ tài khoản, vui lòng liên hệ trực tiếp với chúng tôi qua email.
              </p>
              <a 
                href="mailto:privacy@fashionstore.vn" 
                className="inline-block text-primary font-bold text-sm hover:underline"
              >
                privacy@fashionstore.vn
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
