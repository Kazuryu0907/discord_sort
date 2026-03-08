# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

ServerSorter - DiscordのサーバーをGUIで並び替えできるVencordプラグイン。
現在の方式: **Docking Tray型** — 上部トレイにサーバーを一時退避し、確定時に `moveGuildById` で実際に移動・永続化する。

## ファイル構成

```
src/userplugins/discord_sort/
├── index.tsx     # プラグイン定義・モーダルUI
├── debug.ts      # moveGuildById / dumpFolderStructure / テスト関数
├── style.css     # モーダル・トレイ・リストのスタイル
├── discord.css   # 参照用: Discordで実際に使える CSS 変数一覧
└── CLAUDE.md     # このファイル
```

## 開発環境

```bash
cd /path/to/Vencord
pnpm build
```

## 現在のUI仕様（index.tsx）

### モーダル構成

```
┌────────────────────────────────┐
│ ModalHeader: "Server Sorter"   │
├────────────────────────────────┤
│ FolderTray (20vh, liquid glass)│  ← トレイ: サーバー一時退避エリア
├────────────────────────────────┤
│ ModalContent > ServerList      │  ← サーバー・フォルダ一覧（スクロール）
├────────────────────────────────┤
│ ModalFooter: 閉じる / 再起動   │
└────────────────────────────────┘
```

### FolderTray
- 空のとき: プレースホルダーテキスト表示
- アイテムあり: アイコン横並び（`flex-wrap: wrap`）
- アイコンホバー: `data-name` 属性 + CSS `::after` でサーバー名ツールチップ表示
- アイコンクリック: `handleTrayRemove` → リストの元の位置に復元

### ServerList
- `SortedGuildStore.getGuildFolders()` から取得したフォルダ構造を表示
- フォルダ付きサーバー → インデント表示
- サーバー行クリック: `handleServerClick` → トレイに追加

### State管理

```typescript
const [folders, setFolders]         = useState<GuildFolder[]>(...)  // 表示用（UI上の並び）
const [trayGuildIds, setTrayGuildIds] = useState<string[]>([])       // トレイ内のサーバーID列
```

**重要**: `SortedGuildStore` はUIの操作（クリックによる state 変更）では更新されない。
→ 常に起動時点のオリジナルの並び順を保持しているため、元位置復元の参照として使える。

### handleTrayRemove の元位置復元ロジック

```typescript
const origEntry = original.find(o => o.guildIds.includes(guildId));

if (origEntry.folderId !== undefined) {
    // フォルダ内サーバー: folderId はユニーク → 直接マッチして origIdx に splice
} else {
    // ungrouped サーバー: folderId が全て undefined → 使えない
    // オリジナルの ungrouped エントリ群内でのインデックス位置で対応エントリを特定
    const origUngroupedIdx = original.filter(o => o.folderId === undefined).indexOf(origEntry);
    const targetEntry = prev.filter(f => f.folderId === undefined)[origUngroupedIdx];
    // 元々 [guildId] だけのエントリなので guildIds: [guildId] で復元
}
```

**エッジケース**: 複数アイテムがトレイにある状態でフォルダ内サーバーを復元する場合、
他のトレイ中アイテムが抜けた分だけ `origIdx` がズレることがある（許容済み）。

## CSS設計（style.css）

### 有効なDiscord CSS変数（discord.css参照）

使って良いもの:
- `--channels-default`, `--text-strong`
- `--interactive-background-hover`
- `--background-base-low`
- `--border-subtle`

**存在しない変数（使用禁止)**:
- `--background-secondary`, `--background-modifier-accent`
- `--background-modifier-hover`, `--background-tertiary`
- `--channels-secondary`, `--brand-experiment`

### トレイ Liquid Glass スタイル

```css
.vc-ss-tray {
    background: rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(24px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.18);
    box-shadow: 0 8px 32px rgba(0,0,0,0.18),
                inset 0 1px 0 rgba(255,255,255,0.22),
                inset 0 -1px 0 rgba(0,0,0,0.08);
    overflow: visible;  /* ツールチップが切れないよう必須 */
}
```

### ホバーツールチップ

```css
/* data-name 属性の値を ::after で表示 */
.vc-ss-tray-item::after {
    content: attr(data-name);
    position: absolute;
    bottom: calc(100% + 8px);
    opacity: 0;
    transition: opacity 0.15s;
}
.vc-ss-tray-item:hover::after { opacity: 1; }
```

## 調査済みAPI

### サーバー移動・永続化（debug.ts: moveGuildById）

```typescript
// GUILD_MOVE_BY_ID dispatch + updateAsync で永続化
await moveGuildById(sourceId, targetId, moveToBelow, combine);
// sourceId   : 移動するサーバーID
// targetId   : 基準（サーバーID: string、フォルダID: number）
// moveToBelow: false=targetの上、true=targetの下
// combine    : true=フォルダ合体（新規フォルダ作成）
```

内部フロー:
1. `GUILD_MOVE_BY_ID` dispatch → SortedGuildStore がローカル更新
2. 300ms wait（store 反映待ち）
3. `updateAsync("guildFolders", ...)` で SortedGuildStore の状態を proto に全同期 → 永続化

**注意**: `updateAsync` の updater は `cur` を直接 mutate して返す必要がある。
spread で新オブジェクトを作ると proto に反映されない。

### guildFolders proto フォーマット

```js
{
    folders: [
        { id: { value: "3019872202" }, guildIds: ["707...", "878..."] },  // フォルダ
        { guildIds: ["1190..."] },  // フォルダなし（id フィールド自体がない）
    ],
    guildPositions: [...]  // 無視してよい
}
```

### PreloadedUserSettings proto store

```typescript
const store = findAll(m => m?.ProtoClass?.typeName?.includes("PreloadedUserSettings"))[0];
store.updateAsync(fieldName, updaterFn, delay)  // 永続化の主要メソッド
```

## マイルストーン

- [x] プラグイン基本構造の作成
- [x] `GuildStore` / `SortedGuildStore` でサーバー・フォルダ情報取得
- [x] `GUILD_MOVE_BY_ID` dispatch でサーバー移動（フォルダへの移動・フォルダから外に出す・combine）
- [x] `PreloadedUserSettings` proto store による永続化
- [x] モーダルUI（フルスクリーン、ModalRoot使用）
- [x] Docking Tray型UI（liquid glass、ホバーツールチップ、クリックで退避・復元）
- [ ] ドラッグ&ドロップによる並び替えUI
- [ ] 確定ボタン（トレイの内容を実際に `moveGuildById` で適用）
