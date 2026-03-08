# ServerSorter

Vencord プラグイン — Discord のサーバーを GUI で並び替えするツール。

## 機能

- **Docking Tray** — 画面上部のトレイにサーバーを一時退避
- サーバー行クリック → トレイに移動
- トレイアイコンクリック → 元の位置に復元
- トレイアイコンホバー → サーバー名をツールチップ表示
- Discord を再起動するボタン（常に表示）

## 使い方

1. Vencord の設定から **ServerSorter** を有効化
2. プラグインの設定ボタンからモーダルを開く
3. リスト内のサーバーをクリックしてトレイに退避
4. トレイ内のアイコンをクリックして元の位置に戻す

## インストール

```bash
# Vencord の userplugins ディレクトリに配置
cp -r discord_sort /path/to/Vencord/src/userplugins/

# ビルド
cd /path/to/Vencord
pnpm build
```

## ファイル構成

```
discord_sort/
├── index.tsx     # プラグイン定義・モーダルUI
├── debug.ts      # サーバー移動・永続化ロジック
├── style.css     # スタイル
└── discord.css   # 参照用: 使用可能な Discord CSS 変数一覧
```

## 開発状況

- [x] サーバー・フォルダ情報の取得
- [x] サーバー移動・永続化（`GUILD_MOVE_BY_ID` + proto store）
- [x] Docking Tray UI（liquid glass スタイル）
- [x] クリックによるトレイへの退避・元位置への復元
- [ ] ドラッグ&ドロップによる並び替え
- [ ] 確定ボタン（トレイの並びを実際に適用）
