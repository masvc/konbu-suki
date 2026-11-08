import { KOMBU_BOX } from "@/lib/kombu-box";

export function BuyButton({ label = "購入する" }: { label?: string }) {
  if (!KOMBU_BOX.paymentLink) {
    return <p className="text-sm text-green-200">決済リンクを準備中です</p>;
  }
  return (
    <a
      href={KOMBU_BOX.paymentLink}
      className="inline-block rounded-xl bg-white px-8 py-3.5 text-base font-bold text-green-800 hover:bg-green-50 transition shadow-lg"
    >
      {label}
    </a>
  );
}
