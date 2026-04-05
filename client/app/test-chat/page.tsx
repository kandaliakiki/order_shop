"use client";

import React, {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

type ChatRole = "user" | "bot" | "system";

interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
}

const API_BASE = "/api/testing";

export default function TestChatPage() {
  const [phoneNumber, setPhoneNumber] = useState("+6281234567890");
  const [isConnected, setIsConnected] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debugJson, setDebugJson] = useState<string | null>(null);

  const threadRef = useRef<HTMLDivElement>(null);

  const scrollThreadToBottom = useCallback(() => {
    const el = threadRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, []);

  useLayoutEffect(() => {
    scrollThreadToBottom();
  }, [messages, isLoading, scrollThreadToBottom]);

  const addMessage = useCallback((role: ChatRole, text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, role, text },
    ]);
  }, []);

  const connect = useCallback(async () => {
    if (!phoneNumber.trim()) return;
    setIsLoading(true);
    setDebugJson(null);
    try {
      const res = await fetch(`${API_BASE}/health`, { method: "GET" });
      const data = await res.json();
      if (data.success) {
        setIsConnected(true);
        addMessage(
          "system",
          "Connected to testing API. Send a message to start.",
        );
      } else {
        addMessage("system", "Health check failed. Is the server on :8080?");
      }
    } catch {
      addMessage(
        "system",
        "Could not reach testing API. Start the server (port 8080) and ensure Next.js rewrites are configured.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [phoneNumber, addMessage]);

  const sendMessage = useCallback(async () => {
    if (!message.trim() || !isConnected) return;

    const text = message.trim();
    addMessage("user", text);
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber,
          message: text,
          debug: true,
        }),
      });

      const data = await response.json();

      if (data.success !== false && data.response != null) {
        addMessage("bot", String(data.response));
        if (data.conversationState) {
          setDebugJson(JSON.stringify(data.conversationState, null, 2));
        }
      } else {
        addMessage("system", `Error: ${data.error || "Unknown error"}`);
      }
    } catch (e) {
      addMessage(
        "system",
        `Send error: ${e instanceof Error ? e.message : String(e)}`,
      );
    } finally {
      setIsLoading(false);
    }
  }, [message, isConnected, phoneNumber, addMessage]);

  const resetConversation = useCallback(async () => {
    if (!phoneNumber.trim()) return;
    setIsLoading(true);
    try {
      const encoded = encodeURIComponent(phoneNumber);
      const res = await fetch(`${API_BASE}/conversation/${encoded}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        addMessage("system", "Conversation reset on server.");
        setDebugJson(null);
      } else {
        addMessage("system", `Reset failed: ${data.error || "unknown"}`);
      }
    } catch (e) {
      addMessage(
        "system",
        `Reset error: ${e instanceof Error ? e.message : String(e)}`,
      );
    } finally {
      setIsLoading(false);
    }
  }, [phoneNumber, addMessage]);

  return (
    <div className="flex h-dvh flex-col bg-zinc-950 text-zinc-100">
      <header className="shrink-0 border-b border-zinc-800 px-4 py-3 md:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              Order flow — test chat
            </h1>
            <p className="text-xs text-zinc-500">
              Same logic as WhatsApp · mock IDs · no Twilio send
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <input
              className="min-w-[10rem] flex-1 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm outline-none focus:border-amber-600 md:max-w-xs"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Session phone"
              aria-label="Test phone session key"
            />
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${isConnected ? "bg-emerald-500" : "bg-zinc-600"}`}
              />
              {isConnected ? "Connected" : "Offline"}
            </div>
            <button
              type="button"
              onClick={connect}
              disabled={isLoading}
              className="rounded-md bg-amber-600 px-3 py-1.5 text-sm font-medium text-zinc-950 hover:bg-amber-500 disabled:opacity-50"
            >
              Connect
            </button>
            <button
              type="button"
              onClick={resetConversation}
              disabled={isLoading || !isConnected}
              className="rounded-md border border-zinc-600 px-3 py-1.5 text-sm hover:bg-zinc-800 disabled:opacity-50"
            >
              Reset
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col lg:flex-row">
        <section className="flex min-h-0 min-w-0 flex-1 flex-col border-zinc-800 lg:border-r">
          <div
            ref={threadRef}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 md:px-6"
            role="log"
            aria-live="polite"
            aria-relevant="additions"
          >
            <ul className="mx-auto flex max-w-3xl flex-col gap-3 text-sm">
              {messages.length === 0 && (
                <li className="text-center text-zinc-500">
                  No messages yet. Connect, then type below.
                </li>
              )}
              {messages.map((m) => (
                <li
                  key={m.id}
                  className={`max-w-[85%] rounded-lg px-3 py-2 ${
                    m.role === "user"
                      ? "self-end bg-amber-900/40 text-amber-50"
                      : m.role === "bot"
                        ? "self-start bg-zinc-800"
                        : "self-center max-w-full bg-zinc-800/50 text-center text-xs italic text-zinc-400"
                  }`}
                >
                  <span className="mb-0.5 block text-[10px] uppercase tracking-wide text-zinc-500">
                    {m.role}
                  </span>
                  <div className="whitespace-pre-wrap break-words">{m.text}</div>
                </li>
              ))}
              {isLoading && (
                <li className="self-start rounded-lg bg-zinc-800/80 px-3 py-2 text-xs text-zinc-400">
                  Thinking…
                </li>
              )}
            </ul>
          </div>

          <div className="shrink-0 border-t border-zinc-800 bg-zinc-900/90 px-4 py-3 md:px-6">
            <div className="mx-auto flex max-w-3xl flex-col gap-2 sm:flex-row sm:items-end">
              <textarea
                className="min-h-[44px] flex-1 resize-y rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-amber-600 sm:min-h-[52px]"
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder='Message… e.g. "chiffon 2" or /reset'
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void sendMessage();
                  }
                }}
                disabled={!isConnected || isLoading}
              />
              <button
                type="button"
                onClick={() => void sendMessage()}
                disabled={isLoading || !isConnected}
                className="h-10 shrink-0 rounded-md bg-zinc-100 px-5 text-sm font-medium text-zinc-950 hover:bg-white disabled:opacity-50 sm:h-[52px]"
              >
                Send
              </button>
            </div>
          </div>
        </section>

        <aside className="flex max-h-[32vh] min-h-0 shrink-0 flex-col border-t border-zinc-800 bg-zinc-900/40 lg:max-h-none lg:w-[min(420px,38vw)] lg:border-t-0">
          <h2 className="shrink-0 border-b border-zinc-800 px-4 py-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
            Debug (last response)
          </h2>
          <pre className="min-h-0 flex-1 overflow-auto p-3 text-xs leading-relaxed text-zinc-300">
            {debugJson || "Send a message with debug to see state."}
          </pre>
        </aside>
      </div>
    </div>
  );
}
