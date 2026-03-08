# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

ServerSorter - DiscordのサーバーをGUIで並び替えできるVencordプラグイン。

## ファイル構成

```
src/userplugins/discord_sort/
├── index.tsx     # プラグイン定義・V2モーダルUI（現行）
├── modalV1.tsx   # V1アーカイブ（FolderTray + ServerList + FolderPanel）
├── debug.ts      # moveGuildById / updateFolderProperties / dumpFolderStructure 等
├── style.css     # モーダル・カード・編集UIのスタイル（CSS変数使用）
├── discord.css   # 参照用: Discordで実際に使える CSS 変数一覧
└── CLAUDE.md     # このファイル
```

## 開発環境

```bash
cd /path/to/Vencord
pnpm build
```

---

## 現在のUI仕様: V2（index.tsx）

### モーダル構成

```
┌─────────────────────────────────────────┐
│ ModalHeader: "Server Sorter"            │
├─────────────────────────────────────────┤
│ ModalContent (.vc-ss-v2-body)           │
│  ┌─────────────────────────────────┐    │
│  │ .vc-ss-v2-grid (auto-fill grid) │    │
│  │  [FolderCard] [FolderCard] ...  │    │
│  │  [bare icon]  [bare icon]  ...  │    │
│  └─────────────────────────────────┘    │
├─────────────────────────────────────────┤
│ ModalFooter: 閉じる / 再起動            │
└─────────────────────────────────────────┘
```

### FolderCard

- `folderId !== undefined` のフォルダを liquid glass カードで表示
- タイトル: `folder.folderName`（未設定なら `"フォルダ"`）
- 折りたたみ: `MAX_PREVIEW = 2` 件を超えると折りたたみ対象
  - 折りたたみ時: 先頭2件 + `+N` バッジ、タイトルに `▼` 矢印
  - 展開時: 全件表示、`▲` 矢印
  - カードクリックで toggle（`collapsible` な場合のみ）
- folderColor: 整数→`#RRGGBB` 変換して `borderColor` / `background` に適用
- **右クリック**: `FolderEditModal` を開いてフォルダ名・色を編集
  - `onMouseDown` で `button === 2` の伝播を止める（Discord の modal close 防止）
  - `onContextMenu` で `preventDefault + stopPropagation` してモーダルを開く

### ungrouped サーバー（bare item）

- `folderId === undefined` のエントリはカードなしで `.vc-ss-v2-bare-item` として直置き
- `folders` の順番通りにグリッドに並ぶ（フォルダカードと混在）
- ホバーで `data-name` からサーバー名ツールチップ表示

### FolderEditModal

```tsx
// 右クリックで開く小モーダル
<FolderEditModal
    props={modalProps}
    folder={folder}
    onSave={(name, color) => handleFolderUpdate(folderId, name, color)}
/>
```

- テキスト入力でフォルダ名変更
- カラースウォッチ8色 + 色なし（斜線）で色変更
- 保存 → `updateFolderProperties` で proto store に永続化 + `setFolders` で即時反映

### State管理（ServerSorterModal）

```typescript
const [folders, setFolders] = useState<GuildFolder[]>(() => SortedGuildStore.getGuildFolders());

async function handleFolderUpdate(folderId: string, name: string, color: number | undefined) {
    await updateFolderProperties(folderId, name, color);  // proto store 永続化
    setFolders(prev => prev.map(f =>
        f.folderId === folderId ? { ...f, folderName: name, folderColor: color } : f
    ));  // UI 即時反映
}
```

---

## V1アーカイブ（modalV1.tsx）

Docking Tray型の旧UI。現在は使用していないが保存済み。

主要コンポーネント:
- `FolderTray`: 一時退避トレイ（liquid glass, ホバーツールチップ）
- `ServerList`: サーバー・フォルダ一覧（縦スクロール）
- `FolderPanel`: 右側グループ一覧パネル（liquid glass, スクロール）
- `ServerSorterModalV1`: 上記を組み合わせたモーダル

`GuildIcon` は `index.tsx` から import している（export済み）。

### handleTrayRemove の元位置復元ロジック（V1）

```typescript
const origEntry = original.find(o => o.guildIds.includes(guildId));

if (origEntry.folderId !== undefined) {
    // フォルダ内サーバー: folderId はユニーク → 直接マッチして origIdx に splice
} else {
    // ungrouped: folderId が全て undefined → 位置インデックスで対応
    const origUngroupedIdx = original.filter(o => o.folderId === undefined).indexOf(origEntry);
    const targetEntry = prev.filter(f => f.folderId === undefined)[origUngroupedIdx];
}
```

---

## GuildFolder 型

```typescript
export interface GuildFolder {
    folderId:    string | undefined;  // undefined = ungrouped
    guildIds:    string[];
    folderName?: string;              // フォルダ名（未設定時 undefined）
    folderColor?: number;             // 色（整数、例: 0xE74C3C）
    expanded?:   boolean;
}
```

**重要**: `SortedGuildStore` はUIの操作では更新されない。
→ 常に起動時点のオリジナルの並び順を保持しているため、元位置復元の参照として使える。

---

## CSS設計（style.css）

### CSS変数（:root）

```css
:root {
    --vc-ss-panel-radius: 20px;
    --vc-ss-glass-bg:     rgba(255, 255, 255, 0.06);
    --vc-ss-glass-border: rgba(255, 255, 255, 0.18);
    --vc-ss-glass-blur:   blur(24px) saturate(180%);
    --vc-ss-glass-shadow: 0 8px 32px rgba(0,0,0,0.18), inset ...;
    --vc-ss-transition:   0.15s;
}
```

### 有効なDiscord CSS変数

使って良いもの:
- `--channels-default`, `--text-strong`
- `--interactive-background-hover`
- `--background-base-low`
- `--scrollbar-thin-thumb`, `--scrollbar-thin-track`

**存在しない変数（使用禁止)**:
- `--background-secondary`, `--background-modifier-accent`
- `--background-modifier-hover`, `--background-tertiary`

### スクロールバー

Discordの thin スタイルに合わせて実装:

```css
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: var(--scrollbar-thin-track); border-radius: 4px; margin: var(--vc-ss-panel-radius) 0; }
::-webkit-scrollbar-thumb { background: var(--scrollbar-thin-thumb); border-radius: 4px; }
```

`margin: var(--vc-ss-panel-radius) 0` で角丸コンテナからのはみ出しを防止。

---

## 調査済みAPI

### サーバー移動・永続化（debug.ts: moveGuildById）

```typescript
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

### フォルダ名・色の変更（debug.ts: updateFolderProperties）

```typescript
await updateFolderProperties(folderId, name, color);
// folderId: 変更するフォルダのID (string)
// name    : 新しいフォルダ名（空文字でクリア）
// color   : 新しい色（undefined でクリア）
```

proto store の `cur.folders` から `f.id?.value === folderId` で対象を探して mutate。

### guildFolders proto フォーマット

```js
{
    folders: [
        { id: { value: "3019872202" }, name: "foo", color: { value: 15158332 }, guildIds: ["707..."] },
        { guildIds: ["1190..."] },  // ungrouped（id/name/color フィールドなし）
    ]
}
```

### FOLDER_COLORS プリセット

```typescript
const FOLDER_COLORS = [
    0xE74C3C, 0xE67E22, 0xF1C40F, 0x2ECC71,
    0x1ABC9C, 0x3498DB, 0x9B59B6, 0xE91E63,
];
```

---

## マイルストーン

- [x] プラグイン基本構造の作成
- [x] `GuildStore` / `SortedGuildStore` でサーバー・フォルダ情報取得
- [x] `GUILD_MOVE_BY_ID` dispatch でサーバー移動
- [x] `PreloadedUserSettings` proto store による永続化
- [x] V1: Docking Tray型UI（liquid glass, ホバーツールチップ, クリックで退避・復元）
- [x] V2: フォルダカードグリッド型UI（auto-fill grid, folderName/Color対応）
- [x] V2: 折りたたみ表示（MAX_PREVIEW=2, クリックで展開）
- [x] V2: ungrouped サーバーをカードなしで並び順通りに表示
- [x] V2: フォルダ右クリックで名前・色を編集（proto store 永続化）
- [ ] V2: サーバー・フォルダのドラッグ&ドロップ並び替え
- [ ] V2: 確定ボタン（並び順を `moveGuildById` で適用）
