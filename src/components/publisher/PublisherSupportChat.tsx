"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Msg = { id: string; body: string; sender: string; created_at: string };

export default function PublisherSupportChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const scrollToEnd = () => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/publisher/support-messages", { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not load messages");
        return;
      }
      setMessages(Array.isArray(data.messages) ? data.messages : []);
      if (typeof data.error === "string" && data.messages?.length === 0) {
        setError(data.error);
      }
    } catch {
      setError("Could not load messages");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      void load();
    }
  }, [open, load]);

  useEffect(() => {
    if (open) scrollToEnd();
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/publisher/support-messages", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Send failed");
        return;
      }
      if (data.message) {
        setMessages((m) => [...m, data.message as Msg]);
        setInput("");
      }
    } catch {
      setError("Send failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-2xl shadow-lg shadow-indigo-900/40 transition hover:from-indigo-500 hover:to-violet-500 md:bottom-8 md:right-8"
        aria-expanded={open}
        aria-label={open ? "Close support chat" : "Open support chat"}
      >
        {open ? "✕" : "💬"}
      </button>

      {open && (
        <div
          className="fixed bottom-24 right-5 z-50 flex w-[min(100vw-2.5rem,380px)] flex-col rounded-2xl border border-white/15 bg-zinc-900/95 shadow-2xl shadow-black/50 backdrop-blur-md md:bottom-28 md:right-8"
          style={{ maxHeight: "min(70vh, 520px)" }}
        >
          <div className="border-b border-white/10 px-4 py-3">
            <p className="text-sm font-semibold text-white">Publisher support</p>
            <p className="mt-0.5 text-xs text-zinc-500">We reply on business days. You can also use the contact page.</p>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
            {loading && <p className="text-center text-sm text-zinc-500">Loading…</p>}
            {error && !loading && (
              <p className="rounded-lg bg-amber-500/10 px-2 py-2 text-xs text-amber-200/90" role="alert">
                {error}
              </p>
            )}
            <ul className="space-y-3">
              {messages.map((m) => {
                const mine = m.sender === "publisher";
                return (
                  <li key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                        mine
                          ? "rounded-br-md bg-indigo-600 text-white"
                          : "rounded-bl-md border border-white/10 bg-zinc-800 text-zinc-200"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{m.body}</p>
                      <p className={`mt-1 text-[10px] ${mine ? "text-indigo-200/80" : "text-zinc-500"}`}>
                        {mine ? "You" : "LinkHexa"} · {new Date(m.created_at).toLocaleString()}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div ref={endRef} />
          </div>
          <div className="border-t border-white/10 p-3">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                placeholder="Type a message…"
                rows={2}
                className="min-h-[44px] flex-1 resize-none rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
              />
              <button
                type="button"
                onClick={() => void send()}
                disabled={sending || !input.trim()}
                className="shrink-0 self-end rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-40"
              >
                {sending ? "…" : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
