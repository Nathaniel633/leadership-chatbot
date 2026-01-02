"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";


export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput("");

    // 1️⃣ Add user message to UI immediately
    const nextMessages = [...messages, { role: "user", content: userMessage }];
    setMessages(nextMessages);
    setLoading(true);

    // 2️⃣ Call your API route
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: userMessage,
        history: messages, // previous messages only
      }),
    });

    const data = await res.json();

    // 3️⃣ Add assistant response to UI
    setMessages([
      ...nextMessages,
      { role: "assistant", content: data.response ?? "Error" },
    ]);
    setLoading(false);
  }

return (
  <main
    style={{
      minHeight: "100vh",
      backgroundColor: "#f3f4f6", // light gray page background
      padding: "40px",
      fontFamily: "sans-serif",
      color: "#111827", // dark text
    }}
  >
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>
        Leadership Roleplay Coach
      </h1>
      <p style={{ color: "#374151", marginBottom: 24 }}>
        Describe a leadership situation and get strategy + language guidance.
      </p>

      {/* Chat history */}
      <div style={{ marginBottom: 20 }}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              marginBottom: 12,
              padding: 14,
              borderRadius: 12,
              backgroundColor:
                m.role === "user" ? "#dbeafe" : "#ffffff",
              border:
                m.role === "user"
                  ? "1px solid #93c5fd"
                  : "1px solid #e5e7eb",
              color: "#111827",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 4,
                color: "#374151",
              }}
            >
              {m.role === "user" ? "You" : "Coach"}
            </div>
            <ReactMarkdown>{m.content}</ReactMarkdown>
          </div>
        ))}

        {loading && (
          <div
            style={{
              padding: 14,
              borderRadius: 12,
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              color: "#374151",
            }}
          >
            <strong>Coach:</strong> Thinking…
          </div>
        )}
      </div>

      {/* Input */}
      <textarea
        rows={3}
        placeholder="Hi there! Describe a leadership situation you want help with."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
          }
        }}
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 10,
          border: "1px solid #d1d5db",
          backgroundColor: "#ffffff",
          color: "#111827",
          fontSize: 14,
        }}
      />

      <button
        onClick={sendMessage}
        disabled={loading}
        style={{
          marginTop: 10,
          padding: "10px 18px",
          borderRadius: 10,
          border: "none",
          backgroundColor: "#111827",
          color: "#ffffff",
          fontSize: 14,
          cursor: "pointer",
          opacity: loading ? 0.6 : 1,
        }}
      >
        Send
      </button>

      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>
        Press Enter to send • Shift+Enter for a new line
      </div>
    </div>
  </main>
);}
