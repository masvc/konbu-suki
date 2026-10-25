import Link from "next/link";

export function KonbuLogo({ size = "default" }: { size?: "default" | "large" }) {
  const textClass = size === "large"
    ? "text-2xl sm:text-3xl"
    : "text-base sm:text-lg";

  return (
    <Link href="/" className="inline-flex items-center gap-2 group">
      <span className="konbu-logo-icon w-8 h-8 rounded-lg bg-[#2d6a4f] flex items-center justify-center text-white text-sm font-bold shadow-sm">
        昆
      </span>
      <span className={`konbu-logo-text ${textClass} font-bold text-gray-900 tracking-tight`}>
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
