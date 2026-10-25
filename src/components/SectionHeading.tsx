import Link from "next/link";

type Props = {
  label: string;
  title: string;
  description?: string;
  moreHref?: string;
  moreText?: string;
};

export function SectionHeading({ label, title, description, moreHref, moreText = "もっと見る →" }: Props) {
  return (
    <div className="flex items-baseline justify-between mb-6">
      <div>
        <p className="text-[10px] font-bold text-[#52b788] tracking-widest mb-1">{label}</p>
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h2>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      </div>
      {moreHref && (
        <Link href={moreHref} className="text-xs text-[#40916c] font-medium hover:underline shrink-0">
          {moreText}
        </Link>
      )}
    </div>
  );
}
