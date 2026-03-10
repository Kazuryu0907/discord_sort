export const PLUGIN_ID    = "ServerSorter" as const;
export const PLUGIN_DESC  = "Sort Discord servers via drag & drop GUI" as const;
export const PLUGIN_VER   = "2.0.0" as const;
export const PLUGIN_AUTHOR = "Kazuryu" as const;
export const MAX_PREVIEW  = 2 as const;

// Discord のフォルダカラーピッカーと同じ並び順（2行×10色）
export const FOLDER_COLORS = [
    // 行1（明るい）
    0x1ABC9C, 0x2ECC71, 0x3498DB, 0x9B59B6, 0xE91E63,
    0xF1C40F, 0xE67E22, 0xE74C3C, 0x95A5A6, 0x607D8B,
    // 行2（暗い）
    0x11806A, 0x1F8B4C, 0x206694, 0x71368A, 0xAD1457,
    0xC27C0E, 0xA84300, 0x992D22, 0x979C9F, 0x546E7A,
] as const;

export const STRINGS = {
    ja: {
        folderEditTitle: "フォルダを編集", folderNameLabel: "フォルダ名",
        folderNamePlaceholder: "フォルダ名", colorLabel: "色", colorNone: "色なし",
        save: "保存", cancel: "キャンセル", defaultFolderName: "フォルダ",
        tutorialTitle: "使い方", tutorialSubtitle: "右上の ? ボタンからいつでも見返せます",
        tutorialDismiss: "わかった！", viewHelp: "使い方を見る",
        tip0Title: "並び替え", tip0Desc: "サーバー・グループをドラッグ&ドロップして順番を入れ替えられます",
        tip1Title: "グループに追加", tip1Desc: "サーバーをグループの中央にドロップするとグループに追加できます",
        tip2Title: "グループ新規作成", tip2Desc: "フッターの「新規グループ作成」ボタンで空のグループを追加できます",
        tip3Title: "グループ編集", tip3Desc: "グループを右クリックして名前や色を変更できます",
        applySort: "適用", createGroup: "新規グループ作成", close: "閉じる",
        applySuccess: "並び替えを適用しました", applyFailure: "適用に失敗しました",
    },
    en: {
        folderEditTitle: "Edit Folder", folderNameLabel: "Folder Name",
        folderNamePlaceholder: "Folder name", colorLabel: "Color", colorNone: "No color",
        save: "Save", cancel: "Cancel", defaultFolderName: "Folder",
        tutorialTitle: "How to Use", tutorialSubtitle: "You can always view this again from the ? button in the top right",
        tutorialDismiss: "Got it!", viewHelp: "View help",
        tip0Title: "Reorder", tip0Desc: "Drag and drop servers and groups to rearrange their order",
        tip1Title: "Add to Group", tip1Desc: "Drop a server onto the center of a group to add it",
        tip2Title: "Create Group", tip2Desc: "Use the \"Create Group\" button in the footer to add an empty group",
        tip3Title: "Edit Group", tip3Desc: "Right-click a group to change its name and color",
        applySort: "Apply", createGroup: "Create Group", close: "Close",
        applySuccess: "Order applied successfully", applyFailure: "Failed to apply order",
    },
} as const;

export type StringKey = keyof typeof STRINGS.en;
