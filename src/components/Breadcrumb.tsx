import Link from "next/link";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

type BreadcrumbItem = { label: string; href?: string };

type Props = {
  items: BreadcrumbItem[];
};

export function Breadcrumb({ items }: Props) {
  const allItems = [{ label: SITE_NAME, href: "/" }, ...items];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: allItems.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `${SITE_URL}${item.href}` } : {}),
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="text-xs text-gray-400 mb-4" aria-label="パンくずリスト">
        {allItems.map((item, i) => (
          <span key={i}>
            {i > 0 && <span className="mx-1.5">/</span>}
            {item.href ? (
              <Link href={item.href} className="hover:text-[#52b788]">{item.label}</Link>
            ) : (
              <span className="text-gray-600">{item.label}</span>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}
