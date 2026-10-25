# スキーマ変更計画

確認後にマイグレーション実行します。

---

## 1. Product テーブルに価格関連カラム追加

```sql
ALTER TABLE products ADD COLUMN "priceFetchedAt" TIMESTAMP;
ALTER TABLE products ADD COLUMN "listPrice" INTEGER;
```

| カラム | 型 | 用途 |
|--------|------|------|
| `priceFetchedAt` | DateTime? | 価格を取得した日時（JST表示用） |
| `listPrice` | Int? | 通常価格（セール時のみ。savingBasis） |

- `price`: セール時はセール価格、通常時は定価
- `listPrice`: セール時のみ通常価格が入る。nullなら通常価格
- `priceFetchedAt`: 価格取得スクリプト実行時の日時

**表示例:**
- 通常時: `¥1,280（2026/10/26 14:30時点）`
- セール時: `¥980（セール価格・通常¥1,280）2026/10/26 14:30時点`

---

## 2. タグ保存テーブル（/tag/[slug]ページ用）

```sql
CREATE TABLE product_tags (
  id SERIAL PRIMARY KEY,
  "productId" INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  tag VARCHAR NOT NULL,
  UNIQUE("productId", tag)
);
CREATE INDEX idx_product_tags_tag ON product_tags(tag);
```

- 食感・味わいタグをDB保存し、`/tag/パリパリ` 等の一覧ページを作成
- タグはスクリプトで一括生成（getTextureAndFlavorTags の結果を保存）

---

## 3. イベント計測テーブル（/api/track, /ranking用）

```sql
CREATE TABLE product_events (
  id SERIAL PRIMARY KEY,
  "productId" INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  "eventType" VARCHAR NOT NULL,  -- 'view', 'amazon_click', 'rakuten_click', 'favorite'
  "createdAt" TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_product_events_type_date ON product_events("eventType", "createdAt");
CREATE INDEX idx_product_events_product ON product_events("productId", "eventType");
```

---

## 4. こんぶBOX事前登録（Subscriberテーブルは既存）

既存の `subscribers` テーブルで対応可能。変更不要。

---

## 5. 運営者リピート品フラグ

```sql
ALTER TABLE products ADD COLUMN "ownerComment" TEXT;
ALTER TABLE products ADD COLUMN "isOwnerPick" BOOLEAN DEFAULT FALSE;
```

---

## 実行順

1. **価格カラム追加**（priceFetchedAt, listPrice）→ 価格取得スクリプト更新
2. **リピート品フラグ**（ownerComment, isOwnerPick）
3. **タグテーブル**（product_tags）→ タグ生成スクリプト → /tag/[slug]ページ
4. **イベントテーブル**（product_events）→ /api/track → /ranking

全部やりますか？それとも1から順にやりますか？
