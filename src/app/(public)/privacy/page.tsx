import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Privacy Policy - UniLink" };

const sections = [
  {
    title: "1. Thông tin chúng tôi thu thập",
    content:
      "Chúng tôi thu thập thông tin bạn cung cấp khi đăng ký (tên, email, quốc tịch), thông tin hồ sơ học tập, lịch sử ứng tuyển và tương tác với nền tảng. Chúng tôi cũng thu thập dữ liệu sử dụng ẩn danh để cải thiện dịch vụ.",
  },
  {
    title: "2. Mục đích sử dụng thông tin",
    content:
      "Thông tin của bạn được dùng để: cung cấp và cải thiện dịch vụ, gợi ý trường học/học bổng phù hợp qua AI Matching, gửi thông báo liên quan đến ứng tuyển, và tuân thủ yêu cầu pháp lý. Chúng tôi không bán thông tin cá nhân.",
  },
  {
    title: "3. Chia sẻ thông tin",
    content:
      "Chúng tôi chỉ chia sẻ thông tin với: (a) trường học/doanh nghiệp khi bạn chủ động nộp đơn; (b) đối tác dịch vụ kỹ thuật (Appwrite, Google) theo hợp đồng bảo mật; (c) cơ quan pháp luật khi được yêu cầu hợp lệ.",
  },
  {
    title: "4. Bảo mật dữ liệu",
    content:
      "Chúng tôi sử dụng mã hóa HTTPS, lưu trữ mật khẩu theo chuẩn bcrypt, và kiểm soát quyền truy cập nghiêm ngặt. Dữ liệu được lưu trên máy chủ của Appwrite Cloud tại Singapore với tiêu chuẩn bảo mật cao.",
  },
  {
    title: "5. Quyền của bạn",
    content:
      "Bạn có quyền: xem và chỉnh sửa thông tin cá nhân, yêu cầu xóa tài khoản, rút lại sự đồng ý cho các thông báo marketing, và nhận bản sao dữ liệu của mình. Liên hệ support@unilink.tw để thực hiện các quyền này.",
  },
  {
    title: "6. Cookie và theo dõi",
    content:
      "UniLink sử dụng cookie cần thiết để duy trì phiên đăng nhập. Chúng tôi không sử dụng cookie theo dõi quảng cáo của bên thứ ba.",
  },
  {
    title: "7. Trẻ em",
    content:
      "Dịch vụ không dành cho người dưới 16 tuổi. Nếu phát hiện chúng tôi vô tình thu thập dữ liệu của trẻ em, chúng tôi sẽ xóa ngay lập tức.",
  },
  {
    title: "8. Liên hệ",
    content:
      "Mọi câu hỏi về quyền riêng tư, liên hệ: privacy@unilink.tw hoặc qua trang Hỗ trợ.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 space-y-10">
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-primary mb-2 opacity-70">Legal</p>
        <h1 className="text-4xl font-black tracking-tighter mb-3">Chính sách Bảo mật</h1>
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
        <Link href="/terms" className="text-primary text-sm hover:underline">
          Xem Điều khoản Dịch vụ →
        </Link>
      </div>
    </div>
  );
}
