import type { GuildFolder, TranslateFn, OpenCustomModal } from "./types";
import { FOLDER_COLORS } from "./constants";
import { colorToHex } from "./utils";
import { Btn } from "./Btn";

const React = BdApi.React;
const ce = React.createElement;

interface FolderEditContentProps {
    folder: GuildFolder;
    onSave: (name: string, color: number | undefined) => void;
    onClose: () => void;
}

function makeFolderEditContent(t: TranslateFn) {
    const { useState } = React;
    return function FolderEditContent({ folder, onSave, onClose }: FolderEditContentProps) {
        const [name, setName] = useState(folder.folderName ?? "");
        const [color, setColor] = useState<number | undefined>(folder.folderColor);

        return ce(React.Fragment, null,
            ce("div", { className: "ss-header" },
                ce("h4", { className: "vc-ss-modal-title" }, t("folderEditTitle"))
            ),
            ce("div", { className: "ss-content vc-ss-edit-body" },
                ce("div", { className: "vc-ss-edit-label" }, t("folderNameLabel")),
                ce("input", {
                    className: "vc-ss-edit-input",
                    value: name,
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setName(e.currentTarget.value),
                    placeholder: t("folderNamePlaceholder"),
                    maxLength: 100,
                    autoFocus: true,
                }),
                ce("div", { className: "vc-ss-edit-label" }, t("colorLabel")),
                ce("div", { className: "vc-ss-edit-colors" },
                    // ce("div", {
                    //     className: `vc-ss-edit-swatch vc-ss-edit-swatch--none${color === undefined ? " vc-ss-edit-swatch--selected" : ""}`,
                    //     onClick: () => setColor(undefined),
                    //     title: t("colorNone"),
                    // }),
                    ...FOLDER_COLORS.map(c => ce("div", {
                        key: c,
                        className: `vc-ss-edit-swatch${color === c ? " vc-ss-edit-swatch--selected" : ""}`,
                        style: { background: colorToHex(c) },
                        onClick: () => setColor(c),
                        title: colorToHex(c),
                    }))
                )
            ),
            ce("div", { className: "ss-footer" },
                ce(Btn, { color: Btn.Colors.BRAND, onClick: () => { onSave(name, color); onClose(); } }, t("save")),
                ce("div", { style: { flex: 1 } }),
                ce(Btn, { color: Btn.Colors.PRIMARY, onClick: onClose }, t("cancel"))
            )
        );
    };
}

export function makeOpenFolderEditModal(openCustomModal: OpenCustomModal, t: TranslateFn) {
    const FolderEditContent = makeFolderEditContent(t);
    return function openFolderEditModal(
        folder: GuildFolder,
        onSave: (name: string, color: number | undefined) => void
    ): void {
        openCustomModal(
            close => ce(FolderEditContent, { folder, onSave, onClose: close }),
            { small: true }
        );
    };
}
