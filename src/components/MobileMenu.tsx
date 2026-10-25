"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { X } from "lucide-react";

const NAV_ITEMS = [
  { href: "/search", label: "検索" },
  { href: "/category/dashi", label: "だし昆布" },
  { href: "/category/shiokombu", label: "塩昆布" },
  { href: "/category/snack", label: "おやつ昆布" },
  { href: "/category/tsukudani", label: "佃煮・煮物" },
  { href: "/category/tororo", label: "とろろ昆布" },
  { href: "/category/kombucha", label: "昆布茶" },
  { href: "/category/seasoning", label: "昆布調味料" },
  { href: "/category/health", label: "健康食品" },
  { href: "/category/gift", label: "ギフト昆布" },
  { href: "/guide", label: "昆布ガイド" },
  { href: "/producers", label: "生産者" },
  { href: "/kombu-box", label: "こんぶBOX" },
  { href: "/about", label: "このサイトについて" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") close(); }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  return (
    <>
      <button onClick={() => setOpen(true)} className="p-2 text-gray-600" aria-label="メニューを開く">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {open && (
        <>
          {/* オーバーレイ */}
          <div className="fixed inset-0 bg-black/40 z-50" onClick={close} />
          {/* ドロワー */}
          <nav className="fixed top-0 right-0 bottom-0 w-72 bg-white z-50 shadow-xl overflow-y-auto animate-slide-in">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <span className="text-sm font-bold text-gray-900">メニュー</span>
              <button onClick={close} className="p-1.5 text-gray-400 hover:text-gray-600" aria-label="閉じる">
                <X className="w-5 h-5" />
              </button>
            </div>
            <ul className="py-2">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={close}
                    className="block px-5 py-3 text-sm text-gray-700 hover:bg-[#d8f3dc] hover:text-[#1b4332] transition"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}

      <style jsx global>{`
        @keyframes slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-slide-in { animation: slide-in 0.2s ease-out; }
      `}</style>
    </>
  );
}
