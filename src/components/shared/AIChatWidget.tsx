"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  X, Send, Minimize2, Maximize2, Sparkles,
  RotateCcw, GraduationCap, ShieldAlert, Clock,
} from "lucide-react";
import { sendChatMessage } from "@/lib/appwrite/actions/ai-chat.actions";
import { getSessionStatus } from "@/lib/appwrite/actions/auth.actions";
import Link from "next/link";

const OFF_TOPIC_SUGGESTIONS = [
  "Học bổng du học Đài Loan",
  "Điều kiện nhập học đại học",
  "Thủ tục xin visa du học",
  "Việc làm thêm cho sinh viên",
  "Trình độ TOCFL cần thiết",
  "Chi phí sinh hoạt tại Đài Loan",
];
import ReactMarkdown from "react-markdown";

// ── Rate limit config ─────────────────────────────────────────────────────────
const RATE_LIMIT_MAX  = 8;   // max messages
const RATE_LIMIT_WINDOW = 60; // per N seconds

// ── Types ─────────────────────────────────────────────────────────────────────
type MessageType = "answer" | "off_topic" | "spam" | "error";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  type?: MessageType;
  suggestions?: string[];
  ts: Date;
}

// ── Welcome ───────────────────────────────────────────────────────────────────
const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  type: "answer",
  content: "Xin chào! Tôi là **UniLink AI**, trợ lý tư vấn du học Đài Loan của bạn. 👋\n\nTôi có thể giúp bạn:\n- Tìm trường & ngành học phù hợp\n- Tư vấn học bổng TOCFL\n- Thông tin visa & thủ tục nhập học\n- Cơ hội việc làm cho sinh viên\n\nBạn muốn bắt đầu từ đâu?",
  ts: new Date(),
};

const INITIAL_SUGGESTIONS = [
  "Học bổng nào phù hợp với mình?",
  "Điều kiện nhập học đại học Đài Loan",
  "Visa du học Đài Loan cần gì?",
  "Tìm việc làm thêm cho sinh viên",
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTime(date: Date) {
  return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function ChatMarkdown({ content, isUser }: { content: string; isUser: boolean }) {
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => <p className="mb-1.5 last:mb-0 leading-relaxed">{children}</p>,
        strong: ({ children }) => (
          <strong className={cn("font-semibold", isUser ? "text-white" : "text-foreground")}>
            {children}
          </strong>
        ),
        em: ({ children }) => <em className="italic opacity-90">{children}</em>,
        ul: ({ children }) => <ul className="mt-1 mb-1.5 space-y-1 pl-0.5">{children}</ul>,
        ol: ({ children }) => <ol className="mt-1 mb-1.5 space-y-1 pl-1 list-decimal list-inside">{children}</ol>,
        li: ({ children }) => (
          <li className="flex items-start gap-1.5 text-[13px]">
            {!isUser && <span className="mt-[7px] w-1 h-1 rounded-full bg-primary/60 shrink-0" />}
            <span>{children}</span>
          </li>
        ),
        code: ({ children }) => (
          <code className={cn(
            "px-1.5 py-0.5 rounded text-[12px] font-mono",
            isUser ? "bg-white/20" : "bg-muted border border-border"
          )}>
            {children}
          </code>
        ),
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer"
            className={cn("underline underline-offset-2", isUser ? "text-white/90" : "text-primary")}
          >
            {children}
          </a>
        ),
        h3: ({ children }) => <p className="font-bold text-sm mb-1">{children}</p>,
        h4: ({ children }) => <p className="font-semibold text-sm mb-0.5">{children}</p>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center shrink-0 shadow-sm">
        <Sparkles size={12} className="text-white" />
      </div>
      <div className="bg-muted/80 border border-border/60 rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <span key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce"
              style={{ animationDelay: `${i * 150}ms`, animationDuration: "0.9s" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Off-topic bubble ──────────────────────────────────────────────────────────
function OffTopicBubble({ suggestions, onSelect }: { suggestions: string[]; onSelect: (s: string) => void }) {
  return (
    <div className="flex items-end gap-2">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center shrink-0 shadow-sm">
        <Sparkles size={12} className="text-white" />
      </div>
      <div className="max-w-[260px] space-y-2">
        <div className="bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/50 rounded-2xl rounded-bl-sm px-4 py-3">
          <div className="flex items-start gap-2 mb-2">
            <ShieldAlert size={13} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[13px] text-amber-700 dark:text-amber-400 leading-snug">
              Câu hỏi ngoài phạm vi hỗ trợ. Mình chuyên tư vấn về du học Đài Loan — bạn có muốn hỏi về:
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => onSelect(s)}
                className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary hover:bg-primary/20 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Spam / rate-limit notice ──────────────────────────────────────────────────
function SystemNotice({ content, icon }: { content: string; icon: "shield" | "clock" }) {
  return (
    <div className="flex justify-center">
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/60 border border-border/60">
        {icon === "shield"
          ? <ShieldAlert size={11} className="text-amber-500 shrink-0" />
          : <Clock size={11} className="text-rose-500 shrink-0" />
        }
        <span className="text-[11px] text-muted-foreground">{content}</span>
      </div>
    </div>
  );
}

// ── Auth wall ─────────────────────────────────────────────────────────────────
function AuthWall() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 flex items-center justify-center mb-4">
        <Sparkles size={28} className="text-primary" />
      </div>
      <h3 className="text-base font-bold text-foreground mb-2">Tư vấn AI miễn phí</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-6">
        Đăng nhập để trò chuyện với UniLink AI — tư vấn du học Đài Loan 24/7, miễn phí hoàn toàn.
      </p>
      <div className="w-full space-y-2.5 mb-6">
        {[
          "Tìm trường & học bổng phù hợp",
          "Tư vấn visa & thủ tục nhập học",
          "Cơ hội việc làm cho sinh viên",
        ].map((item) => (
          <div key={item} className="flex items-center gap-2.5 text-sm text-left">
            <div className="w-4 h-4 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
            <span className="text-muted-foreground">{item}</span>
          </div>
        ))}
      </div>
      <Link
        href="/register"
        className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors mb-2"
      >
        <GraduationCap size={15} />
        Tạo tài khoản miễn phí
      </Link>
      <Link
        href="/login"
        className="w-full flex items-center justify-center h-10 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted/60 transition-colors"
      >
        Đã có tài khoản? Đăng nhập
      </Link>
    </div>
  );
}

const STORAGE_KEY = "unilink_chat_history";
const MAX_STORED  = 40; // max messages to persist

function loadMessages(): Message[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [WELCOME];
    const parsed: Message[] = JSON.parse(raw).map((m: any) => ({ ...m, ts: new Date(m.ts) }));
    return parsed.length ? parsed : [WELCOME];
  } catch {
    return [WELCOME];
  }
}

function saveMessages(msgs: Message[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-MAX_STORED)));
  } catch {}
}

// ── Main widget ───────────────────────────────────────────────────────────────
export function AIChatWidget() {
  const [open, setOpen]           = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages]   = useState<Message[]>([WELCOME]);
  const [input, setInput]         = useState("");
  const [isTyping, setIsTyping]   = useState(false);
  const [unread, setUnread]       = useState(0);
  const [rateLimitMsg, setRateLimitMsg] = useState<string | null>(null);
  const [authChecked, setAuthChecked]   = useState(false);
  const [isLoggedIn, setIsLoggedIn]     = useState(false);
  const [hydrated, setHydrated]         = useState(false);

  // Timestamps of sent messages for rate limiting
  const sentTimestamps = useRef<number[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLTextAreaElement>(null);

  // Load from localStorage on mount (client-only)
  useEffect(() => {
    setMessages(loadMessages());
    setHydrated(true);
  }, []);

  // Persist messages to localStorage whenever they change
  useEffect(() => {
    if (hydrated) saveMessages(messages);
  }, [messages, hydrated]);

  // Check auth once on first open
  useEffect(() => {
    if (open && !authChecked) {
      getSessionStatus().then(({ loggedIn }) => {
        setIsLoggedIn(loggedIn);
        setAuthChecked(true);
      });
    }
  }, [open, authChecked]);

  useEffect(() => {
    if (open && !minimized) {
      setUnread(0);
      setRateLimitMsg(null);
      if (isLoggedIn) setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, minimized, isLoggedIn]);

  useEffect(() => {
    if (open && !minimized)
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, open, minimized]);

  const isRateLimited = (): boolean => {
    const now = Date.now();
    const window = RATE_LIMIT_WINDOW * 1000;
    sentTimestamps.current = sentTimestamps.current.filter((t) => now - t < window);
    return sentTimestamps.current.length >= RATE_LIMIT_MAX;
  };

  const handleSend = async (text?: string) => {
    const value = (text ?? input).trim();
    if (!value || isTyping) return;

    // Client-side rate limit
    if (isRateLimited()) {
      setRateLimitMsg(`Bạn đã gửi quá ${RATE_LIMIT_MAX} tin nhắn trong ${RATE_LIMIT_WINDOW}s. Vui lòng chờ.`);
      return;
    }

    setRateLimitMsg(null);
    sentTimestamps.current.push(Date.now());

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      type: "answer",
      content: value,
      ts: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.style.height = "22px";
    }
    setIsTyping(true);

    const history = messages
      .filter((m) => m.id !== "welcome")
      .map((m) => ({ role: m.role, content: m.content }));

    const result = await sendChatMessage(history, value);
    setIsTyping(false);

    if (result.type === "answer") {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        type: "answer",
        content: result.reply,
        ts: new Date(),
      }]);
    } else if (result.type === "off_topic") {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        type: "off_topic",
        content: "",
        suggestions: result.suggestions,
        ts: new Date(),
      }]);
    } else if (result.type === "spam") {
      // Don't add to chat — show inline notice, remove user msg
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        type: "spam",
        content: result.message,
        ts: new Date(),
      }]);
    } else {
      // error
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        type: "error",
        content: result.message,
        ts: new Date(),
      }]);
    }

    if (!open || minimized) setUnread((n) => n + 1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setMessages([WELCOME]);
    setInput("");
    setRateLimitMsg(null);
    sentTimestamps.current = [];
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  };

  return (
    <>
      {/* ── Chat panel ── */}
      <div className={cn(
        "fixed bottom-24 right-5 z-50 w-[370px] transition-all duration-300 origin-bottom-right",
        open && !minimized ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
      )}>
        <div className="flex flex-col rounded-[22px] overflow-hidden shadow-2xl shadow-black/20 border border-border/60 bg-background" style={{ height: "540px" }}>

          {/* Header */}
          <div className="relative flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-primary to-violet-500 shrink-0">
            <div className="relative w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center shadow-inner shrink-0">
              <Sparkles size={16} className="text-white" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white leading-none">UniLink AI</p>
              <p className="text-[11px] text-white/70 mt-0.5 leading-none">Powered by Monstudio</p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={handleReset} title="Cuộc hội thoại mới"
                className="w-7 h-7 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all">
                <RotateCcw size={13} />
              </button>
              <button onClick={() => setMinimized(true)} title="Thu nhỏ"
                className="w-7 h-7 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all">
                <Minimize2 size={13} />
              </button>
              <button onClick={() => { setOpen(false); setMinimized(false); }} title="Đóng"
                className="w-7 h-7 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all">
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Auth wall or messages */}
          {authChecked && !isLoggedIn ? <AuthWall /> : !authChecked && open ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                Đang kiểm tra...
              </div>
            </div>
          ) : (
          <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth">
            {messages.map((msg) => {
              // System notices
              if (msg.type === "spam")
                return <SystemNotice key={msg.id} content={msg.content} icon="shield" />;
              if (msg.type === "error")
                return <SystemNotice key={msg.id} content={msg.content} icon="clock" />;

              // Off-topic
              if (msg.type === "off_topic")
                return <OffTopicBubble key={msg.id} suggestions={msg.suggestions ?? OFF_TOPIC_SUGGESTIONS} onSelect={handleSend} />;

              // Normal message
              return (
                <div key={msg.id} className={cn("flex items-end gap-2", msg.role === "user" && "flex-row-reverse")}>
                  {msg.role === "assistant" ? (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center shrink-0 shadow-sm">
                      <Sparkles size={12} className="text-white" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
                      <GraduationCap size={13} className="text-muted-foreground" />
                    </div>
                  )}
                  <div className={cn("max-w-[260px] space-y-1", msg.role === "user" && "items-end flex flex-col")}>
                    <div className={cn(
                      "px-4 py-2.5 text-sm leading-relaxed",
                      msg.role === "assistant"
                        ? "bg-muted/60 border border-border/60 rounded-2xl rounded-bl-sm text-foreground"
                        : "bg-primary text-white rounded-2xl rounded-br-sm shadow-md shadow-primary/20"
                    )}>
                      <ChatMarkdown content={msg.content} isUser={msg.role === "user"} />
                    </div>
                    <span className="text-[10px] text-muted-foreground/60 px-1">{formatTime(msg.ts)}</span>
                  </div>
                </div>
              );
            })}

            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Initial suggestions */}
          {messages.length === 1 && !isTyping && (
            <div className="px-4 pb-3 flex flex-wrap gap-1.5 shrink-0">
              {INITIAL_SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => handleSend(s)}
                  className="text-[11px] font-medium px-3 py-1.5 rounded-full border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 transition-colors">
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 pb-3 pt-2 border-t border-border/60 shrink-0">
            {rateLimitMsg && (
              <div className="flex items-center gap-1.5 mb-2 px-1">
                <Clock size={11} className="text-rose-500 shrink-0" />
                <p className="text-[11px] text-rose-500">{rateLimitMsg}</p>
              </div>
            )}
            <div className="flex items-end gap-2 bg-muted/50 border border-border rounded-2xl px-3.5 py-2.5 focus-within:border-primary/50 focus-within:bg-background transition-all">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  const val = e.target.value;
                  // Ignore bare newline from Enter key (already handled by onKeyDown)
                  if (val === "\n" || val === "\r\n") return;
                  setInput(val);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Nhập câu hỏi của bạn..."
                rows={1}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 resize-none outline-none max-h-[80px] leading-relaxed"
                style={{ minHeight: "22px" }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "22px";
                  el.style.height = Math.min(el.scrollHeight, 80) + "px";
                }}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-200",
                  input.trim() && !isTyping
                    ? "bg-primary text-white shadow-md shadow-primary/30 hover:scale-110"
                    : "bg-muted text-muted-foreground/50"
                )}
              >
                <Send size={14} />
              </button>
            </div>
            <p className="text-center text-[9px] text-muted-foreground/40 mt-1.5 tracking-wide uppercase">
              UniLink AI · Monstudio
            </p>
          </div>
          </>
          )}
        </div>
      </div>

      {/* ── Minimized bar ── */}
      <div className={cn(
        "fixed bottom-24 right-5 z-50 transition-all duration-300 origin-bottom-right",
        open && minimized ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
      )}>
        <button onClick={() => setMinimized(false)}
          className="flex items-center gap-3 pr-4 pl-3 py-2.5 rounded-2xl bg-gradient-to-r from-primary to-violet-500 text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-200 hover:-translate-y-0.5">
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold leading-none">UniLink AI</p>
            <p className="text-[10px] text-white/70 mt-0.5 leading-none">Đang trực tuyến</p>
          </div>
          <Maximize2 size={13} className="text-white/70 ml-1" />
        </button>
      </div>

      {/* ── FAB ── */}
      <div className="fixed bottom-5 right-5 z-50">
        {!open && (
          <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" style={{ animationDuration: "2.5s" }} />
        )}
        <button
          onClick={() => { open ? (setOpen(false), setMinimized(false)) : (setOpen(true), setMinimized(false), setUnread(0)); }}
          aria-label="Mở chat với UniLink AI"
          className={cn(
            "relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300",
            open
              ? "bg-muted border border-border text-muted-foreground hover:bg-muted/80"
              : "bg-gradient-to-br from-primary to-violet-500 text-white shadow-primary/40 hover:shadow-xl hover:shadow-primary/50 hover:scale-110"
          )}
        >
          {open ? <X size={22} /> : <Sparkles size={22} />}
          {!open && unread > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md">
              {unread}
            </span>
          )}
        </button>
      </div>
    </>
  );
}
