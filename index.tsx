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
import { Button, React } from "@webpack/common";

import { dumpFolderStructure, GuildFolder, moveGuildById, testCombine, testMoveToFolder, testRemoveFromFolderFirst, updateFolderProperties } from "./debug";
import style from "./style.css?managed";

const GuildStore = findStoreLazy("GuildStore");
const SortedGuildStore = findStoreLazy("SortedGuildStore");

export function GuildIcon({ guildId, size = 32 }: { guildId: string; size?: number; }) {
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

/**
 * V2: フォルダカードグリッド型モーダル
 * - body 全体を使ってフォルダを液晶グラスカードで横並び表示
 * - ungrouped サーバーは下部にまとめて表示
 * - 一覧性を高め、グループの視認性を改善
 */

const MAX_PREVIEW = 2;

/** Discord の folderColor 整数を #RRGGBB 文字列に変換 */
function colorToHex(color: number): string {
    return `#${(color & 0xFFFFFF).toString(16).padStart(6, "0")}`;
}

/** Discord フォルダのプリセットカラー */
const FOLDER_COLORS = [
    0xE74C3C, // red
    0xE67E22, // orange
    0xF1C40F, // yellow
    0x2ECC71, // green
    0x1ABC9C, // teal
    0x3498DB, // blue
    0x9B59B6, // purple
    0xE91E63, // pink
];

/** フォルダ名・色の編集モーダル */
function FolderEditModal({ props, folder, onSave }: {
    props: ModalProps;
    folder: GuildFolder;
    onSave: (name: string, color: number | undefined) => void;
}) {
    const [name, setName] = React.useState(folder.folderName ?? "");
    const [color, setColor] = React.useState<number | undefined>(folder.folderColor);

    return (
        <ModalRoot {...props} size={ModalSize.SMALL}>
            <ModalHeader>
                <h4 className="vc-ss-modal-title">フォルダを編集</h4>
            </ModalHeader>
            <ModalContent className="vc-ss-edit-body">
                <div className="vc-ss-edit-label">フォルダ名</div>
                <input
                    className="vc-ss-edit-input"
                    value={name}
                    onChange={e => setName(e.currentTarget.value)}
                    placeholder="フォルダ名"
                    maxLength={100}
                    autoFocus
                />
                <div className="vc-ss-edit-label">色</div>
                <div className="vc-ss-edit-colors">
                    {/* 色なし */}
                    <div
                        className={`vc-ss-edit-swatch vc-ss-edit-swatch--none${color === undefined ? " vc-ss-edit-swatch--selected" : ""}`}
                        onClick={() => setColor(undefined)}
                        title="色なし"
                    />
                    {FOLDER_COLORS.map(c => (
                        <div
                            key={c}
                            className={`vc-ss-edit-swatch${color === c ? " vc-ss-edit-swatch--selected" : ""}`}
                            style={{ background: colorToHex(c) }}
                            onClick={() => setColor(c)}
                            title={colorToHex(c)}
                        />
                    ))}
                </div>
            </ModalContent>
            <ModalFooter>
                <Button color={Button.Colors.PRIMARY} onClick={() => { onSave(name, color); props.onClose(); }}>
                    保存
                </Button>
                <Button color={Button.Colors.RED} onClick={props.onClose}>
                    キャンセル
                </Button>
            </ModalFooter>
        </ModalRoot>
    );
}

/** フォルダ1つをカード表示 */
function FolderCard({ folder, onUpdate }: { folder: GuildFolder; onUpdate: (name: string, color: number | undefined) => void; }) {
    const name = folder.folderName || (folder.folderId ? "フォルダ" : "グループなし");
    const total = folder.guildIds.length;
    const collapsible = total > MAX_PREVIEW;
    const [expanded, setExpanded] = React.useState(false);
    const visibleIds = collapsible && !expanded ? folder.guildIds.slice(0, MAX_PREVIEW) : folder.guildIds;

    const hex = folder.folderColor != null ? colorToHex(folder.folderColor) : null;
    const colorStyle = hex ? {
        borderColor: `${hex}66`,
        background: `${hex}14`,
    } : undefined;

    function handleContextMenu(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        openModal(modalProps => (
            <FolderEditModal props={modalProps} folder={folder} onSave={onUpdate} />
        ));
    }

    return (
        <div
            className={`vc-ss-v2-card${collapsible ? " vc-ss-v2-card--collapsible" : ""}`}
            onClick={collapsible ? () => setExpanded(e => !e) : undefined}
            onMouseDown={e => { if (e.button === 2) e.stopPropagation(); }}
            onContextMenu={handleContextMenu}
            style={colorStyle}
        >
            <div className="vc-ss-folder-panel-title">
                {name}
                {collapsible && (
                    <span className="vc-ss-v2-card-toggle">{expanded ? "▲" : "▼"}</span>
                )}
            </div>
            <div className="vc-ss-v2-card-items">
                {visibleIds.map(guildId => (
                    <div
                        key={guildId}
                        className="vc-ss-v2-card-item"
                        data-name={GuildStore.getGuild(guildId)?.name ?? guildId}
                    >
                        <GuildIcon guildId={guildId} size={40} />
                    </div>
                ))}
                {collapsible && !expanded && (
                    <div className="vc-ss-v2-card-more">+{total - MAX_PREVIEW}</div>
                )}
            </div>
        </div>
    );
}

function ServerSorterModal({ props }: { props: ModalProps; }) {
    const [folders, setFolders] = React.useState<GuildFolder[]>(() => SortedGuildStore.getGuildFolders());

    React.useEffect(() => {
        enableStyle(style);
        return () => void disableStyle(style);
    }, []);

    async function handleFolderUpdate(folderId: string, name: string, color: number | undefined) {
        await updateFolderProperties(folderId, name, color);
        setFolders(prev => prev.map(f =>
            f.folderId === folderId ? { ...f, folderName: name, folderColor: color } : f
        ));
    }

    return (
        <ModalRoot {...props} size={ModalSize.LARGE} className="vc-server-sorter-modal">
            <ModalHeader>
                <h4 className="vc-ss-modal-title">Server Sorter</h4>
            </ModalHeader>

            <ModalContent className="vc-ss-v2-body">
                {/* folders の並び順通りに描画: フォルダはカード、ungrouped はアイコン直置き */}
                <div className="vc-ss-v2-grid">
                    {folders.map(folder =>
                        folder.folderId !== undefined
                            ? <FolderCard
                                key={folder.folderId}
                                folder={folder}
                                onUpdate={(name, color) => handleFolderUpdate(folder.folderId!, name, color)}
                            />
                            : folder.guildIds.map(guildId => (
                                <div key={guildId} className="vc-ss-v2-bare-item"
                                    data-name={GuildStore.getGuild(guildId)?.name ?? guildId}>
                                    <GuildIcon guildId={guildId} size={40} />
                                </div>
                            ))
                    )}
                </div>
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
