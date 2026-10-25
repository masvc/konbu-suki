"use client";

import { useState } from "react";

export function ProducerInquiryForm() {
  const [form, setForm] = useState({ companyName: "", contactName: "", email: "", productInfo: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const formEl = e.target as HTMLFormElement;
    const honeypot = (formEl.querySelector('input[name="website"]') as HTMLInputElement)?.value || "";
    try {
      const res = await fetch("/api/producer-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, website: honeypot }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("done");
        setMessage(data.message);
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
    return <p className="text-sm text-[#52b788] font-medium text-center py-8">{message}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <input type="text" placeholder="会社名・屋号" required value={form.companyName}
        onChange={(e) => setForm({ ...form, companyName: e.target.value })}
        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-[#52b788] focus:ring-1 focus:ring-[#52b788] outline-none" />
      <input type="text" placeholder="ご担当者名" required value={form.contactName}
        onChange={(e) => setForm({ ...form, contactName: e.target.value })}
        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-[#52b788] focus:ring-1 focus:ring-[#52b788] outline-none" />
      <input type="email" placeholder="メールアドレス" required value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-[#52b788] focus:ring-1 focus:ring-[#52b788] outline-none" />
      <textarea placeholder="取り扱い商品の概要（任意）" rows={3} value={form.productInfo}
        onChange={(e) => setForm({ ...form, productInfo: e.target.value })}
        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-[#52b788] focus:ring-1 focus:ring-[#52b788] outline-none resize-none" />
      <button type="submit" disabled={status === "loading"}
        className="w-full rounded-lg bg-[#2d6a4f] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#1b4332] transition disabled:opacity-50">
        {status === "loading" ? "送信中..." : "お問い合わせを送信"}
      </button>
      {status === "error" && <p className="text-xs text-red-500">{message}</p>}
    </form>
  );
}
