import { Metadata } from 'next';
import { Briefcase, TrendingUp, Smile, Award, MapPin, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Tuyển dụng | Fashion Store',
  description: 'Gia nhập đội ngũ Fashion Store để cùng chúng tôi kiến tạo phong cách và xu hướng thời trang mới.',
};

const BENEFITS = [
  {
    icon: Smile,
    title: 'Môi Trường Sáng Tạo',
    description: 'Không gian làm việc cởi mở, khuyến khích những ý tưởng đột phá và phong cách thiết kế cá nhân độc đáo.'
  },
  {
    icon: TrendingUp,
    title: 'Lộ Trình Phát Triển',
    description: 'Chương trình đào tạo chuyên sâu và lộ trình thăng tiến rõ ràng cho từng vị trí.'
  },
  {
    icon: Award,
    title: 'Đãi Ngộ Hấp Dẫn',
    description: 'Mức lương cạnh tranh, thưởng theo doanh số, bảo hiểm đầy đủ và các chuyến du lịch hàng năm.'
  },
  {
    icon: Briefcase,
    title: 'Ưu Đãi Nội Bộ',
    description: 'Hưởng chính sách mua sắm ưu đãi đặc quyền dành riêng cho nhân viên đối với mọi sản phẩm của thương hiệu.'
  }
];

const JOBS = [
  {
    id: 'designer',
    title: 'Nhà Thiết Kế Thời Trang (Fashion Designer)',
    department: 'Thiết kế & Sáng tạo',
    location: 'Hà Nội',
    type: 'Toàn thời gian',
    salary: 'Thỏa thuận',
    description: 'Nghiên cứu xu hướng, phác thảo ý tưởng và thiết kế các dòng sản phẩm thời trang nam mới.'
  },
  {
    id: 'mkt',
    title: 'Chuyên Viên Marketing Kỹ Thuật Số (Digital Marketer)',
    department: 'Truyền thông & Marketing',
    location: 'Hà Nội (Hỗ trợ Hybrid)',
    type: 'Toàn thời gian',
    salary: '12 - 18 triệu',
    description: 'Lập kế hoạch quảng cáo đa kênh (Facebook, Google, TikTok), tối ưu ngân sách và đo lường hiệu quả chiến dịch.'
  },
  {
    id: 'store-manager',
    title: 'Quản Lý Cửa Hàng (Store Manager)',
    department: 'Vận hành Bán lẻ',
    location: 'TP. Hồ Chí Minh',
    type: 'Toàn thời gian',
    salary: '15 - 22 triệu',
    description: 'Chịu trách nhiệm quản lý nhân viên, thúc đẩy doanh số và duy trì hình ảnh tiêu chuẩn của showroom.'
  }
];

export default function CareersPage() {
  return (
    <div className="bg-background min-h-screen font-body text-foreground">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 bg-muted overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#C9A84C_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <span className="text-primary font-semibold tracking-widest text-xs uppercase mb-3 block">Gia nhập đội ngũ</span>
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
            Kiến Tạo Tương Lai<br />Thế Giới <span className="text-primary">Thời Trang</span>
          </h1>
          <p className="text-lg text-foreground/75 max-w-2xl mx-auto leading-relaxed">
            Chúng tôi luôn tìm kiếm những nhân tài đam mê sáng tạo, khao khát phát triển và mong muốn tạo dựng phong cách thời trang nam đẳng cấp.
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24 container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-primary font-semibold tracking-widest text-xs uppercase mb-2 block">Quyền lợi của bạn</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold">Tại Sao Nên Đồng Hành Cùng Chúng Tôi?</h2>
          <div className="w-12 h-1 bg-primary mx-auto mt-4 rounded"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {BENEFITS.map((b, i) => {
            const IconComponent = b.icon;
            return (
              <div key={i} className="flex gap-6 p-6 rounded-2xl border border-border bg-background hover:border-primary/45 transition-colors duration-300">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <IconComponent className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg mb-2">{b.title}</h3>
                  <p className="text-sm text-foreground/70 leading-relaxed">{b.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Openings Section */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-primary font-semibold tracking-widest text-xs uppercase mb-2 block">Cơ hội việc làm</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold">Vị Trí Đang Tuyển Dụng</h2>
            <div className="w-12 h-1 bg-primary mx-auto mt-4 rounded"></div>
          </div>

          <div className="space-y-6">
            {JOBS.map((job) => (
              <div 
                key={job.id} 
                className="bg-background p-6 md:p-8 rounded-2xl border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-3">
                  <span className="inline-block text-xs font-semibold px-3 py-1 bg-muted text-foreground/80 rounded-full border border-border">
                    {job.department}
                  </span>
                  <h3 className="font-display font-bold text-xl md:text-2xl">{job.title}</h3>
                  <p className="text-sm text-foreground/70 max-w-2xl">{job.description}</p>
                  
                  <div className="flex flex-wrap gap-4 text-xs text-foreground/60 pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {job.type}
                    </span>
                    <span className="font-medium text-primary">Lương: {job.salary}</span>
                  </div>
                </div>

                <div className="shrink-0">
                  <a 
                    href={`mailto:tuyendung@fashionstore.vn?subject=Ung tuyen vi tri ${encodeURIComponent(job.title)}`}
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 rounded-lg transition-all duration-300 group shadow-md"
                  >
                    Ứng tuyển ngay
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center text-sm text-foreground/60">
            Không tìm thấy vị trí phù hợp? Hãy gửi CV ứng tuyển tự do tới email{' '}
            <a href="mailto:tuyendung@fashionstore.vn" className="text-primary font-bold hover:underline">
              tuyendung@fashionstore.vn
            </a>
            . Chúng tôi sẽ liên hệ lại khi có cơ hội.
          </div>
        </div>
      </section>
    </div>
  );
}
