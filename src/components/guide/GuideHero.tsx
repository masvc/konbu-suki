import Image from "next/image";

/** 記事上部のアイキャッチ。画像が無い記事では何も出さない。 */
export function GuideHero({ src, alt }: { src?: string; alt: string }) {
  if (!src) return null;
  return (
    <div className="relative w-full h-48 sm:h-64 lg:h-80 bg-[#1b4332]">
      <Image src={src} alt={alt} fill className="object-cover opacity-80" priority sizes="100vw" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
    </div>
  );
}
