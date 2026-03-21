"use server";

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// ── System prompt ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Bạn là UniLink AI, trợ lý tư vấn du học Đài Loan chính thức của nền tảng UniLink.

NHIỆM VỤ CỦA BẠN:
- Tư vấn du học Đài Loan: trường đại học, chương trình học, học bổng, visa, chi phí sinh hoạt
- Hỗ trợ tìm việc làm thêm cho sinh viên quốc tế tại Đài Loan
- Giải thích thủ tục nhập học, yêu cầu hồ sơ, deadline
- Tư vấn chứng chỉ ngôn ngữ: TOCFL (tiếng Trung Đài Loan), IELTS, TOEFL
- Giới thiệu các tính năng của nền tảng UniLink (tìm trường, học bổng, việc làm, AI Matching)

PHẠM VI HOẠT ĐỘNG — CHỈ trả lời các chủ đề:
1. Du học Đài Loan (trường, ngành, học phí, ký túc xá, cuộc sống)
2. Học bổng (MOE, ICDF, học bổng trường, điều kiện, hồ sơ)
3. Visa du học Đài Loan (thủ tục, giấy tờ, thời gian xử lý)
4. TOCFL và học tiếng Trung
5. Việc làm thêm cho sinh viên tại Đài Loan
6. Tính năng và dịch vụ của UniLink
7. So sánh các trường/chương trình trên UniLink

QUAN TRỌNG — PHÁT HIỆN NGOÀI PHẠM VI:
Nếu câu hỏi không liên quan đến bất kỳ chủ đề nào ở trên (ví dụ: chính trị, giải trí, lập trình, thể thao, v.v.), chỉ trả lời đúng một dòng duy nhất:
[OFF_TOPIC]
Không giải thích thêm gì cả.

KIẾN THỨC NỀN TẢNG:
- Đài Loan dùng TOCFL (không phải HSK của Trung Quốc đại lục)
- TOCFL có 6 bậc: A1, A2 (Beginner), B1, B2 (Intermediate), C1, C2 (Advanced)
- Học phí đại học Đài Loan: khoảng 2,000–6,000 USD/năm
- Chi phí sinh hoạt: khoảng 500–800 USD/tháng
- Sinh viên được làm thêm tối đa 20h/tuần, lương tối thiểu ~190 TWD/giờ (~6 USD)
- Học bổng MOE: 15,000 TWD/tháng cho đại học, 20,000 TWD/tháng cho sau đại học
- Học bổng ICDF: toàn phần, gồm học phí + sinh hoạt phí + vé máy bay
- Visa du học (Resident Visa): cần giấy nhập học, sao kê tài chính, hộ chiếu còn hạn
- Hầu hết trường yêu cầu IELTS 5.5+ hoặc TOEFL iBT 60+ cho chương trình tiếng Anh
- Chương trình tiếng Trung thường yêu cầu TOCFL B1 trở lên

PHONG CÁCH:
- Trả lời bằng ngôn ngữ người dùng dùng (Việt/Anh/Trung)
- Thân thiện, chuyên nghiệp, ngắn gọn và có cấu trúc rõ ràng
- Dùng bullet points khi liệt kê
- Kết thúc bằng câu hỏi follow-up để hiểu rõ hơn nhu cầu
- Không bịa thông tin — nếu không chắc, hướng người dùng đến /schools hoặc /scholarships để xem dữ liệu thực tế`;

// ── Response types ────────────────────────────────────────────────────────────
export type ChatResponse =
  | { type: "answer";      reply: string }
  | { type: "off_topic";   suggestions: string[] }
  | { type: "spam";        message: string }
  | { type: "error";       message: string };

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// ── Spam detection ────────────────────────────────────────────────────────────
function detectSpam(text: string): string | null {
  if (text.length < 2)
    return "Tin nhắn quá ngắn.";

  // Lặp ký tự liên tục >20 lần (aaaaaaa...)
  if (/(.)\1{20,}/.test(text))
    return "Tin nhắn chứa nội dung lặp không hợp lệ.";

  // Phải có ít nhất 1 ký tự chữ (Latin, tiếng Việt, tiếng Trung/Nhật/Hàn)
  if (!/[a-zA-Z\u00C0-\u024F\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]/.test(text))
    return "Vui lòng nhập câu hỏi bằng chữ.";

  return null;
}

// ── Main action ───────────────────────────────────────────────────────────────
export async function sendChatMessage(
  messages: ChatMessage[],
  userMessage: string
): Promise<ChatResponse> {
  // 1. Sanitize
  const sanitized = userMessage.trim().slice(0, 2000);
  if (!sanitized) return { type: "spam", message: "Tin nhắn trống." };

  // 2. Spam filter
  const spamReason = detectSpam(sanitized);
  if (spamReason) return { type: "spam", message: spamReason };

  // 3. Duplicate check (same as last user message)
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
  if (lastUserMsg?.content.trim().toLowerCase() === sanitized.toLowerCase())
    return { type: "spam", message: "Bạn vừa gửi tin nhắn này rồi." };

  const apiKey = process.env.GEMINI_API_KEY;
  console.log("[sendChatMessage] apiKey present:", !!apiKey, "| msg:", sanitized.slice(0, 30));
  if (!apiKey)
    return { type: "error", message: "AI service not configured." };

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,       threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 1024,
      },
    });

    // Build history (max 10 turns, skip empty content)
    const history = messages
      .slice(-10)
      .filter((m) => m.content.trim().length > 0)
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(sanitized);
    const reply = result.response.text().trim();

    if (!reply) return { type: "error", message: "AI không phản hồi được. Vui lòng thử lại." };

    // 4. Off-topic signal detection
    if (reply.includes("[OFF_TOPIC]"))
      return {
        type: "off_topic",
        suggestions: [
          "Học bổng du học Đài Loan",
          "Điều kiện nhập học đại học",
          "Thủ tục xin visa du học",
          "Việc làm thêm cho sinh viên",
          "Trình độ TOCFL cần thiết",
          "Chi phí sinh hoạt tại Đài Loan",
        ],
      };

    return { type: "answer", reply };
  } catch (error: any) {
    const msg = error?.message ?? String(error);
    return { type: "error", message: `[DEBUG] ${msg.slice(0, 200)}` };
  }
}
