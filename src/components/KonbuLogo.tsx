import Link from "next/link";
import { Waves } from "lucide-react";

export function KonbuLogo({ size = "default" }: { size?: "default" | "large" }) {
  const iconClass = size === "large" ? "w-10 h-10" : "w-8 h-8";
  const iconInner = size === "large" ? "w-5 h-5" : "w-4 h-4";
  const textClass = size === "large"
    ? "text-xl sm:text-2xl"
    : "text-base";

  return (
    <Link href="/" className="inline-flex items-center gap-2 group">
      <span className={`${iconClass} rounded-lg bg-[#2d6a4f] flex items-center justify-center shadow-sm group-hover:bg-[#1b4332] transition`}>
        <Waves className={`${iconInner} text-white`} />
      </span>
      <span className={`${textClass} font-bold text-gray-900 tracking-tight`}>
        {"コンブスキー".split("").map((char, i) => (
          <span
            key={i}
            className="konbu-wave inline-block"
            style={{ animationDelay: `${i * 0.12}s` }}
          >
            {char}
          </span>
        ))}
      </span>
    </Link>
  );
}
