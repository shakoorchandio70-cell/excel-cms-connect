import { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "assistant"; content: string };

interface AIChatFABProps {
  userRole: "admin" | "technician" | "official";
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-companion`;

const CatiHexIcon = ({ size = 28 }: { size?: number }) => (
  <svg viewBox="0 0 120 120" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
    <path d="M101.6,84 L60,108 L18.4,84 L18.4,36 L60,12 L101.6,36 Z" fill="#00D4FF" stroke="#00D4FF" strokeWidth="2" strokeLinejoin="round"/>
    <line x1="24" y1="60" x2="96" y2="60" stroke="#07090F" strokeWidth="3"/>
    <line x1="60" y1="20" x2="60" y2="100" stroke="#07090F" strokeWidth="3"/>
    <circle cx="60" cy="60" r="11" fill="#07090F"/>
    <circle cx="60" cy="60" r="5" fill="#00D4FF"/>
    <circle cx="24" cy="60" r="5" fill="#07090F"/>
    <circle cx="96" cy="60" r="5" fill="#07090F"/>
    <circle cx="60" cy="20" r="5" fill="#07090F"/>
    <circle cx="60" cy="100" r="5" fill="#07090F"/>
  </svg>
);

async function streamChat({
  messages,
  role,
  onDelta,
  onDone,
  onError,
}: {
  messages: Msg[];
  role: string;
  onDelta: (t: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages, role }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "Request failed" }));
    onError(err.error || "Something went wrong");
    return;
  }

  if (!resp.body) { onError("No response stream"); return; }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });

    let nl: number;
    while ((nl = buf.indexOf("\n")) !== -1) {
      let line = buf.slice(0, nl);
      buf = buf.slice(nl + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") { onDone(); return; }
      try {
        const parsed = JSON.parse(json);
        const c = parsed.choices?.[0]?.delta?.content;
        if (c) onDelta(c);
      } catch {
        buf = line + "\n" + buf;
        break;
      }
    }
  }
  onDone();
}

const AIChatFAB = ({ userRole }: AIChatFABProps) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-dismiss tooltip after 6s
  useEffect(() => {
    const t = setTimeout(() => setShowTooltip(false), 6000);
    return () => clearTimeout(t);
  }, []);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const userMsg: Msg = { role: "user", content: text };
    setMessages((p) => [...p, userMsg]);
    setLoading(true);

    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: [...messages, userMsg],
        role: userRole,
        onDelta: upsert,
        onDone: () => setLoading(false),
        onError: (msg) => {
          setMessages((p) => [...p, { role: "assistant", content: `⚠️ ${msg}` }]);
          setLoading(false);
        },
      });
    } catch {
      setMessages((p) => [...p, { role: "assistant", content: "⚠️ Connection error. Please try again." }]);
      setLoading(false);
    }
  };

  return (
    <>
      {/* Chat Panel */}
      {open && (
        <div
          className="fixed z-[60] flex flex-col overflow-hidden"
          style={{
            bottom: 88,
            right: 24,
            width: 380,
            height: 520,
            maxHeight: "calc(100vh - 120px)",
            maxWidth: "calc(100vw - 32px)",
            background: "#12161F",
            border: "1px solid #1E2535",
            borderRadius: 14,
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 shrink-0"
            style={{ height: 52, background: "#0C1018", borderBottom: "1px solid #1E2535" }}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" style={{ color: "#00D4FF" }} />
              <span className="text-sm font-semibold" style={{ color: "#F1F5F9" }}>AI Assistant</span>
              <span
                className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                style={{ background: "rgba(0,212,255,0.12)", color: "#00D4FF" }}
              >
                AI
              </span>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-white/5 transition-colors">
              <X className="h-4 w-4" style={{ color: "#94A3B8" }} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: "thin" }}>
            {messages.length === 0 && (
              <div className="text-center py-8">
                <CatiHexIcon size={36} />
                <p className="text-sm mt-3" style={{ color: "#94A3B8" }}>
                  Hi! I'm your AI assistant for the CMS. Ask me anything about{" "}
                  {userRole === "admin"
                    ? "managing complaints, assignments, or inventory."
                    : userRole === "technician"
                    ? "resolving complaints or logging materials."
                    : "filing complaints or tracking status."}
                </p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className="max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed"
                  style={{
                    background: m.role === "user" ? "rgba(0,212,255,0.12)" : "#1A202E",
                    color: "#F1F5F9",
                    borderBottomRightRadius: m.role === "user" ? 4 : undefined,
                    borderBottomLeftRadius: m.role === "assistant" ? 4 : undefined,
                  }}
                >
                  {m.role === "assistant" ? (
                    <div className="prose prose-invert prose-sm max-w-none [&_p]:mb-1.5 [&_ul]:mb-1.5 [&_li]:mb-0.5 [&_strong]:text-[#00D4FF]">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            ))}
            {loading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-xl text-sm" style={{ background: "#1A202E", color: "#94A3B8" }}>
                  <span className="animate-pulse">Thinking…</span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="shrink-0 px-3 pb-3 pt-1">
            <div
              className="flex items-center gap-2 rounded-xl px-3"
              style={{ background: "#12161F", border: "1px solid #1E2535" }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
                placeholder="Ask something…"
                className="flex-1 bg-transparent py-2.5 text-sm outline-none"
                style={{ color: "#F1F5F9" }}
                disabled={loading}
              />
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                className="p-1.5 rounded-lg transition-colors disabled:opacity-30"
                style={{ background: "#00D4FF", color: "#07090F" }}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tooltip bubble */}
      {!open && (showTooltip) && (
        <div
          className="fixed z-[60] flex items-center gap-1.5 px-3 py-2 rounded-full cursor-pointer transition-all animate-in fade-in slide-in-from-bottom-2"
          style={{
            bottom: 86,
            right: 24,
            background: "#1A202E",
            border: "1px solid #1E2535",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          }}
          onClick={() => { setOpen(true); setShowTooltip(false); }}
        >
          <span className="text-xs font-medium" style={{ color: "#F1F5F9" }}>Need Help?</span>
          <span
            className="text-[9px] font-bold px-1 py-0.5 rounded"
            style={{ background: "rgba(0,212,255,0.15)", color: "#00D4FF" }}
          >
            AI
          </span>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => { setOpen(!open); setShowTooltip(false); }}
        onMouseEnter={() => !open && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="fixed z-[60] flex items-center justify-center rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          bottom: 24,
          right: 24,
          width: 52,
          height: 52,
          background: open ? "#1A202E" : "#12161F",
          border: "2px solid #00D4FF",
          boxShadow: "0 4px 24px rgba(0,212,255,0.25)",
        }}
      >
        {open ? (
          <X className="h-5 w-5" style={{ color: "#00D4FF" }} />
        ) : (
          <div className="relative">
            <CatiHexIcon size={26} />
            <Sparkles
              className="absolute -top-1 -right-1 h-3 w-3"
              style={{ color: "#00D4FF", filter: "drop-shadow(0 0 3px rgba(0,212,255,0.5))" }}
            />
          </div>
        )}
      </button>
    </>
  );
};

export default AIChatFAB;
