/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findAll, findByPropsLazy, findStoreLazy } from "@webpack";

const GuildStore = findStoreLazy("GuildStore");
const SortedGuildStore = findStoreLazy("SortedGuildStore");
const FluxDispatcher = findByPropsLazy("_subscriptions", "dispatch");

/** PreloadedUserSettings proto store（永続化に使用） */
export function getPreloadedUserSettingsStore() {
    const stores = findAll(m => m?.ProtoClass?.typeName?.includes("PreloadedUserSettings"));
    return stores[0] ?? null;
}

export interface GuildFolder {
    folderId: string | undefined;
    guildIds: string[];
    folderName?: string;
    folderColor?: number;
    expanded?: boolean;
}

export function dumpFolderStructure() {
    const folders: GuildFolder[] = SortedGuildStore.getGuildFolders();
    console.log("=== フォルダ構造ダンプ ===");
    folders.forEach((folder, folderIndex) => {
        const label = folder.folderId ? `フォルダ[${folderIndex}] id=${folder.folderId}` : `未分類[${folderIndex}]`;
        console.log(label, "guildIds:", folder.guildIds.map((id, guildIndex) => {
            const guild = GuildStore.getGuild(id);
            return `[${guildIndex}] ${guild?.name ?? id}`;
        }));
    });
    console.log("=========================");
    return folders;
}


/**
 * GUILD_MOVE_BY_ID を dispatch してサーバーを移動し、永続化する
 * @param sourceId 移動するサーバーのID
 * @param targetId 移動先の基準となるサーバーのID
 * @param moveToBelow false=targetId の上に配置、true=targetId の下に配置
 * @param combine true=targetId のサーバーと合体してフォルダを作成（Discord が folderId を自動採番、folderName は undefined）
 *                false=単純に移動（targetId の folderId が undefined なら折り外に出る）
 */
export async function moveGuildById(sourceId: string, targetId: string | number | undefined, moveToBelow = false, combine = false) {
    FluxDispatcher.dispatch({
        type: "GUILD_MOVE_BY_ID",
        sourceId,
        targetId,
        moveToBelow,
        combine,
    });

    // dispatch が SortedGuildStore に反映されるのを待つ
    await new Promise(resolve => setTimeout(resolve, 300));

    // SortedGuildStore の最新状態を proto store に同期して永続化
    const store = getPreloadedUserSettingsStore();
    if (!store) { console.error("[moveGuildById] PreloadedUserSettings store が見つかりません"); return; }

    await store.updateAsync("guildFolders", (cur: any) => {
        const newFolders: GuildFolder[] = SortedGuildStore.getGuildFolders();
        cur.folders.length = 0;
        for (const f of newFolders) {
            if (f.folderId !== undefined) {
                cur.folders.push({ id: { value: String(f.folderId) }, guildIds: [...f.guildIds] });
            } else {
                for (const guildId of f.guildIds) {
                    cur.folders.push({ guildIds: [guildId] });
                }
            }
        }
        return cur;
    }, 0);
}

/**
 * フォルダの名前と色を変更して永続化する
 * @param folderId 変更するフォルダのID
 * @param name     新しいフォルダ名（空文字でクリア）
 * @param color    新しい色（undefined でクリア）
 */
export async function updateFolderProperties(folderId: string, name: string, color: number | undefined) {
    const store = getPreloadedUserSettingsStore();
    if (!store) { console.error("[updateFolderProperties] PreloadedUserSettings store が見つかりません"); return; }

    await store.updateAsync("guildFolders", (cur: any) => {
        const folder = cur.folders.find((f: any) => f.id?.value === String(folderId));
        if (!folder) return cur;
        folder.name = name;
        if (color !== undefined) {
            if (!folder.color) folder.color = {};
            folder.color.value = color;
        } else {
            delete folder.color;
        }
        return cur;
    }, 0);
}

/** テスト: フォルダ外の最初のサーバーを、最初のフォルダの先頭サーバーの上に移動 */
export function testMoveToFolder() {
    const folders: GuildFolder[] = SortedGuildStore.getGuildFolders();

    const fromFolder = folders.find(f => f.folderId === undefined && f.guildIds.length > 0);
    if (!fromFolder) { console.warn("[testMoveToFolder] フォルダに入っていないサーバーが見つかりません"); return; }
    const sourceId = fromFolder.guildIds[0];

    const toFolder = folders.find(f => f.folderId !== undefined && f.guildIds.length > 0);
    if (!toFolder) { console.warn("[testMoveToFolder] フォルダが見つかりません"); return; }
    const targetId = toFolder.guildIds[0];

    console.log(`[testMoveToFolder] "${GuildStore.getGuild(sourceId)?.name}" → フォルダ(${toFolder.folderId})の先頭 "${GuildStore.getGuild(targetId)?.name}" の上へ`);
    moveGuildById(sourceId, targetId, false, false);

    setTimeout(() => { console.log("[testMoveToFolder] 移動後:"); dumpFolderStructure(); }, 500);
}

/** テスト: サーバー数2以上の最初のグループから index 0 のサーバーを外に出す */
export function testRemoveFromFolderFirst() {
    const folders: GuildFolder[] = SortedGuildStore.getGuildFolders();

    // 対象: サーバー数2以上の最初のフォルダ
    const targetFolder = folders.find(f => f.folderId !== undefined && f.guildIds.length >= 2);
    if (!targetFolder) {
        console.warn("[testRemoveFromFolderFirst] サーバー数2以上のフォルダが見つかりません");
        return;
    }
    const sourceId = targetFolder.guildIds[0];

    // 移動先の基準: フォルダ
    // フォルダの上にServerを置くため
    const grouped = folders.find(f => f.folderId !== undefined);
    if (!grouped) {
        console.warn("[testRemoveFromFolderFirst] フォルダ外のサーバーがありません");
        return;
    }

    const groupId = grouped.folderId;

    console.log(`[testRemoveFromFolderFirst] "${GuildStore.getGuild(sourceId)?.name}" をフォルダ(${targetFolder.folderId})から外へ`);
    console.log(`[testRemoveFromFolderFirst] GUILD_MOVE_BY_ID { sourceId: ${sourceId}, targetId: ${groupId}, combine: false }`);

    moveGuildById(sourceId, groupId, false, false);

    setTimeout(() => { console.log("[testRemoveFromFolderFirst] 移動後:"); dumpFolderStructure(); }, 500);
}

/** テスト: フォルダ外の最初の2つのサーバーを combine してフォルダを作成 */
export function testCombine() {
    const folders: GuildFolder[] = SortedGuildStore.getGuildFolders();

    const ungrouped = folders.filter(f => f.folderId === undefined && f.guildIds.length > 0);
    if (ungrouped.length < 2) {
        console.warn("[testCombine] フォルダ外のサーバーが2つ以上必要です");
        return;
    }

    const sourceId = ungrouped[0].guildIds[0];
    const targetId = ungrouped[1].guildIds[0];

    console.log(`[testCombine] "${GuildStore.getGuild(sourceId)?.name}" + "${GuildStore.getGuild(targetId)?.name}" を combine`);
    console.log(`[testCombine] GUILD_MOVE_BY_ID { sourceId: ${sourceId}, targetId: ${targetId}, combine: true }`);

    moveGuildById(sourceId, targetId, false, true);

    setTimeout(() => { console.log("[testCombine] combine後:"); dumpFolderStructure(); }, 500);
}
