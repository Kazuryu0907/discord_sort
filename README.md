# ServerSorter

BetterDiscord プラグイン — Discord のサーバーを GUI で並び替えするツール。

## 機能

- フォルダカードのグリッドUI（液体ガラス風スタイル）
- ドラッグ&ドロップでサーバー・フォルダの並び替え
- フォルダ間でのサーバー移動（DnD マージ / 並び替え）
- 右クリックでフォルダ名・色を編集
- 新規グループ作成
- 変更を Discord に適用（proto store 永続化）
- 日本語 / 英語 対応（ロケール自動検出）

## インストール

1. `ServerSorter.plugin.js` を BetterDiscord の plugins フォルダに配置:

   ```
   ~/Library/Application Support/BetterDiscord/plugins/   # macOS
   %appdata%\BetterDiscord\plugins\                        # Windows
   ```

2. BetterDiscord の設定 → Plugins から **ServerSorter** を有効化

## ビルド

```bash
cd src/userplugins/discord_sort
npm install
node build-bd.js
```

ビルド成功時、`ServerSorter.plugin.js` が以下の2箇所に出力されます:

- `discord_sort/ServerSorter.plugin.js`（リポジトリ内）
- `~/Library/Application Support/BetterDiscord/plugins/ServerSorter.plugin.js`

## ファイル構成

```
discord_sort/
├── bd-src/
│   ├── Plugin.ts              # エントリ（ServerSorter クラス）
│   ├── ServerSorterModal.tsx  # メインモーダル UI・DnD ロジック
│   ├── FolderCard.tsx         # フォルダカードコンポーネント
│   ├── FolderEditModal.tsx    # フォルダ編集モーダル
│   ├── TutorialOverlay.tsx    # チュートリアルオーバーレイ
│   ├── SorterButton.tsx       # サーバーリスト挿入ボタン
│   ├── GuildIcon.tsx          # サーバーアイコンコンポーネント
│   ├── Btn.tsx                # 汎用ボタンコンポーネント
│   ├── constants.ts           # プラグインメタ情報・色定数・翻訳文字列
│   ├── css.ts                 # スタイル文字列
│   ├── utils.ts               # ユーティリティ関数
│   ├── types.ts               # 型定義
│   └── global.d.ts            # BdApi グローバル型宣言
├── build-bd.js                # esbuild バンドルスクリプト
├── ServerSorter.plugin.js     # ビルド済み（BetterDiscord 用）
└── package.json
```

## 開発状況

- [x] サーバー・フォルダ情報の取得（GuildStore / SortedGuildStore）
- [x] フォルダカードグリッド UI（liquid glass スタイル）
- [x] ドラッグ&ドロップ並び替え（FLIP アニメーション付き）
- [x] フォルダ間サーバー移動（DnD マージ / 並び替え）
- [x] 右クリックでフォルダ名・色を編集
- [x] 新規グループ作成
- [x] 変更を Discord に適用（proto store 永続化）
- [x] 初回チュートリアルオーバーレイ
- [x] i18n 対応（ja / en）
- [ ] オフライン時の適用成否判定
