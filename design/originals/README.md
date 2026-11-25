# イラストの元画像

**公開用に縮めたものとは別の、高解像度の元画像を置いている。**
OGP・別サイズ・チラシを作るときはここから作り直す。

**git には入れない**（1枚2MB）。`.gitignore` に `design/originals/` を入れ、
この README だけ追跡する。**消さないこと**（消すと生成からやり直しになる）。

| 元画像 | 公開しているファイル | 使っている場所 | 寸法 |
| --- | --- | --- | --- |
| `dashi.png` | `public/images/dashi.{png,webp}` | だしカテゴリのページ（`/category/dashi`）のアイキャッチ | 1448×1086 → 1200×900 |
| `year-end.png` | `public/images/year-end.{png,webp}` | トップの年末特集枠の背景 | 1672×941 → 1200×675 |

## 公開用の作り方

```bash
sips -Z 1200 design/originals/dashi.png --out public/images/dashi.png
cwebp -q 80 public/images/dashi.png -o public/images/dashi.webp
```

**`public/images/` がディレクトリとして無い状態で sips を実行しない。**
`images` という名前のPNGファイルができてしまう（2026-11-25 に実際にやった）。

## 記事ごとの画像は上書きしない

ガイド記事（`/guide/*`）には**1本ずつ別の画像**が入っている
（`/public/guide/<slug>.webp`）。年末やだしの記事にこの2枚を割り当てると、
固有の絵が共通の絵に置き換わって、記事ごとの見分けが付かなくなる。
**この2枚は、記事の画像が無い場所にだけ使う。**
