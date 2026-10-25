import { Droplets, Cookie, UtensilsCrossed, Salad, Waves, Coffee, FlaskConical, Heart, Gift } from "lucide-react";

/** カテゴリ別アイコンコンポーネント */
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  dashi: Droplets,
  snack: Cookie,
  tsukudani: UtensilsCrossed,
  shiokombu: Salad,
  tororo: Waves,
  kombucha: Coffee,
  seasoning: FlaskConical,
  health: Heart,
  gift: Gift,
};

export function CategoryIcon({ slug, className = "w-4 h-4" }: { slug: string; className?: string }) {
  const Icon = ICON_MAP[slug] || Droplets;
  return <Icon className={className} />;
}
