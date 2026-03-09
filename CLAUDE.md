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
│  │  padding-top: 32px（tooltip用） │    │
│  │  [FolderCard] [FolderCard] ...  │    │
│  │  [bare icon]  [bare icon]  ...  │    │
│  └─────────────────────────────────┘    │
├─────────────────────────────────────────┤
│ ModalFooter: 並び替えを適用 / 閉じる / 再起動 │
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
- カード内の各サーバーアイコンも `draggable`（キー: `i:${folderId}:${guildId}`）
  - `onDragStart` で `stopPropagation` して item drag として扱う
  - `onDragEnd` で `resetDrag()` を呼ぶ（`onItemDragEnd` prop 経由）

### ungrouped サーバー（bare item）

- `folderId === undefined` のエントリはカードなしで `.vc-ss-v2-bare-item` として直置き
- `folders` の順番通りにグリッドに並ぶ（フォルダカードと混在）
- ホバーでサーバー名ツールチップ表示
  - アイコンを `.vc-ss-v2-bare-icon` ラッパーで包み、`data-name` をそこに持たせる
  - `::after` はアイコン基準で `bottom: calc(100% + 6px)` に表示（境界ではなくアイコン上）
  - `.vc-ss-v2-bare-item:hover` に `z-index: 100`（backdrop-filterのスタッキングコンテキスト対策）

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

### 並び替えを適用ボタン

```tsx
<Button color={Button.Colors.GREEN} onClick={async () => {
    try {
        await applyFolderData(folders);
        showToast("並び替えを適用しました", Toasts.Type.SUCCESS);
    } catch (e) {
        showToast(`適用に失敗しました: ${e instanceof Error ? e.message : e}`, Toasts.Type.FAILURE);
    }
}}>
```

- `applyFolderData` は store が見つからない場合に `throw new Error(...)` する（return ではなく）
- TODO: offline 時でも success になる（Discord の proto store は offline でも書き込める）

### チュートリアルオーバーレイ（TutorialOverlay）

- 初回モーダル起動時に自動表示（`settings.store.tutorialSeen === false`）
- ModalContent上に `position: absolute; inset: 0; z-index: 200` でオーバーレイ
- 4枚のカード（2×2グリッド）で操作方法を説明:
  - ↕️ 並び替え / 📂 グループに追加 / ➕ グループ新規作成 / ✏️ グループ編集
- 「右上の **?** ボタンからいつでも見返せます」のサブタイトル表示
- 「わかった！」ボタンで `settings.store.tutorialSeen = true` → dismiss

```typescript
const [showTutorial, setShowTutorial] = React.useState(
    () => !settings.store.tutorialSeen
);
function dismissTutorial() {
    settings.store.tutorialSeen = true;
    setShowTutorial(false);
}
```

- `definePluginSettings` で `tutorialSeen: OptionType.BOOLEAN`（`hidden: true`）を定義
- デバッグ: `ServerSorterDebug.resetTutorial()` で `tutorialSeen = false` にリセット

### ModalHeader の ? ボタン

- タイトル右端に `vc-ss-info-btn`（丸ボタン, 29×29px）
- クリックで `setShowTutorial(true)` → いつでもチュートリアルを再表示

### SorterListButton（サーバーリストのボタン）

```tsx
<Tooltip text="Server Sorter" position="right" spacing={-8} tooltipClassName="vc-ss-tooltip">
```

- `ServerListRenderPosition.Above` に配置
- `tooltipClassName="vc-ss-tooltip"` で font-size: 17px を適用

### State管理（ServerSorterModal）

```typescript
const [folders, setFolders] = React.useState<GuildFolder[]>(() => {
    const raw = SortedGuildStore.getGuildFolders();
    return raw.flatMap(f =>
        f.folderId !== undefined
            ? [f]
            : f.guildIds.map(guildId => ({ folderId: undefined, guildIds: [guildId] }))
    );
});
const [dragKey,  setDragKey]  = React.useState<string | null>(null);
const [dropKey,  setDropKey]  = React.useState<string | null>(null);
const [dropMode, setDropMode] = React.useState<"reorder" | "merge" | null>(null);
```

- ungrouped エントリは初期化時に `guildIds` 1件ずつに分解してから `folders` に入れる
- `resetDrag()`: dragKey / dropKey / dropMode を全て null にリセット
- `purgeEmpty()`: `guildIds.length === 0` になったフォルダを配列から除去

### DnD キー体系

| キー形式 | 対象 |
|---|---|
| `f:${folderId}` | フォルダカード全体 |
| `b:${guildId}` | ungrouped サーバー |
| `i:${folderId}:${guildId}` | フォルダ内の個別サーバー |

### DnD ドロップ挙動（handleDrop）

ドロップ先がフォルダ（`f:`）の場合、**カード上のマウス横位置**で挙動が変わる:
- **中央（30〜70%）** → `dropMode = "merge"` → 青グロー → サーバーをフォルダに追加
- **端（〜30% / 70%〜）** → `dropMode = "reorder"` → 白左ライン → 並び替え

| fromKey | toKey | dropMode | 動作 |
|---|---|---|---|
| `b:` | `f:` | merge | bare item をフォルダに追加、bare item エントリ削除 |
| `i:` | `f:` | merge | フォルダ間移動（同フォルダは no-op） |
| `i:` | `f:` | reorder | フォルダから取り出して toKey の前に ungrouped 挿入 |
| `f:/b:` | `f:` | reorder | カード / bare item をフォルダの前に並び替え |
| `i:` | `b:` | - | フォルダから取り出して bare item の前に ungrouped 挿入 |
| その他 | `b:` | - | 通常の並び替え |

- フォルダから取り出した後 `guildIds` が空になったフォルダは `purgeEmpty` で自動削除

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
- [x] V2: サーバー・フォルダのドラッグ&ドロップ並び替え（FLIP アニメーション付き）
- [x] V2: 並び替えを適用ボタン（`applyFolderData` + toast 通知）
- [x] V2: 新規グループ作成ボタン（空フォルダを末尾に追加）
- [x] V2: ungrouped → フォルダへ DnD でマージ（位置ベース: 中央=merge / 端=reorder）
- [x] V2: フォルダ内サーバー → 外へ DnD（bare item の前に ungrouped 挿入 / 別フォルダにマージ）
- [x] V2: サーバー取り出しで空になったフォルダを自動削除（purgeEmpty）
- [x] V2: モーダル幅 90vw × 高さ 90vh
- [x] V2: 初回起動チュートリアルオーバーレイ（4枚カード + わかった！ボタン）
- [x] V2: ModalHeader の ? ボタンでいつでもチュートリアルを再表示
- [ ] V2: offline 時の適用成否判定（現状 offline でも success になる）
