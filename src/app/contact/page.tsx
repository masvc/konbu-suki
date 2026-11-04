import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: `お問い合わせ | ${SITE_NAME}`,
  description: "コンブスキーへのお問い合わせ。商品掲載リクエスト、生産者・メーカー掲載、メディア・広告掲載など、お気軽にご連絡ください。",
};

export default function ContactPage() {
  return (
    <main className="flex-1">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8">
        <Breadcrumb items={[{ label: "お問い合わせ" }]} />

        <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-2">お問い合わせ</h1>
        <p className="text-sm text-gray-500 mb-8">
          商品掲載のリクエスト、生産者・メーカー様からの掲載のご相談、メディア・広告掲載のお問い合わせなど、お気軽にご連絡ください。
        </p>

        <ContactForm />
      </div>
    </main>
  );
}
