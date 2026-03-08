/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { disableStyle, enableStyle } from "@api/Styles";
import { Devs } from "@utils/constants";
import { ModalContent, ModalFooter, ModalHeader, ModalProps, ModalRoot, ModalSize, openModal } from "@utils/modal";
import definePlugin from "@utils/types";
import { findStoreLazy } from "@webpack";
import { Button, Forms, React } from "@webpack/common";

import { dumpFolderStructure, GuildFolder, moveGuildById, testCombine, testMoveToFolder, testRemoveFromFolderFirst } from "./debug";
import style from "./style.css?managed";

const GuildStore = findStoreLazy("GuildStore");
const SortedGuildStore = findStoreLazy("SortedGuildStore");

function GuildIcon({ guildId, size = 32 }: { guildId: string; size?: number; }) {
    const guild = GuildStore.getGuild(guildId);
    if (guild?.icon) {
        return <img
            src={`https://cdn.discordapp.com/icons/${guildId}/${guild.icon}.png?size=32`}
            style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0 }}
        />;
    }
    return <div style={{
        width: size, height: size, borderRadius: "50%", flexShrink: 0,
        background: "var(--background-base-low)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.4, color: "var(--text-strong)",
    }}>
        {guild?.name?.[0] ?? "?"}
    </div>;
}

/** 上部トレイ: ドロップゾーン */
function FolderTray({ guildIds, onRemove }: { guildIds: string[]; onRemove: (guildId: string) => void; }) {
    return (
        <div className="vc-ss-tray">
            {guildIds.length === 0
                ? <div className="vc-ss-tray-placeholder">クリックしてここに追加</div>
                : <div className="vc-ss-tray-items">
                    {guildIds.map(guildId => (
                        <div
                            key={guildId}
                            className="vc-ss-tray-item"
                            onClick={() => onRemove(guildId)}
                            data-name={GuildStore.getGuild(guildId)?.name ?? guildId}
                        >
                            <GuildIcon guildId={guildId} size={40} />
                        </div>
                    ))}
                </div>
            }
        </div>
    );
}

/** メインリスト: フォルダ・サーバー一覧 */
function ServerList({ folders, onServerClick }: { folders: GuildFolder[]; onServerClick: (guildId: string) => void; }) {
    return (
        <div className="vc-ss-list">
            {folders.map((folder, folderIndex) => (
                <div key={folder.folderId ?? `ungrouped-${folderIndex}`} className="vc-ss-folder-group">
                    {folder.folderId && (
                        <div className="vc-ss-folder-header">
                            <span className="vc-ss-folder-label">フォルダ {folder.folderId}</span>
                        </div>
                    )}
                    {folder.guildIds.map(guildId => {
                        const guild = GuildStore.getGuild(guildId);
                        return (
                            <div
                                key={guildId}
                                className={`vc-ss-row${folder.folderId ? " vc-ss-row--indented" : ""}`}
                                onClick={() => onServerClick(guildId)}
                            >
                                <span className="vc-ss-drag-handle">⠿</span>
                                <GuildIcon guildId={guildId} />
                                <span className="vc-ss-guild-name">{guild?.name ?? guildId}</span>
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}

function ServerSorterModal({ props }: { props: ModalProps; }) {
    const [folders, setFolders] = React.useState<GuildFolder[]>(() => SortedGuildStore.getGuildFolders());
    const [trayGuildIds, setTrayGuildIds] = React.useState<string[]>([]);

    React.useEffect(() => {
        enableStyle(style);
        return () => void disableStyle(style);
    }, []);

    function handleServerClick(guildId: string) {
        setFolders(prev => prev.map(f => ({ ...f, guildIds: f.guildIds.filter(id => id !== guildId) })));
        setTrayGuildIds(prev => [...prev, guildId]);
    }

    function handleTrayRemove(guildId: string) {
        setTrayGuildIds(prev => prev.filter(id => id !== guildId));
        // SortedGuildStore はユーザーの操作（UI上の移動）では更新されないため、
        // 常に「Discord 起動時点のオリジナルの並び順」を保持している。
        // これを元の位置の参照として使う。
        const original = SortedGuildStore.getGuildFolders() as GuildFolder[];
        setFolders(prev => {
            // guildId を元々含んでいたオリジナルのエントリを特定
            const origEntry = original.find(o => o.guildIds.includes(guildId));
            if (!origEntry) return prev;

            if (origEntry.folderId !== undefined) {
                // フォルダ内のサーバー: folderId はユニークなので直接マッチできる
                return prev.map(f => {
                    if (f.folderId !== origEntry.folderId) return f;
                    // 注: トレイに複数アイテムがある場合、他のトレイ中アイテムが
                    //     抜けた状態の guildIds に対して挿入するため、
                    //     厳密な位置がズレることがある（許容済みのエッジケース）
                    const origIdx = origEntry.guildIds.indexOf(guildId);
                    const ids = [...f.guildIds];
                    ids.splice(origIdx, 0, guildId);
                    return { ...f, guildIds: ids };
                });
            } else {
                // フォルダなし（ungrouped）の場合:
                // ungrouped サーバーは1サーバー1エントリで folderId がすべて undefined のため、
                // folderId ではマッチできない。
                // オリジナルの ungrouped エントリ群の中での位置インデックスで
                // 現在の state の対応エントリを特定する。
                const origUngroupedIdx = original.filter(o => o.folderId === undefined).indexOf(origEntry);
                const targetEntry = prev.filter(f => f.folderId === undefined)[origUngroupedIdx];
                if (!targetEntry) return prev;
                // 元々 [guildId] だけを持つ ungrouped エントリだったので guildIds を復元
                return prev.map(f => f === targetEntry ? { ...f, guildIds: [guildId] } : f);
            }
        });
    }

    return (
        <ModalRoot {...props} size={ModalSize.LARGE} className="vc-server-sorter-modal">
            <ModalHeader>
                <Forms.FormTitle tag="h4">Server Sorter</Forms.FormTitle>
            </ModalHeader>

            {/* 上部トレイ */}
            <FolderTray guildIds={trayGuildIds} onRemove={handleTrayRemove} />

            {/* サーバーリスト */}
            <ModalContent>
                <ServerList folders={folders} onServerClick={handleServerClick} />
            </ModalContent>

            <ModalFooter>
                <Button color={Button.Colors.PRIMARY} onClick={props.onClose}>
                    閉じる
                </Button>
                <Button
                    color={Button.Colors.RED}
                    onClick={() => (window as any).DiscordNative?.app?.relaunch()}
                >
                    Discord を再起動
                </Button>
            </ModalFooter>
        </ModalRoot>
    );
}

export default definePlugin({
    name: "ServerSorter",
    description: "GUIでDiscordサーバーをドラッグ&ドロップでソートできるプラグイン",
    authors: [Devs.Ven],

    patches: [],

    start() {
        (window as any).ServerSorterDebug = {
            dumpFolderStructure,
            moveGuildById,
            testMove: testMoveToFolder,
            testCombine,
            testRemoveFromFolderFirst,
            openModal: () => openModal(props => <ServerSorterModal props={props} />),
        };
        console.log("デバッグ用: window.ServerSorterDebug に公開しました");
        console.log("  .openModal()  - モーダルを開く");
        window.ServerSorterDebug.openModal();
    },

    stop() {
        console.log("ServerSorter plugin stopped");
        delete (window as any).ServerSorterDebug;
    },
});
