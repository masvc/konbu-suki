import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import "dotenv/config";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const products = [
  // === だし昆布 ===
  { name: "天然 利尻昆布 1等検 200g", brand: "道南伝統食品", category: "dashi", subcategory: "rishiri", price: 3980, origin: "北海道 利尻", description: "京都の料亭御用達。透明で上品な旨みのだし。お吸い物・湯豆腐に最適。", tags: "天然,高級,料亭", isFeatured: true, rating: 4.7 },
  { name: "天然 羅臼昆布 300g", brand: "築地仲卸 伏高", category: "dashi", subcategory: "rausu", price: 4500, origin: "北海道 羅臼", description: "昆布の王様。濃厚で旨みが強く、だしの味わいが深い。煮物・鍋に。", tags: "天然,昆布の王様", isFeatured: true, rating: 4.8 },
  { name: "日高昆布 天然 300g", brand: "カネキ近藤昆布", category: "dashi", subcategory: "hidaka", price: 1280, origin: "北海道 日高", description: "煮物にもだしにも使える万能昆布。柔らかく調理しやすい。家庭用に最適。", tags: "万能,煮物向き", isFeatured: true, rating: 4.5 },
  { name: "真昆布 天然 1等 200g", brand: "奥井海生堂", category: "dashi", subcategory: "makombu", price: 3200, origin: "北海道 函館", description: "大阪の昆布文化を支える真昆布。上品な甘みのだしが特徴。", tags: "天然,大阪,上品", isFeatured: true, rating: 4.6 },
  { name: "がごめ昆布 刻み 100g", brand: "ヤマト食品", category: "dashi", subcategory: "gagome", price: 980, origin: "北海道 函館", description: "フコイダンが豊富ながごめ昆布。納豆のような粘りが特徴。", tags: "フコイダン,健康,粘り", rating: 4.4 },
  { name: "長昆布 500g 業務用", brand: "北海道ぎょれん", category: "dashi", subcategory: "nagakombu", price: 1500, origin: "北海道 釧路", description: "昆布巻き・煮物に最適な長昆布。リーズナブルで使い勝手が良い。", tags: "業務用,昆布巻き", rating: 4.3 },
  { name: "利尻昆布 蔵囲い 3年熟成 150g", brand: "奥井海生堂", category: "dashi", subcategory: "rishiri", price: 5800, origin: "北海道 利尻", description: "蔵で3年間熟成させた極上の利尻昆布。まろやかで深い旨み。", tags: "熟成,極上,蔵囲い", isFeatured: true, rating: 4.9 },

  // === 塩昆布 ===
  { name: "ふじっ子 塩こんぶ 60g", brand: "フジッコ", category: "shiokombu", price: 198, origin: "北海道", description: "日本一売れている塩昆布。ごはんのお供、パスタ、おにぎりに。", tags: "定番,万能", isFeatured: true, rating: 4.5 },
  { name: "くらこん 塩こん部長 28g", brand: "くらこん", category: "shiokombu", price: 148, origin: "北海道", description: "手軽に使えるミニパック。お弁当やサラダのトッピングに。", tags: "ミニパック,お弁当向き", rating: 4.3 },
  { name: "小倉屋山本 えびすめ 60g", brand: "小倉屋山本", category: "shiokombu", price: 648, origin: "大阪", description: "大阪の老舗昆布屋の最高級塩昆布。肉厚で旨みが凝縮。贈答品としても人気。", tags: "高級,老舗,贈答", isFeatured: true, rating: 4.7 },
  { name: "松前屋 料亭の塩昆布 80g", brand: "松前屋", category: "shiokombu", price: 540, origin: "大阪", description: "料亭の味をご家庭で。厳選した昆布を使った上品な塩昆布。", tags: "料亭,上品", rating: 4.6 },
  { name: "くらこん 無添加減塩塩こんぶ 32g", brand: "くらこん", category: "shiokombu", price: 178, origin: "北海道", description: "化学調味料無添加、塩分30%カット。健康志向の塩昆布。", tags: "無添加,減塩,健康", rating: 4.4 },

  // === 食べる昆布（おやつ） ===
  { name: "都こんぶ", brand: "中野物産", category: "snack", price: 108, description: "昭和から愛される昆布のおやつ。酢昆布の定番。子供にも大人にも人気。", tags: "定番,おやつ,酢昆布", isFeatured: true, rating: 4.4 },
  { name: "おしゃぶり昆布 梅 12g", brand: "中野物産", category: "snack", price: 148, description: "梅味の昆布おやつ。噛むほどに旨みが広がる。ダイエットおやつにも。", tags: "梅味,ダイエット", rating: 4.3 },
  { name: "北海道産 おやつ昆布 100g", brand: "前島食品", category: "snack", price: 480, origin: "北海道", description: "北海道産昆布100%のおやつ昆布。無添加で安心。おつまみにも。", tags: "無添加,おつまみ", rating: 4.5 },
  { name: "酢昆布 北海道産 50g", brand: "上田昆布", category: "snack", price: 320, origin: "北海道", description: "昔ながらの酢昆布。噛めば噛むほど味わい深い。", tags: "酢昆布,昔ながら", rating: 4.2 },
  { name: "梅こんぶ茶 おやつ 個包装 30個", brand: "不二食品", category: "snack", price: 580, description: "梅昆布茶のおやつバージョン。個包装で配りやすい。", tags: "個包装,梅味", rating: 4.1 },

  // === 佃煮・煮物 ===
  { name: "昆布の佃煮 しそ昆布 150g", brand: "小倉屋山本", category: "tsukudani", price: 540, origin: "大阪", description: "しその香り広がる上品な昆布佃煮。ごはんが止まらない。", tags: "しそ,老舗", isFeatured: true, rating: 4.6 },
  { name: "松前漬け 500g", brand: "函館竹田", category: "tsukudani", price: 1280, origin: "北海道 函館", description: "昆布とスルメイカの松前漬け。北海道の郷土料理。お酒のお供に。", tags: "松前漬け,郷土料理", rating: 4.5 },
  { name: "昆布巻き にしん 3本入", brand: "北海道ぎょれん", category: "tsukudani", price: 980, origin: "北海道", description: "にしんを日高昆布で巻いた郷土料理。お正月やお祝いに。", tags: "にしん,お正月", rating: 4.4 },
  { name: "角切り昆布 佃煮 100g", brand: "くらこん", category: "tsukudani", price: 298, description: "食べやすい角切りの昆布佃煮。お弁当のおかずに最適。", tags: "角切り,お弁当", rating: 4.3 },

  // === とろろ昆布 ===
  { name: "富山名産 とろろ昆布 40g", brand: "四十物昆布", category: "tororo", price: 380, origin: "富山", description: "富山伝統のとろろ昆布。お吸い物やおにぎりに。職人手削り。", tags: "手削り,富山名産", isFeatured: true, rating: 4.6 },
  { name: "おぼろ昆布 30g", brand: "敦賀昆布", category: "tororo", price: 540, origin: "福井 敦賀", description: "昆布を一枚一枚手作業で削ったおぼろ昆布。上品な口当たり。", tags: "手削り,おぼろ", rating: 4.5 },
  { name: "とろろ昆布 北海道産 80g", brand: "くらこん", category: "tororo", price: 298, description: "手軽に使えるとろろ昆布。味噌汁やうどんのトッピングに。", tags: "手軽,トッピング", rating: 4.3 },
  { name: "黒とろろ昆布 60g", brand: "道南伝統食品", category: "tororo", price: 420, origin: "北海道", description: "真昆布の外側を使った黒とろろ。旨みが濃厚。", tags: "濃厚,真昆布", rating: 4.4 },

  // === 昆布茶 ===
  { name: "玉露園 こんぶ茶 48g (2g×24袋)", brand: "玉露園", category: "kombucha", price: 398, description: "日本で最も親しまれている昆布茶。料理の隠し味にも。", tags: "定番,隠し味", isFeatured: true, rating: 4.5 },
  { name: "不二の昆布茶 1kg 業務用", brand: "不二食品", category: "kombucha", price: 1980, description: "業務用の昆布茶。パスタや炒め物の味付けに大活躍。", tags: "業務用,調味料", rating: 4.6 },
  { name: "梅こぶ茶 50g", brand: "玉露園", category: "kombucha", price: 378, description: "梅の酸味と昆布の旨みが絶妙。リフレッシュしたい時に。", tags: "梅味,リフレッシュ", rating: 4.4 },
  { name: "根昆布茶 100g", brand: "日東食品工業", category: "kombucha", price: 648, description: "根昆布から作った栄養豊富な昆布茶。健康維持に。", tags: "根昆布,栄養豊富", rating: 4.3 },

  // === 昆布調味料 ===
  { name: "リケン 素材力だし こんぶだし 28g", brand: "理研ビタミン", category: "seasoning", price: 198, description: "化学調味料無添加の昆布だしの素。和食の基本。", tags: "無添加,だしの素", isFeatured: true, rating: 4.5 },
  { name: "ヤマサ 昆布つゆ 1L", brand: "ヤマサ醤油", category: "seasoning", price: 398, description: "北海道産昆布のだしが効いた万能つゆ。煮物・鍋・うどんに。", tags: "万能つゆ,北海道産", rating: 4.4 },
  { name: "昆布ポン酢 360ml", brand: "ヤマサ醤油", category: "seasoning", price: 298, description: "昆布だしの旨みとポン酢の酸味。鍋料理に最適。", tags: "ポン酢,鍋", rating: 4.3 },
  { name: "茅乃舎だし 焼きあご・昆布 30袋", brand: "久原本家", category: "seasoning", price: 2160, description: "焼きあごと昆布の合わせだし。本格的なだしが手軽に。", tags: "茅乃舎,合わせだし,高級", isFeatured: true, rating: 4.8 },
  { name: "昆布水の素 10袋入", brand: "くらこん", category: "seasoning", price: 498, description: "水に入れるだけで昆布だし。冷蔵庫に常備しておきたい。", tags: "簡単,昆布水", rating: 4.2 },

  // === 健康食品 ===
  { name: "フコイダン カプセル 90粒", brand: "オーガランド", category: "health", price: 1980, description: "がごめ昆布由来のフコイダンサプリ。毎日の健康維持に。", tags: "フコイダン,サプリ", rating: 4.2 },
  { name: "昆布エキス アルギン酸 60粒", brand: "DHC", category: "health", price: 1280, description: "昆布由来のアルギン酸サプリ。食物繊維たっぷり。", tags: "アルギン酸,食物繊維", rating: 4.0 },
  { name: "がごめ昆布 フコイダン 100g", brand: "ヤマト食品", category: "health", price: 1480, origin: "北海道 函館", description: "がごめ昆布の粉末。スムージーやスープに混ぜて。", tags: "粉末,フコイダン", rating: 4.3 },

  // === ギフト ===
  { name: "昆布匠 詰め合わせ 松", brand: "奥井海生堂", category: "gift", price: 5400, origin: "北海道", description: "利尻昆布・真昆布・塩昆布の豪華詰め合わせ。お中元・お歳暮に。", tags: "詰め合わせ,贈答,高級", isFeatured: true, rating: 4.8 },
  { name: "大阪昆布 ギフトセット", brand: "小倉屋山本", category: "gift", price: 3240, origin: "大阪", description: "えびすめ・しそ昆布・松茸昆布の3種セット。大阪土産に最適。", tags: "大阪,3種セット,贈答", rating: 4.7 },
  { name: "北海道昆布 だし比べセット", brand: "道南伝統食品", category: "gift", price: 4320, origin: "北海道", description: "利尻・羅臼・日高・真昆布の4種を食べ比べ。昆布好きへのプレゼントに。", tags: "食べ比べ,4種セット,プレゼント", isFeatured: true, rating: 4.6 },
  { name: "昆布茶・塩昆布 ギフトBOX", brand: "玉露園", category: "gift", price: 2160, description: "昆布茶と塩昆布のギフトセット。ちょっとした贈り物に。", tags: "ギフト,セット", rating: 4.4 },
];

const producers = [
  { name: "奥井海生堂", area: "福井 敦賀", speciality: "蔵囲い昆布", description: "創業明治4年。北前船の時代から続く老舗昆布問屋。蔵で数年間熟成させた「蔵囲い昆布」は料亭御用達。", url: "https://www.konbu.co.jp/", isPartner: false },
  { name: "小倉屋山本", area: "大阪 中央区", speciality: "塩昆布・佃煮", description: "大阪を代表する昆布屋。代表商品「えびすめ」は塩昆布の最高峰。", url: "https://www.ogurayayamamoto.co.jp/", isPartner: false },
  { name: "フジッコ", area: "兵庫 神戸", speciality: "塩昆布", description: "「ふじっ子」ブランドで知られる昆布加工品のトップメーカー。", url: "https://www.fujicco.co.jp/", isPartner: false },
  { name: "くらこん", area: "大阪", speciality: "塩昆布・とろろ昆布", description: "「塩こん部長」で知られる総合昆布メーカー。無添加シリーズも人気。", url: "https://www.kurakon.jp/", isPartner: false },
  { name: "道南伝統食品", area: "北海道 函館", speciality: "天然昆布全般", description: "北海道道南エリアの天然昆布を直送。利尻・真昆布・がごめ昆布を取り扱い。", isPartner: false },
  { name: "四十物昆布（あいものこんぶ）", area: "富山", speciality: "とろろ昆布", description: "富山伝統の手削りとろろ昆布の老舗。職人の技が光る逸品。", isPartner: false },
  { name: "松前屋", area: "大阪", speciality: "塩昆布・松前漬け", description: "料亭の味を家庭に届ける昆布の老舗。こだわりの素材と製法。", url: "https://www.matumaeya.jp/", isPartner: false },
  { name: "中野物産", area: "大阪", speciality: "おやつ昆布", description: "「都こんぶ」「おしゃぶり昆布」でおなじみ。昭和から愛される昆布おやつメーカー。", isPartner: false },
  { name: "久原本家", area: "福岡 久山", speciality: "茅乃舎だし", description: "「茅乃舎だし」で知られる老舗。焼きあごと昆布の合わせだしが大人気。", url: "https://www.kayanoya.com/", isPartner: false },
  { name: "不二食品", area: "大阪", speciality: "昆布茶", description: "業務用昆布茶のトップメーカー。プロの料理人にも愛用されている。", isPartner: false },
];

async function main() {
  console.log("Seeding database...");

  // Products
  for (const p of products) {
    await prisma.product.upsert({
      where: { id: products.indexOf(p) + 1 },
      update: p,
      create: p,
    });
  }
  console.log(`Seeded ${products.length} products`);

  // Producers
  for (const p of producers) {
    await prisma.producer.upsert({
      where: { id: producers.indexOf(p) + 1 },
      update: p,
      create: p,
    });
  }
  console.log(`Seeded ${producers.length} producers`);

  console.log("Done!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
