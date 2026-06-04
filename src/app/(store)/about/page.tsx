import { Metadata } from 'next';
import { Sparkles, Heart, ShieldCheck, Leaf } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Về chúng tôi | Fashion Store',
  description: 'Tìm hiểu về câu chuyện thương hiệu, sứ mệnh và giá trị cốt lõi của Fashion Store.',
};

export default function AboutPage() {
  return (
    <div className="bg-background min-h-screen font-body text-foreground">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 bg-muted overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#C9A84C_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <span className="text-primary font-semibold tracking-widest text-xs uppercase mb-3 block">Fashion Store</span>
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
            Nâng Tầm Phong Cách Sống,<br />
            <span className="text-primary">Kiến Tạo Xu Hướng</span> Thời Trang
          </h1>
          <p className="text-lg text-foreground/75 max-w-2xl mx-auto leading-relaxed">
            Chúng tôi tin rằng thời trang không chỉ là những bộ trang phục bạn khoác lên mình, mà còn là bản tuyên ngôn mạnh mẽ nhất về cá tính và phong cách sống của bạn.
          </p>
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="py-16 md:py-24 container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground relative pb-4">
              Câu Chuyện Thương Hiệu
              <span className="absolute bottom-0 left-0 w-16 h-1 bg-primary rounded"></span>
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              Khởi đầu từ niềm đam mê mãnh liệt với thời trang nam thanh lịch và hiện đại, Fashion Store được thành lập với mục tiêu mang lại những trang phục chất lượng cao, đón đầu xu hướng nhưng vẫn giữ nguyên giá trị tối giản, tinh tế.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              Chúng tôi không ngừng tìm kiếm và tuyển chọn những chất liệu vải cao cấp nhất, kết hợp cùng bàn tay khéo léo của các nghệ nhân may mặc để tạo ra các sản phẩm hoàn hảo từ phom dáng đến từng đường kim mũi chỉ. Mỗi sản phẩm tại Fashion Store là sự kết hợp hoàn hảo giữa phong cách đương đại và tính tiện dụng hàng ngày.
            </p>
            <div className="pt-4">
              <Link 
                href="/products" 
                className="inline-flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                Khám phá bộ sưu tập
              </Link>
            </div>
          </div>
          
          <div className="relative group overflow-hidden rounded-2xl aspect-[4/3] shadow-xl border border-border bg-muted flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent"></div>
            <div className="text-center p-8 z-10">
              <span className="font-display text-6xl text-primary/20 font-bold block mb-2">EST. 2026</span>
              <p className="text-sm font-semibold tracking-wider uppercase text-foreground/60">Chất lượng tạo nên sự khác biệt</p>
            </div>
            <div className="absolute bottom-4 left-4 right-4 bg-background/90 backdrop-blur-sm p-4 rounded-xl border border-border">
              <p className="text-xs text-foreground/60 font-medium">BỘ SƯU TẬP CAO CẤP</p>
              <p className="text-sm font-bold text-foreground font-display">Tỉ mỉ đến từng chi tiết nhỏ nhất</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-primary font-semibold tracking-widest text-xs uppercase mb-2 block font-body">Chúng tôi hướng tới</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold">Giá Trị Cốt Lõi</h2>
            <div className="w-12 h-1 bg-primary mx-auto mt-4 rounded"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Value 1 */}
            <div className="bg-background p-8 rounded-2xl border border-border hover:border-primary/50 transition-all duration-300 group hover:shadow-xl hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl mb-3">Chất Lượng Vượt Trội</h3>
              <p className="text-sm text-foreground/75 leading-relaxed">
                Chúng tôi không thỏa hiệp về chất lượng. Toàn bộ sản phẩm được kiểm duyệt nghiêm ngặt từ khâu chọn vải đến hoàn thiện.
              </p>
            </div>

            {/* Value 2 */}
            <div className="bg-background p-8 rounded-2xl border border-border hover:border-primary/50 transition-all duration-300 group hover:shadow-xl hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <Leaf className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl mb-3">Thiết Kế Bền Vững</h3>
              <p className="text-sm text-foreground/75 leading-relaxed">
                Hướng tới xu hướng thời trang xanh và bền vững, ưu tiên sử dụng các chất liệu thân thiện với môi trường.
              </p>
            </div>

            {/* Value 3 */}
            <div className="bg-background p-8 rounded-2xl border border-border hover:border-primary/50 transition-all duration-300 group hover:shadow-xl hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl mb-3">Đón Đầu Xu Hướng</h3>
              <p className="text-sm text-foreground/75 leading-relaxed">
                Sáng tạo không ngừng để mang đến những thiết kế mới nhất, mang đậm dấu ấn hiện đại và thanh lịch.
              </p>
            </div>

            {/* Value 4 */}
            <div className="bg-background p-8 rounded-2xl border border-border hover:border-primary/50 transition-all duration-300 group hover:shadow-xl hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl mb-3">Tận Tâm Phục Vụ</h3>
              <p className="text-sm text-foreground/75 leading-relaxed">
                Đặt khách hàng làm trọng tâm. Hỗ trợ tư vấn tận tình, dịch vụ đổi trả dễ dàng và linh hoạt.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Banner / CTA Section */}
      <section className="py-16 md:py-24 text-center">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">Đồng Hành Cùng Phong Cách Của Bạn</h2>
          <p className="text-foreground/75 mb-8 leading-relaxed">
            Hãy để Fashion Store giúp bạn khẳng định phong cách riêng với những bộ sưu tập được thiết kế dành riêng cho quý ông thời đại mới.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/products" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3.5 rounded-lg transition-colors shadow-md animate-pulse"
              style={{ animationDuration: '3s' }}
            >
              Mua Sắm Ngay
            </Link>
            <Link 
              href="/contact" 
              className="bg-background hover:bg-muted text-foreground border border-border font-semibold px-8 py-3.5 rounded-lg transition-colors"
            >
              Liên Hệ Chúng Tôi
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
