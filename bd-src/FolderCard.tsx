import type * as R from "react";
import type { GuildFolder, GuildStoreType, TranslateFn } from "./types";
import { MAX_PREVIEW } from "./constants";
import { colorToHex } from "./utils";
import { makeGuildIcon } from "./GuildIcon";

const React = BdApi.React;
const ce = React.createElement;

export interface DragHandlers {
    isDragging: boolean;
    isDropTarget: boolean;
    isMergeTarget: boolean;
    onDragStart: R.DragEventHandler<HTMLDivElement>;
    onDragEnd: R.DragEventHandler<HTMLDivElement>;
    onDragOver: R.DragEventHandler<HTMLDivElement>;
    onDragLeave: R.DragEventHandler<HTMLDivElement>;
    onDrop: R.DragEventHandler<HTMLDivElement>;
}

interface FolderCardProps {
    folder: GuildFolder;
    onUpdate: (name: string, color: number | undefined) => void;
    drag: DragHandlers;
    setRef: R.RefCallback<HTMLDivElement>;
    dragKey: string | null;
    onItemDragStart: (key: string) => void;
    onItemDragEnd: () => void;
    openFolderEditModal: (folder: GuildFolder, onSave: (name: string, color: number | undefined) => void) => void;
}

export function makeFolderCard(GuildStore: GuildStoreType, t: TranslateFn) {
    const { useState, useRef } = React;
    const GuildIcon = makeGuildIcon(GuildStore);

    return function FolderCard({
        folder, onUpdate, drag, setRef, dragKey, onItemDragStart, onItemDragEnd, openFolderEditModal,
    }: FolderCardProps) {
        const name = folder.folderName || t("defaultFolderName");
        const total = folder.guildIds.length;
        const collapsible = total > MAX_PREVIEW;
        const [expanded, setExpanded] = useState(false);
        const visibleIds = collapsible && !expanded ? folder.guildIds.slice(0, MAX_PREVIEW) : folder.guildIds;
        const hasDragged = useRef(false);
        const hex = folder.folderColor != null ? colorToHex(folder.folderColor) : null;
        const colorStyle = hex ? { borderColor: `${hex}66`, background: `${hex}14` } : undefined;
        const className = [
            "vc-ss-v2-card",
            collapsible ? "vc-ss-v2-card--collapsible" : "",
            drag.isDragging ? "vc-ss-v2-card--dragging" : "",
            drag.isMergeTarget ? "vc-ss-v2-card--merge-target" : drag.isDropTarget ? "vc-ss-v2-card--drop-target" : "",
        ].filter(Boolean).join(" ");

        return ce("div", {
            ref: setRef, className, draggable: true, style: colorStyle,
            onDragStart: (e: R.DragEvent<HTMLDivElement>) => {
                e.stopPropagation();
                hasDragged.current = true;
                drag.onDragStart(e);
            },
            onDragEnd: (e: R.DragEvent<HTMLDivElement>) => {
                drag.onDragEnd(e);
                setTimeout(() => { hasDragged.current = false; }, 0);
            },
            onDragOver: drag.onDragOver,
            onDragLeave: drag.onDragLeave,
            onDrop: drag.onDrop,
            onClick: collapsible ? () => { if (!hasDragged.current) setExpanded(v => !v); } : undefined,
            onMouseDown: (e: R.MouseEvent) => { if (e.button === 2) e.stopPropagation(); },
            onContextMenu: (e: R.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                openFolderEditModal(folder, onUpdate);
            },
        },
            ce("div", { className: "vc-ss-folder-panel-title" },
                name,
                collapsible && ce("span", { className: "vc-ss-v2-card-toggle" }, expanded ? "▲" : "▼")
            ),
            ce("div", { className: "vc-ss-v2-card-items" },
                ...visibleIds.map(guildId => {
                    const itemKey = `i:${folder.folderId}:${guildId}`;
                    return ce("div", {
                        key: guildId,
                        className: ["vc-ss-v2-card-item", dragKey === itemKey ? "vc-ss-v2-card-item--dragging" : ""].filter(Boolean).join(" "),
                        "data-name": GuildStore.getGuild(guildId)?.name ?? guildId,
                        draggable: true,
                        onDragStart: (e: R.DragEvent<HTMLDivElement>) => {
                            e.stopPropagation();
                            e.dataTransfer.effectAllowed = "move";
                            e.dataTransfer.setData("text/plain", itemKey);
                            onItemDragStart(itemKey);
                        },
                        onDragEnd: onItemDragEnd,
                    }, ce(GuildIcon, { guildId, size: 40 }));
                }),
                collapsible && !expanded && ce("div", { className: "vc-ss-v2-card-more" }, `+${total - MAX_PREVIEW}`)
            )
        );
    };
}
