/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findStoreLazy } from "@webpack";

const LocaleStore = findStoreLazy("LocaleStore");

const STRINGS = {
    ja: {
        // FolderEditModal
        folderEditTitle: "フォルダを編集",
        folderNameLabel: "フォルダ名",
        folderNamePlaceholder: "フォルダ名",
        colorLabel: "色",
        colorNone: "色なし",
        save: "保存",
        cancel: "キャンセル",
        // FolderCard
        defaultFolderName: "フォルダ",
        // Tutorial
        tutorialTitle: "使い方",
        tutorialSubtitle: "右上の ? ボタンからいつでも見返せます",
        tutorialDismiss: "わかった！",
        viewHelp: "使い方を見る",
        tip0Title: "並び替え",
        tip0Desc: "サーバー・グループをドラッグ&ドロップして順番を入れ替えられます",
        tip1Title: "グループに追加",
        tip1Desc: "サーバーをグループの中央にドロップするとグループに追加できます",
        tip2Title: "グループ新規作成",
        tip2Desc: "フッターの「新規グループ作成」ボタンで空のグループを追加できます",
        tip3Title: "グループ編集",
        tip3Desc: "グループを右クリックして名前や色を変更できます",
        // Footer
        applySort: "並び替えを適用",
        createGroup: "新規グループ作成",
        close: "閉じる",
        restart: "Discord を再起動",
        // Toasts
        applySuccess: "並び替えを適用しました",
        applyFailure: "適用に失敗しました",
    },
    en: {
        // FolderEditModal
        folderEditTitle: "Edit Folder",
        folderNameLabel: "Folder Name",
        folderNamePlaceholder: "Folder name",
        colorLabel: "Color",
        colorNone: "No color",
        save: "Save",
        cancel: "Cancel",
        // FolderCard
        defaultFolderName: "Folder",
        // Tutorial
        tutorialTitle: "How to Use",
        tutorialSubtitle: "You can always view this again from the ? button in the top right",
        tutorialDismiss: "Got it!",
        viewHelp: "View help",
        tip0Title: "Reorder",
        tip0Desc: "Drag and drop servers and groups to rearrange their order",
        tip1Title: "Add to Group",
        tip1Desc: "Drop a server onto the center of a group to add it",
        tip2Title: "Create Group",
        tip2Desc: "Use the \"Create Group\" button in the footer to add an empty group",
        tip3Title: "Edit Group",
        tip3Desc: "Right-click a group to change its name and color",
        // Footer
        applySort: "Apply Order",
        createGroup: "Create Group",
        close: "Close",
        restart: "Restart Discord",
        // Toasts
        applySuccess: "Order applied successfully",
        applyFailure: "Failed to apply order",
    },
} as const;

type Locale = keyof typeof STRINGS;
export type StringKey = keyof typeof STRINGS.en;

function getLocale(): Locale {
    const locale: string = LocaleStore?.locale ?? "en";
    return locale.startsWith("ja") ? "ja" : "en";
}

export function t(key: StringKey): string {
    const locale = getLocale();
    return (STRINGS[locale] as Record<string, string>)[key] ?? STRINGS.en[key];
}

export function getTutorialTips() {
    return [
        { icon: "↕️", title: t("tip0Title"), desc: t("tip0Desc") },
        { icon: "📂", title: t("tip1Title"), desc: t("tip1Desc") },
        { icon: "➕", title: t("tip2Title"), desc: t("tip2Desc") },
        { icon: "✏️", title: t("tip3Title"), desc: t("tip3Desc") },
    ];
}
