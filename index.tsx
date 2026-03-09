/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { addServerListElement, removeServerListElement, ServerListRenderPosition } from "@api/ServerList";
import { definePluginSettings } from "@api/Settings";
import { disableStyle, enableStyle } from "@api/Styles";
import ErrorBoundary from "@components/ErrorBoundary";
import { FolderIcon } from "@components/Icons";
import { Devs } from "@utils/constants";
import { ModalContent, ModalFooter, ModalHeader, ModalProps, ModalRoot, ModalSize, openModal } from "@utils/modal";
import definePlugin, { OptionType } from "@utils/types";
import { findStoreLazy } from "@webpack";
import { Button, React, showToast, Toasts, Tooltip } from "@webpack/common";

import { applyFolderData, dumpFolderStructure, GuildFolder, moveGuildById, testCombine, testMoveToFolder, testRemoveFromFolderFirst } from "./debug";
import { getTutorialTips, t } from "./i18n";
import style from "./style.css?managed";

// ── ストア ──────────────────────────────────────────────────────────────────

const GuildStore = findStoreLazy("GuildStore");
const SortedGuildStore = findStoreLazy("SortedGuildStore");

// ── プラグイン設定 ───────────────────────────────────────────────────────────

const settings = definePluginSettings({
    tutorialSeen: {
        type: OptionType.BOOLEAN,
        description: "Whether the tutorial has been seen",
        default: false,
        hidden: true,
    },
});

// ── 定数・ユーティリティ ────────────────────────────────────────────────────

const MAX_PREVIEW = 2;

const FOLDER_COLORS = [
    0xE74C3C, 0xE67E22, 0xF1C40F, 0x2ECC71,
    0x1ABC9C, 0x3498DB, 0x9B59B6, 0xE91E63,
];

function colorToHex(color: number): string {
    return `#${(color & 0xFFFFFF).toString(16).padStart(6, "0")}`;
}

function keyOf(folder: GuildFolder): string {
    return folder.folderId !== undefined ? `f:${folder.folderId}` : `b:${folder.guildIds[0]}`;
}

function purgeEmpty(arr: GuildFolder[]): GuildFolder[] {
    return arr.filter(f => f.folderId === undefined || f.guildIds.length > 0);
}

// ── コンポーネント ──────────────────────────────────────────────────────────

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
                <h4 className="vc-ss-modal-title">{t("folderEditTitle")}</h4>
            </ModalHeader>
            <ModalContent className="vc-ss-edit-body">
                <div className="vc-ss-edit-label">{t("folderNameLabel")}</div>
                <input
                    className="vc-ss-edit-input"
                    value={name}
                    onChange={e => setName(e.currentTarget.value)}
                    placeholder={t("folderNamePlaceholder")}
                    maxLength={100}
                    autoFocus
                />
                <div className="vc-ss-edit-label">{t("colorLabel")}</div>
                <div className="vc-ss-edit-colors">
                    <div
                        className={`vc-ss-edit-swatch vc-ss-edit-swatch--none${color === undefined ? " vc-ss-edit-swatch--selected" : ""}`}
                        onClick={() => setColor(undefined)}
                        title={t("colorNone")}
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
                    {t("save")}
                </Button>
                <div style={{ flex: 1 }} />
                <Button color={Button.Colors.PRIMARY} onClick={props.onClose}>
                    {t("cancel")}
                </Button>
            </ModalFooter>
        </ModalRoot>
    );
}

interface FolderDragProps {
    isDragging: boolean;
    isDropTarget: boolean;
    isMergeTarget: boolean;
    onDragStart: (e: React.DragEvent) => void;
    onDragEnd: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
}

function FolderCard({ folder, onUpdate, drag, setRef, dragKey, onItemDragStart, onItemDragEnd }: {
    folder: GuildFolder;
    onUpdate: (name: string, color: number | undefined) => void;
    drag: FolderDragProps;
    setRef: (el: HTMLDivElement | null) => void;
    dragKey: string | null;
    onItemDragStart: (key: string) => void;
    onItemDragEnd: () => void;
}) {
    const name = folder.folderName || t("defaultFolderName");
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
        drag.isMergeTarget ? "vc-ss-v2-card--merge-target" : drag.isDropTarget ? "vc-ss-v2-card--drop-target" : "",
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
                {visibleIds.map(guildId => {
                    const itemKey = `i:${folder.folderId}:${guildId}`;
                    return (
                        <div
                            key={guildId}
                            className={["vc-ss-v2-card-item", dragKey === itemKey ? "vc-ss-v2-card-item--dragging" : ""].filter(Boolean).join(" ")}
                            data-name={GuildStore.getGuild(guildId)?.name ?? guildId}
                            draggable
                            onDragStart={e => { e.stopPropagation(); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", itemKey); onItemDragStart(itemKey); }}
                            onDragEnd={onItemDragEnd}
                        >
                            <GuildIcon guildId={guildId} size={40} />
                        </div>
                    );
                })}
                {collapsible && !expanded && (
                    <div className="vc-ss-v2-card-more">+{total - MAX_PREVIEW}</div>
                )}
            </div>
        </div>
    );
}

function TutorialOverlay({ onDismiss }: { onDismiss: () => void; }) {
    const tips = getTutorialTips();
    return (
        <div className="vc-ss-tutorial-overlay">
            <div className="vc-ss-tutorial-box">
                <h3 className="vc-ss-tutorial-title">{t("tutorialTitle")}</h3>
                <div className="vc-ss-tutorial-subtitle">{t("tutorialSubtitle")}</div>
                <div className="vc-ss-tutorial-grid">
                    {tips.map(tip => (
                        <div key={tip.title} className="vc-ss-tutorial-card">
                            <div className="vc-ss-tutorial-icon">{tip.icon}</div>
                            <div className="vc-ss-tutorial-tip-title">{tip.title}</div>
                            <div className="vc-ss-tutorial-desc">{tip.desc}</div>
                        </div>
                    ))}
                </div>
                <Button color={Button.Colors.BRAND} onClick={onDismiss}>
                    {t("tutorialDismiss")}
                </Button>
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

    el.style.transition = "none";
    el.style.transform = `translate(${dx}px, ${dy}px)`;
    el.getBoundingClientRect(); // reflow
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

    const [showTutorial, setShowTutorial] = React.useState(() => !settings.store.tutorialSeen);
    function dismissTutorial() {
        settings.store.tutorialSeen = true;
        setShowTutorial(false);
    }

    const [dragKey, setDragKey] = React.useState<string | null>(null);
    const [dropKey, setDropKey] = React.useState<string | null>(null);
    const [dropMode, setDropMode] = React.useState<"reorder" | "merge" | null>(null);

    const itemRefs = React.useRef<Map<string, HTMLElement>>(new Map());
    const prevPositions = React.useRef<Map<string, DOMRect>>(new Map());

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
        for (const [key, el] of itemRefs.current) map.set(key, el.getBoundingClientRect());
        prevPositions.current = map;
    }

    function resetDrag() { setDragKey(null); setDropKey(null); setDropMode(null); }

    function handleDrop(fromKey: string, toKey: string) {
        if (fromKey === toKey) return;

        // ── ドロップ先がフォルダ ──
        if (toKey.startsWith("f:")) {
            // 中央ゾーン: サーバー1個をフォルダに追加（f:→f: は対象外）
            if (dropMode === "merge" && !fromKey.startsWith("f:")) {
                const guildId = fromKey.startsWith("b:") ? fromKey.slice(2) : fromKey.split(":")[2];
                const fromFolderKey = fromKey.startsWith("i:") ? `f:${fromKey.split(":")[1]}` : null;
                if (fromFolderKey === toKey) { resetDrag(); return; }
                setFolders(prev => {
                    let arr = prev.map(f => {
                        if (fromFolderKey && keyOf(f) === fromFolderKey)
                            return { ...f, guildIds: f.guildIds.filter(id => id !== guildId) };
                        if (keyOf(f) === toKey)
                            return { ...f, guildIds: [...f.guildIds, guildId] };
                        return f;
                    });
                    if (fromKey.startsWith("b:"))
                        arr = arr.filter(f => !(f.folderId === undefined && f.guildIds[0] === guildId));
                    return purgeEmpty(arr);
                });
                resetDrag(); return;
            }
            // 端ゾーン (i:): フォルダから取り出して対象フォルダの前に ungrouped 挿入
            if (fromKey.startsWith("i:")) {
                const [, fromFolderId, guildId] = fromKey.split(":");
                const fromFolderKey = `f:${fromFolderId}`;
                if (fromFolderKey === toKey) { resetDrag(); return; }
                capturePositions();
                setFolders(prev => {
                    const removed = purgeEmpty(prev.map(f =>
                        keyOf(f) === fromFolderKey ? { ...f, guildIds: f.guildIds.filter(id => id !== guildId) } : f
                    ));
                    const toIdx = removed.findIndex(f => keyOf(f) === toKey);
                    const result = [...removed];
                    result.splice(toIdx === -1 ? result.length : toIdx, 0, { folderId: undefined, guildIds: [guildId] });
                    return result;
                });
                resetDrag(); return;
            }
            // 端ゾーン (f: / b:): カード・bare item を対象フォルダの前に並び替え
            capturePositions();
            setFolders(prev => {
                const arr = [...prev];
                const fromIdx = arr.findIndex(f => keyOf(f) === fromKey);
                if (fromIdx === -1) return prev;
                const [item] = arr.splice(fromIdx, 1);
                const toIdx = arr.findIndex(f => keyOf(f) === toKey);
                if (toIdx === -1) return prev;
                arr.splice(toIdx, 0, item);
                return arr;
            });
            resetDrag(); return;
        }

        // ── ドロップ先が bare item ──
        if (fromKey.startsWith("i:")) {
            // フォルダ内サーバーを ungrouped へ取り出す
            const [, fromFolderId, guildId] = fromKey.split(":");
            capturePositions();
            setFolders(prev => {
                const removed = purgeEmpty(prev.map(f =>
                    keyOf(f) === `f:${fromFolderId}` ? { ...f, guildIds: f.guildIds.filter(id => id !== guildId) } : f
                ));
                const toIdx = removed.findIndex(f => keyOf(f) === toKey);
                const result = [...removed];
                result.splice(toIdx === -1 ? result.length : toIdx, 0, { folderId: undefined, guildIds: [guildId] });
                return result;
            });
            resetDrag(); return;
        }

        // 通常の並び替え (f:↔b:, b:↔b:)
        capturePositions();
        setFolders(prev => {
            const arr = [...prev];
            const fromIdx = arr.findIndex(f => keyOf(f) === fromKey);
            const toIdx = arr.findIndex(f => keyOf(f) === toKey);
            if (fromIdx === -1 || toIdx === -1) return prev;
            const [item] = arr.splice(fromIdx, 1);
            arr.splice(arr.findIndex(f => keyOf(f) === toKey), 0, item);
            return arr;
        });
        resetDrag();
    }

    function makeDragHandlers(itemKey: string): FolderDragProps {
        const dragFolderKey = dragKey?.startsWith("i:") ? `f:${dragKey.split(":")[1]}` : null;
        const isFolder = itemKey.startsWith("f:");
        return {
            isDragging: dragKey === itemKey || dragFolderKey === itemKey,
            isDropTarget: dropKey === itemKey && (!isFolder || dropMode === "reorder") && itemKey !== dragFolderKey,
            isMergeTarget: dropKey === itemKey && isFolder && dropMode === "merge",
            onDragStart: e => {
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", itemKey);
                setDragKey(itemKey);
            },
            onDragEnd: resetDrag,
            onDragOver: e => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                if (dropKey !== itemKey) setDropKey(itemKey);
                if (isFolder) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const relX = (e.clientX - rect.left) / rect.width;
                    const mode: "merge" | "reorder" = (relX < 0.3 || relX > 0.7) ? "reorder" : "merge";
                    if (dropMode !== mode) setDropMode(mode);
                }
            },
            onDragLeave: e => {
                if (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget as Node)) {
                    setDropKey(null);
                    setDropMode(null);
                }
            },
            onDrop: e => { e.preventDefault(); if (dragKey) handleDrop(dragKey, itemKey); },
        };
    }

    function makeRef(k: string) {
        return (el: HTMLElement | null) => {
            if (el) itemRefs.current.set(k, el);
            else itemRefs.current.delete(k);
        };
    }

    function handleCreateGroup() {
        const newFolderId = String(Math.floor(Math.random() * 9000000000) + 1000000000);
        setFolders(prev => [...prev, { folderId: newFolderId, guildIds: [] }]);
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
                <div style={{ flex: 1 }} />
                <button className="vc-ss-info-btn" onClick={() => setShowTutorial(true)} title={t("viewHelp")}>?</button>
            </ModalHeader>

            <ModalContent className="vc-ss-v2-body">
                {showTutorial && <TutorialOverlay onDismiss={dismissTutorial} />}
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
                                dragKey={dragKey}
                                onItemDragStart={key => setDragKey(key)}
                                onItemDragEnd={resetDrag}
                            />;
                        } else {
                            const guildId = folder.guildIds[0];
                            const drag = makeDragHandlers(k);
                            return (
                                <div
                                    key={guildId}
                                    ref={makeRef(k)}
                                    className={[
                                        "vc-ss-v2-bare-item",
                                        drag.isDragging ? "vc-ss-v2-bare-item--dragging" : "",
                                        drag.isDropTarget ? "vc-ss-v2-bare-item--drop-target" : "",
                                    ].filter(Boolean).join(" ")}
                                    draggable
                                    onDragStart={e => { e.stopPropagation(); drag.onDragStart(e); }}
                                    onDragEnd={drag.onDragEnd}
                                    onDragOver={drag.onDragOver}
                                    onDragLeave={drag.onDragLeave}
                                    onDrop={drag.onDrop}
                                >
                                    <div className="vc-ss-v2-bare-icon" data-name={GuildStore.getGuild(guildId)?.name ?? guildId}>
                                        <GuildIcon guildId={guildId} size={40} />
                                    </div>
                                </div>
                            );
                        }
                    })}
                </div>
            </ModalContent>

            <ModalFooter className="vc-ss-footer">
                {/* TODO: offlineでもsuccessになる */}
                <Button color={Button.Colors.GREEN} onClick={async () => {
                    try {
                        await applyFolderData(folders);
                        showToast(t("applySuccess"), Toasts.Type.SUCCESS);
                    } catch (e) {
                        showToast(`${t("applyFailure")}: ${e instanceof Error ? e.message : e}`, Toasts.Type.FAILURE);
                    }
                }}>
                    {t("applySort")}
                </Button>
                <Button color={Button.Colors.BRAND} onClick={handleCreateGroup}>
                    {t("createGroup")}
                </Button>
                <Button color={Button.Colors.PRIMARY} onClick={props.onClose}>
                    {t("close")}
                </Button>
                <Button color={Button.Colors.RED} onClick={() => (window as any).DiscordNative?.app?.relaunch()}>
                    {t("restart")}
                </Button>
            </ModalFooter>
        </ModalRoot>
    );
}

function SorterListButton() {
    return (
        <Tooltip text="Server Sorter" position="right" spacing={-8} tooltipClassName="vc-ss-tooltip">
            {({ onMouseEnter, onMouseLeave }) => (
                <div
                    className="vc-ss-list-btn"
                    style={{ width: "var(--custom-guild-list-width)", justifyContent: "center", display: "flex", position: "relative", margin: 0 }}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                    onClick={() => openModal(modalProps => <ServerSorterModal props={modalProps} />)}
                    role="button"
                    aria-label="Server Sorter"
                >
                    <div style={{ insetInlineStart: 0, position: "absolute", top: 0, alignItems: "center", contain: "layout size", display: "flex", justifyContent: "flex-start", overflow: "hidden", width: "8px", height: "100%" }}></div>
                    <span>
                        <div className="vc-server-sorter-guild-wrapper">
                            <FolderIcon className="vc-ss-list-btn-icon" width={24} height={24} style={{ position: "absolute", x: 0, y: 0, width: "40px" }} />
                        </div>
                    </span>
                </div>
            )}
        </Tooltip>
    );
}

export default definePlugin({
    name: "ServerSorter",
    description: "Sort Discord servers via drag & drop GUI",
    authors: [Devs.Ven],
    dependencies: ["ServerListAPI"],
    settings,

    patches: [],

    renderListButton: ErrorBoundary.wrap(SorterListButton, { noop: true }),

    start() {
        console.log("[ServerSorter] enableStyle", enableStyle(style));
        addServerListElement(ServerListRenderPosition.Above, this.renderListButton);
        (window as any).ServerSorterDebug = {
            dumpFolderStructure,
            moveGuildById,
            testMove: testMoveToFolder,
            testCombine,
            testRemoveFromFolderFirst,
            openModal: () => openModal(props => <ServerSorterModal props={props} />),
            resetTutorial: () => { settings.store.tutorialSeen = false; },
        };
    },

    stop() {
        console.log("[ServerSorter] disableStyle", disableStyle(style));
        removeServerListElement(ServerListRenderPosition.Above, this.renderListButton);
        delete (window as any).ServerSorterDebug;
    },
});
