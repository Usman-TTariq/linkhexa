"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Thread = { publisherId: string; lastMessage: string; lastAt: string; lastSender: string };
type Msg = { id: string; body: string; sender: string; created_at: string; publisher_id?: string };

export default function AdminSupportContent() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadThreads = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/support-messages", { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Failed to load");
        return;
      }
      setThreads(Array.isArray(data.threads) ? data.threads : []);
    } catch {
      setError("Request failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadThreads();
  }, []);

  const openThread = async (publisherId: string) => {
    setSelected(publisherId);
    setLoadingThread(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/support-messages?publisherId=${encodeURIComponent(publisherId)}`, {
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Failed to load thread");
        return;
      }
      setMessages(Array.isArray(data.messages) ? data.messages : []);
    } catch {
      setError("Request failed");
    } finally {
      setLoadingThread(false);
    }
  };

  const sendReply = async () => {
    if (!selected || !reply.trim() || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/support-messages", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publisherId: selected, body: reply.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Send failed");
        return;
      }
      if (data.message) {
        setMessages((m) => [...m, data.message as Msg]);
        setReply("");
        void loadThreads();
      }
    } catch {
      setError("Send failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <h1
        className="text-2xl font-bold text-white"
        style={{ fontFamily: "var(--font-libre-baskerville), serif" }}
      >
        Support inbox
      </h1>
      <p className="mt-2 text-sm text-zinc-400">
        Publisher messages from the dashboard chat. Replies appear in their thread.
      </p>

      {error && (
        <p className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="rounded-xl border border-white/10 bg-zinc-900/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Publishers</p>
          {loading ? (
            <p className="mt-4 text-sm text-zinc-500">Loading…</p>
          ) : threads.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">No messages yet.</p>
          ) : (
            <ul className="mt-3 max-h-[60vh] space-y-1 overflow-y-auto">
              {threads.map((t) => (
                <li key={t.publisherId}>
                  <button
                    type="button"
                    onClick={() => void openThread(t.publisherId)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                      selected === t.publisherId ? "bg-teal-600 text-white" : "text-zinc-300 hover:bg-white/5"
                    }`}
                  >
                    <span className="block truncate font-mono text-xs">{t.publisherId.slice(0, 8)}…</span>
                    <span className="mt-0.5 block truncate text-xs opacity-80">{t.lastMessage.slice(0, 60)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-zinc-900/80 p-4">
          {!selected ? (
            <p className="text-sm text-zinc-500">Select a publisher to view the conversation.</p>
          ) : loadingThread ? (
            <p className="text-sm text-zinc-500">Loading thread…</p>
          ) : (
            <>
              <p className="text-xs font-mono text-zinc-500">{selected}</p>
              <ul className="mt-4 max-h-[min(50vh,400px)] space-y-3 overflow-y-auto">
                {messages.map((m) => {
                  const staff = m.sender === "staff";
                  return (
                    <li key={m.id} className={`flex ${staff ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm ${
                          staff
                            ? "rounded-br-md bg-teal-700 text-white"
                            : "rounded-bl-md border border-white/10 bg-zinc-800 text-zinc-200"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{m.body}</p>
                        <p className={`mt-1 text-[10px] ${staff ? "text-teal-200/80" : "text-zinc-500"}`}>
                          {staff ? "Staff" : "Publisher"} · {new Date(m.created_at).toLocaleString()}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-4 flex gap-2 border-t border-white/10 pt-4">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Staff reply…"
                  rows={2}
                  className="min-h-[44px] flex-1 resize-none rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white"
                />
                <button
                  type="button"
                  onClick={() => void sendReply()}
                  disabled={sending || !reply.trim()}
                  className="self-end rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
                >
                  {sending ? "…" : "Send"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <p className="mt-10 text-sm text-zinc-500">
        <Link href="/admin" className="text-teal-400 hover:underline">
          Dashboard
        </Link>
      </p>
    </>
  );
}
