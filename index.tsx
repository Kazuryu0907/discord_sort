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

import { applyFolderData, dumpFolderStructure, GuildFolder, moveGuildById, testCombine, testMoveToFolder, testRemoveFromFolderFirst } from "./debug";
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

const MAX_PREVIEW = 2;

function colorToHex(color: number): string {
    return `#${(color & 0xFFFFFF).toString(16).padStart(6, "0")}`;
}

const FOLDER_COLORS = [
    0xE74C3C, 0xE67E22, 0xF1C40F, 0x2ECC71,
    0x1ABC9C, 0x3498DB, 0x9B59B6, 0xE91E63,
];

function keyOf(folder: GuildFolder): string {
    return folder.folderId !== undefined ? `f:${folder.folderId}` : `b:${folder.guildIds[0]}`;
}

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
                <Button color={Button.Colors.BRAND} onClick={() => { onSave(name, color); props.onClose(); }}>
                    保存
                </Button>
                <div style={{ flex: 1 }} />
                <Button color={Button.Colors.PRIMARY} onClick={props.onClose}>
                    キャンセル
                </Button>
            </ModalFooter>
        </ModalRoot>
    );
}

interface FolderDragProps {
    isDragging: boolean;
    isDropTarget: boolean;
    onDragStart: (e: React.DragEvent) => void;
    onDragEnd: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
}

function FolderCard({ folder, onUpdate, drag, setRef }: {
    folder: GuildFolder;
    onUpdate: (name: string, color: number | undefined) => void;
    drag: FolderDragProps;
    setRef: (el: HTMLDivElement | null) => void;
}) {
    const name = folder.folderName || (folder.folderId ? "フォルダ" : "グループなし");
    const total = folder.guildIds.length;
    const collapsible = total > MAX_PREVIEW;
    const [expanded, setExpanded] = React.useState(false);
    const visibleIds = collapsible && !expanded ? folder.guildIds.slice(0, MAX_PREVIEW) : folder.guildIds;
    const hasDragged = React.useRef(false);

    const hex = folder.folderColor != null ? colorToHex(folder.folderColor) : null;
    const colorStyle = hex ? { borderColor: `${hex}66`, background: `${hex}14` } : undefined;

    function handleContextMenu(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        openModal(modalProps => (
            <FolderEditModal props={modalProps} folder={folder} onSave={onUpdate} />
        ));
    }

    const className = [
        "vc-ss-v2-card",
        collapsible ? "vc-ss-v2-card--collapsible" : "",
        drag.isDragging ? "vc-ss-v2-card--dragging" : "",
        drag.isDropTarget ? "vc-ss-v2-card--drop-target" : "",
    ].filter(Boolean).join(" ");

    return (
        <div
            ref={setRef}
            className={className}
            draggable
            onDragStart={e => { e.stopPropagation(); hasDragged.current = true; drag.onDragStart(e); }}
            onDragEnd={e => { drag.onDragEnd(e); setTimeout(() => { hasDragged.current = false; }, 0); }}
            onDragOver={drag.onDragOver}
            onDragLeave={drag.onDragLeave}
            onDrop={drag.onDrop}
            onClick={collapsible ? () => { if (!hasDragged.current) setExpanded(v => !v); } : undefined}
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

/** FLIP アニメーション: el を旧位置から新位置へスライドさせる */
function flipAnimate(el: HTMLElement, prevRect: DOMRect) {
    const currRect = el.getBoundingClientRect();
    const dx = prevRect.left - currRect.left;
    const dy = prevRect.top - currRect.top;
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;

    // Invert: 旧位置に瞬時に戻す（transition なし）
    el.style.transition = "none";
    el.style.transform = `translate(${dx}px, ${dy}px)`;
    // reflow を強制して transform を確定させる
    el.getBoundingClientRect();
    // Play: 新位置へアニメーション
    el.style.transition = "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)";
    el.style.transform = "";
    el.addEventListener("transitionend", () => { el.style.transition = ""; }, { once: true });
}

function ServerSorterModal({ props }: { props: ModalProps; }) {
    const [folders, setFolders] = React.useState<GuildFolder[]>(() => {
        const raw: GuildFolder[] = SortedGuildStore.getGuildFolders();
        return raw.flatMap(f =>
            f.folderId !== undefined
                ? [f]
                : f.guildIds.map(guildId => ({ folderId: undefined, guildIds: [guildId] }))
        );
    });

    const [dragKey, setDragKey] = React.useState<string | null>(null);
    const [dropKey, setDropKey] = React.useState<string | null>(null);

    // FLIP: アイテムの DOM 要素と「ドロップ前の位置」を保持
    const itemRefs = React.useRef<Map<string, HTMLElement>>(new Map());
    const prevPositions = React.useRef<Map<string, DOMRect>>(new Map());

    React.useEffect(() => {
        enableStyle(style);
        return () => void disableStyle(style);
    }, []);

    // folders が変わった後（DOM 更新済み・描画前）に FLIP を実行
    React.useLayoutEffect(() => {
        if (prevPositions.current.size === 0) return;
        for (const [key, el] of itemRefs.current) {
            const prev = prevPositions.current.get(key);
            if (prev) flipAnimate(el, prev);
        }
        prevPositions.current = new Map();
    }, [folders]);

    function capturePositions() {
        const map = new Map<string, DOMRect>();
        for (const [key, el] of itemRefs.current) {
            map.set(key, el.getBoundingClientRect());
        }
        prevPositions.current = map;
    }

    function handleDrop(fromKey: string, toKey: string) {
        if (fromKey === toKey) return;
        capturePositions(); // First: ドロップ前の位置を記録
        setFolders(prev => {
            const arr = [...prev];
            const fromIdx = arr.findIndex(f => keyOf(f) === fromKey);
            const toIdx = arr.findIndex(f => keyOf(f) === toKey);
            if (fromIdx === -1 || toIdx === -1) return prev;
            const [item] = arr.splice(fromIdx, 1);
            const newToIdx = arr.findIndex(f => keyOf(f) === toKey);
            arr.splice(newToIdx, 0, item);
            return arr;
        });
        setDragKey(null);
        setDropKey(null);
    }

    function makeDragHandlers(itemKey: string): FolderDragProps {
        return {
            isDragging: dragKey === itemKey,
            isDropTarget: dropKey === itemKey,
            onDragStart: e => {
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", itemKey);
                setDragKey(itemKey);
            },
            onDragEnd: () => { setDragKey(null); setDropKey(null); },
            onDragOver: e => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; if (dropKey !== itemKey) setDropKey(itemKey); },
            onDragLeave: e => { if (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget as Node)) setDropKey(null); },
            onDrop: e => { e.preventDefault(); if (dragKey) handleDrop(dragKey, itemKey); },
        };
    }

    function makeRef(k: string) {
        return (el: HTMLElement | null) => {
            if (el) itemRefs.current.set(k, el);
            else itemRefs.current.delete(k);
        };
    }

    function handleFolderUpdate(folderId: string, name: string, color: number | undefined) {
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
                <div className="vc-ss-v2-grid">
                    {folders.map(folder => {
                        const k = keyOf(folder);
                        if (folder.folderId !== undefined) {
                            return <FolderCard
                                key={folder.folderId}
                                folder={folder}
                                onUpdate={(name, color) => handleFolderUpdate(folder.folderId!, name, color)}
                                drag={makeDragHandlers(k)}
                                setRef={makeRef(k) as (el: HTMLDivElement | null) => void}
                            />;
                        } else {
                            const guildId = folder.guildIds[0];
                            return (
                                <div
                                    key={guildId}
                                    ref={makeRef(k)}
                                    className={[
                                        "vc-ss-v2-bare-item",
                                        dragKey === k ? "vc-ss-v2-bare-item--dragging" : "",
                                        dropKey === k ? "vc-ss-v2-bare-item--drop-target" : "",
                                    ].filter(Boolean).join(" ")}
                                    data-name={GuildStore.getGuild(guildId)?.name ?? guildId}
                                    draggable
                                    onDragStart={e => { e.stopPropagation(); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", k); setDragKey(k); }}
                                    onDragEnd={() => { setDragKey(null); setDropKey(null); }}
                                    onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; if (dropKey !== k) setDropKey(k); }}
                                    onDragLeave={e => { if (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget as Node)) setDropKey(null); }}
                                    onDrop={e => { e.preventDefault(); if (dragKey) handleDrop(dragKey, k); }}
                                >
                                    <GuildIcon guildId={guildId} size={40} />
                                </div>
                            );
                        }
                    })}
                </div>
            </ModalContent>

            <ModalFooter>
                <Button color={Button.Colors.GREEN} onClick={() => applyFolderData(folders)}>
                {/* <Button color={Button.Colors.GREEN} onClick={() => {}}> */}
                    並び替えを適用
                </Button>
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
