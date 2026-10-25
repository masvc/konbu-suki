import Link from "next/link";

export function KonbuLogo() {
  return (
    <Link href="/" className="inline-flex items-center group">
      <span className="text-lg font-bold text-gray-900 tracking-tight">
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
