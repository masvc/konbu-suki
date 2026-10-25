# スキーマ変更計画 v2

確認後にマイグレーション実行します。Neonでバックアップブランチを先に作ってください。

---

## 1. Product テーブルに価格・リピート品カラム追加

```prisma
model Product {
  // 既存フィールドに追加:
  priceFetchedAt DateTime?  // 価格取得日時
  listPrice      Int?       // 通常価格（セール時のみ）
  isOwnerPick    Boolean @default(false)  // 運営者リピート品フラグ
  ownerComment   String?    // 運営者コメント
}
```

**表示ルール:**
- 価格日時: `priceFetchedAt` を Asia/Tokyo で表示
- セール時: `price` < `listPrice` なら「セール価格・通常¥X」を併記
- リピート品: `isOwnerPick: true` の商品に運営者コメント欄を表示

---

## 2. Tag + ProductTag テーブル（中間テーブル方式）

```prisma
model Tag {
  id       Int          @id @default(autoincrement())
  name     String       // 表示名（例: パリパリ食感）
  slug     String       @unique  // URL用（例: paripari）
  category String?      // texture / flavor / usage / material

  products ProductTag[]

  @@map("tags")
}

model ProductTag {
  id        Int     @id @default(autoincrement())
  productId Int
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  tagId     Int
  tag       Tag     @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@unique([productId, tagId])
  @@map("product_tags")
}
```

**用途:** `/tag/paripari` のような一覧ページを作成。ロングテールSEO。

---

## 3. ProductEvent テーブル（PV・クリック計測）

```prisma
model ProductEvent {
  id        Int      @id @default(autoincrement())
  productId Int
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  eventType String   // view, amazon_click, rakuten_click, favorite
  createdAt DateTime @default(now())

  @@index([productId, eventType])
  @@index([eventType, createdAt])
  @@map("product_events")
}
```

**注意:** IP・UAは保存しない。ランキングは日次集計で計算。

---

## 4. ProducerInquiry テーブル（生産者掲載募集フォーム）

```prisma
model ProducerInquiry {
  id          Int      @id @default(autoincrement())
  companyName String   // 会社名
  contactName String   // 担当者名
  email       String   // メールアドレス
  phone       String?  // 電話番号
  productInfo String?  // 商品概要
  message     String?  // メッセージ
  createdAt   DateTime @default(now())

  @@map("producer_inquiries")
}
```

---

## 5. Subscriber テーブル（既存、変更なし）

こんぶBOX事前登録用。既存のままで対応可能。

---

## マイグレーション実行順

1. Product に priceFetchedAt / listPrice / isOwnerPick / ownerComment を追加
2. Tag + ProductTag テーブル作成
3. ProductEvent テーブル作成
4. ProducerInquiry テーブル作成

全て1回の `prisma migrate dev` で適用。

**Neonでバックアップブランチを作ってからOKを出してください。**
