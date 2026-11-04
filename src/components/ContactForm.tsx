"use client";

import { useState } from "react";

const INQUIRY_TYPES = [
  { value: "product", label: "商品掲載リクエスト" },
  { value: "producer", label: "生産者・メーカー掲載" },
  { value: "media", label: "メディア・広告掲載" },
  { value: "other", label: "その他" },
] as const;

export function ContactForm() {
  const [form, setForm] = useState({
    type: "",
    name: "",
    email: "",
    message: "",
    website: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "送信に失敗しました");
        setStatus("error");
        return;
      }
      setStatus("sent");
    } catch {
      setErrorMsg("送信に失敗しました。時間をおいて再度お試しください");
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-6 text-center">
        <p className="text-emerald-800 font-medium">お問い合わせを送信しました</p>
        <p className="text-sm text-emerald-600 mt-1">
          内容を確認の上、担当者よりご連絡いたします。
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          お問い合わせ種別 <span className="text-red-500">*</span>
        </label>
        <select
          required
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-[#2d6a4f] focus:border-[#2d6a4f]"
        >
          <option value="" disabled>選択してください</option>
          {INQUIRY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          お名前 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          maxLength={100}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-[#2d6a4f] focus:border-[#2d6a4f]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          メールアドレス <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          required
          maxLength={254}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-[#2d6a4f] focus:border-[#2d6a4f]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          お問い合わせ内容 <span className="text-red-500">*</span>
        </label>
        <textarea
          required
          maxLength={2000}
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="ご相談内容をお書きください"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-[#2d6a4f] focus:border-[#2d6a4f] resize-y"
        />
      </div>

      <input
        type="text"
        name="website"
        value={form.website}
        onChange={(e) => setForm({ ...form, website: e.target.value })}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-lg bg-[#2d6a4f] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1b4332] disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {status === "sending" ? "送信中..." : "送信する"}
      </button>
    </form>
  );
}
