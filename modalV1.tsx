/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * V1: Docking Tray 型モーダル
 * - 上部 liquid glass トレイ（一時退避エリア）
 * - 左: サーバーリスト（縦スクロール）
 * - 右: グループパネル（liquid glass）
 */

import { ModalContent, ModalFooter, ModalHeader, ModalProps, ModalRoot, ModalSize } from "@utils/modal";
import { findStoreLazy } from "@webpack";
import { Button, Forms, React } from "@webpack/common";

import { GuildFolder } from "./debug";
import { GuildIcon } from "./index";

const GuildStore = findStoreLazy("GuildStore");
const SortedGuildStore = findStoreLazy("SortedGuildStore");

function FolderTray({ guildIds, onRemove }: { guildIds: string[]; onRemove: (guildId: string) => void; }) {
    return (
        <div className="vc-ss-tray">
            <div className="vc-ss-folder-panel-title">一時トレイ</div>
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

function FolderPanel({ folders }: { folders: GuildFolder[]; }) {
    const folderEntries = folders.filter(f => f.folderId !== undefined);
    return (
        <div className="vc-ss-folder-panel">
            <div className="vc-ss-folder-panel-title">グループ</div>
            {folderEntries.length === 0
                ? <div className="vc-ss-folder-panel-empty">フォルダなし</div>
                : folderEntries.map(folder => (
                    <div key={folder.folderId} className="vc-ss-folder-panel-item">
                        <span className="vc-ss-folder-panel-icon">📁</span>
                        <span className="vc-ss-folder-panel-name">{folder.folderId}</span>
                        <span className="vc-ss-folder-panel-count">{folder.guildIds.length}</span>
                    </div>
                ))
            }
        </div>
    );
}

export function ServerSorterModalV1({ props }: { props: ModalProps; }) {
    const [folders, setFolders] = React.useState<GuildFolder[]>(() => SortedGuildStore.getGuildFolders());
    const [trayGuildIds, setTrayGuildIds] = React.useState<string[]>([]);

    function handleServerClick(guildId: string) {
        setFolders(prev => prev.map(f => ({ ...f, guildIds: f.guildIds.filter(id => id !== guildId) })));
        setTrayGuildIds(prev => [...prev, guildId]);
    }

    function handleTrayRemove(guildId: string) {
        setTrayGuildIds(prev => prev.filter(id => id !== guildId));
        const original = SortedGuildStore.getGuildFolders() as GuildFolder[];
        setFolders(prev => {
            const origEntry = original.find(o => o.guildIds.includes(guildId));
            if (!origEntry) return prev;

            if (origEntry.folderId !== undefined) {
                return prev.map(f => {
                    if (f.folderId !== origEntry.folderId) return f;
                    const origIdx = origEntry.guildIds.indexOf(guildId);
                    const ids = [...f.guildIds];
                    ids.splice(origIdx, 0, guildId);
                    return { ...f, guildIds: ids };
                });
            } else {
                const origUngroupedIdx = original.filter(o => o.folderId === undefined).indexOf(origEntry);
                const targetEntry = prev.filter(f => f.folderId === undefined)[origUngroupedIdx];
                if (!targetEntry) return prev;
                return prev.map(f => f === targetEntry ? { ...f, guildIds: [guildId] } : f);
            }
        });
    }

    return (
        <ModalRoot {...props} size={ModalSize.LARGE} className="vc-server-sorter-modal">
            <ModalHeader>
                <Forms.FormTitle tag="h4">Server Sorter</Forms.FormTitle>
            </ModalHeader>

            <FolderTray guildIds={trayGuildIds} onRemove={handleTrayRemove} />

            <ModalContent className="vc-ss-body">
                <ServerList folders={folders} onServerClick={handleServerClick} />
                <FolderPanel folders={folders} />
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
