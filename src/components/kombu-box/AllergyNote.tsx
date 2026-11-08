import Link from "next/link";
import { KOMBU_BOX } from "@/lib/kombu-box";

export function AllergyNote() {
  return (
    <section className="bg-gray-50 border-t border-gray-100">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6">
        <p className="text-xs text-gray-500 leading-relaxed">
          {KOMBU_BOX.allergyBody}<Link href="/contact" className="text-green-700 underline">{KOMBU_BOX.allergyCta}</Link>ください。
        </p>
      </div>
    </section>
  );
}
