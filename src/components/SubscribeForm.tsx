"use client";

import { useState } from "react";

export function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("done");
        setMessage(data.message);
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error);
      }
    } catch {
      setStatus("error");
      setMessage("通信エラーが発生しました");
    }
  }

  if (status === "done") {
    return <p className="text-sm text-[#52b788] font-medium">{message}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="メールアドレス"
        required
        className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-[#52b788] focus:ring-1 focus:ring-[#52b788] outline-none"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-lg bg-[#2d6a4f] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#1b4332] transition disabled:opacity-50"
      >
        {status === "loading" ? "..." : "登録する"}
      </button>
      {status === "error" && <p className="text-xs text-red-500 mt-1">{message}</p>}
    </form>
  );
}
