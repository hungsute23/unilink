import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Terms of Service - UniLink" };

const sections = [
  {
    title: "1. Chấp nhận điều khoản",
    content:
      "Bằng cách truy cập và sử dụng UniLink, bạn đồng ý tuân thủ và bị ràng buộc bởi các Điều khoản Dịch vụ này. Nếu bạn không đồng ý với bất kỳ phần nào, vui lòng không sử dụng dịch vụ.",
  },
  {
    title: "2. Mô tả dịch vụ",
    content:
      "UniLink là nền tảng kết nối sinh viên quốc tế với các trường đại học, học bổng và cơ hội việc làm tại Đài Loan. Chúng tôi cung cấp thông tin, công cụ tìm kiếm và hỗ trợ quy trình ứng tuyển.",
  },
  {
    title: "3. Tài khoản người dùng",
    content:
      "Bạn chịu trách nhiệm bảo mật thông tin tài khoản và mật khẩu. Hãy thông báo ngay cho chúng tôi nếu phát hiện bất kỳ hành vi sử dụng trái phép nào. UniLink không chịu trách nhiệm về tổn thất do bạn không bảo mật thông tin đăng nhập.",
  },
  {
    title: "4. Quyền sở hữu trí tuệ",
    content:
      "Tất cả nội dung trên UniLink — bao gồm văn bản, hình ảnh, logo và giao diện — là tài sản của UniLink hoặc đối tác được cấp phép. Nghiêm cấm sao chép, phân phối hoặc sử dụng thương mại khi chưa được phép bằng văn bản.",
  },
  {
    title: "5. Nội dung người dùng",
    content:
      "Bạn sở hữu nội dung mình đăng tải nhưng cấp cho UniLink giấy phép không độc quyền để hiển thị và phân phối nội dung đó trên nền tảng. Chúng tôi có quyền xóa nội dung vi phạm chính sách mà không cần thông báo trước.",
  },
  {
    title: "6. Giới hạn trách nhiệm",
    content:
      "UniLink không đảm bảo tính chính xác tuyệt đối của thông tin trường học, học bổng hay việc làm. Chúng tôi không chịu trách nhiệm về quyết định của người dùng dựa trên thông tin trên nền tảng. Hãy xác minh trực tiếp với tổ chức trước khi ứng tuyển.",
  },
  {
    title: "7. Thay đổi điều khoản",
    content:
      "UniLink có thể cập nhật các điều khoản này. Thay đổi quan trọng sẽ được thông báo qua email hoặc thông báo trong ứng dụng ít nhất 7 ngày trước khi có hiệu lực.",
  },
  {
    title: "8. Liên hệ",
    content: "Mọi câu hỏi về Điều khoản Dịch vụ, vui lòng liên hệ: support@unilink.tw",
  },
];

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 space-y-10">
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-primary mb-2 opacity-70">Legal</p>
        <h1 className="text-4xl font-black tracking-tighter mb-3">Điều khoản Dịch vụ</h1>
        <p className="text-muted-foreground">Cập nhật lần cuối: Tháng 3, 2026</p>
      </div>

      <div className="space-y-8">
        {sections.map((s) => (
          <div key={s.title} className="space-y-2">
            <h2 className="text-lg font-black">{s.title}</h2>
            <p className="text-muted-foreground leading-relaxed text-sm">{s.content}</p>
          </div>
        ))}
      </div>

      <div className="pt-6 border-t border-border">
        <Link href="/privacy" className="text-primary text-sm hover:underline">
          Xem Chính sách Bảo mật →
        </Link>
      </div>
    </div>
  );
}
