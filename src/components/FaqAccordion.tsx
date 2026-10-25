type FaqItem = { q: string; a: string };

type Props = {
  items: FaqItem[];
  withJsonLd?: boolean;
};

export function FaqAccordion({ items, withJsonLd = false }: Props) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <>
      {withJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      <dl className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="rounded-xl border border-gray-100 bg-white overflow-hidden">
            <details className="group">
              <summary className="w-full flex items-start justify-between gap-4 px-4 py-3.5 text-left hover:bg-gray-50 transition cursor-pointer list-none">
                <span className="flex items-start gap-2.5">
                  <span className="text-[#52b788] font-bold text-sm mt-0.5">Q.</span>
                  <span className="font-semibold text-gray-900 text-sm">{item.q}</span>
                </span>
                <svg className="w-4 h-4 text-gray-400 shrink-0 mt-1 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <dd className="px-4 pb-4 pl-10 text-sm text-gray-600 leading-relaxed">{item.a}</dd>
            </details>
          </div>
        ))}
      </dl>
    </>
  );
}
