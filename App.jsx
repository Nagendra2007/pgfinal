import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

const API_ENDPOINT = "/api/ai";

export default function AIMessenger() {
  const [messages, setMessages] = useState([
    { id: 1, role: "system", text: "You are a helpful assistant.", meta: "system" },
    { id: 2, role: "assistant", text: "Hi — I am your AI. Ask me anything!", meta: "assistant" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const nextIdRef = useRef(3);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  async function sendMessage(e) {
    e?.preventDefault();
    const text = input.trim();
    if (!text) return;

    const userMsg = { id: nextIdRef.current++, role: "user", text, meta: "user" };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    setError(null);

    const placeholder = { id: nextIdRef.current++, role: "assistant", text: "", meta: "assistant", pending: true };
    setMessages((m) => [...m, placeholder]);

    try {
      const resp = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages.filter(x => x.role !== "system").map(({ role, text }) => ({ role, content: text })),
            { role: "user", content: text },
          ],
        }),
      });

      if (!resp.ok) {
        const textBody = await resp.text();
        throw new Error(`API error: ${resp.status} ${textBody}`);
      }

      const data = await resp.json();
      const replyText = data?.reply ?? "(no reply)";

      setMessages((m) => m.map((msg) => (msg.pending ? { ...msg, pending: false, text: replyText } : msg)));
    } catch (err) {
      console.error(err);
      setError(err.message ?? "Unknown error");
      setMessages((m) => m.map((msg) => (msg.pending ? { ...msg, pending: false, text: "Error: failed to get reply" } : msg)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl shadow-2xl rounded-2xl bg-white flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold">AI</div>
            <div>
              <div className="font-semibold">AI Messenger</div>
              <div className="text-xs text-gray-500">Frontend-only demo (requires backend for real AI)</div>
            </div>
          </div>
          <div className="text-sm text-gray-500">Status: {loading ? "Typing…" : "Idle"}</div>
        </div>

        <div ref={containerRef} className="flex-1 overflow-auto p-6 space-y-4">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-xl p-3 shadow ${m.role === "user" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-900"}`}>
                {m.pending ? (
                  <TypingDots />
                ) : (
                  <ReactMarkdown>{m.text}</ReactMarkdown>
                )}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={sendMessage} className="border-t px-4 py-3 flex gap-3 items-center">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-white border rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-300"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded-full disabled:opacity-50"
          >
            Send
          </button>
        </form>

        {error && <div className="px-4 py-2 text-sm text-red-600">{error}</div>}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full animate-bounce bg-gray-400" />
      <div className="w-2 h-2 rounded-full animate-bounce bg-gray-400" style={{ animationDelay: "0.1s" }} />
      <div className="w-2 h-2 rounded-full animate-bounce bg-gray-400" style={{ animationDelay: "0.2s" }} />
    </div>
  );
}
