import type * as R from "react";
import type { GuildFolder, GuildStoreType, SortedGuildStoreType, SettingsStoreType, LocaleStoreType, OpenCustomModal } from "./types";
import { PLUGIN_ID, PLUGIN_DESC, PLUGIN_VER, PLUGIN_AUTHOR, STRINGS } from "./constants";
import { CSS } from "./css";
import { makeServerSorterModal } from "./ServerSorterModal";
import { injectSorterButton, removeSorterButton } from "./SorterButton";

class ServerSorter {
    private _guildStore: GuildStoreType | null = null;
    private _sortedGuildStore: SortedGuildStoreType | null = null;
    private _settingsStore: SettingsStoreType | null = null;
    private _localeStore: LocaleStoreType | null = null;
    private _btnContainer: HTMLElement | null = null;

    getName()        { return PLUGIN_ID; }
    getDescription() { return PLUGIN_DESC; }
    getVersion()     { return PLUGIN_VER; }
    getAuthor()      { return PLUGIN_AUTHOR; }

    start() {
        BdApi.DOM.addStyle(PLUGIN_ID, CSS);
        this._loadMods();
        this._injectButton();
        (window as any).ServerSorterDebug = {
            openModal: () => this._openSorterModal(),
            applyFolderData: (f: GuildFolder[]) => this._applyFolderData(f),
        };
    }

    stop() {
        BdApi.DOM.removeStyle(PLUGIN_ID);
        this._removeButton();
delete (window as any).ServerSorterDebug;
    }

    private _loadMods() {
        const W = BdApi.Webpack;
        this._guildStore       = W.getStore?.("GuildStore") as GuildStoreType ?? null;
        this._sortedGuildStore = W.getStore?.("SortedGuildStore") as SortedGuildStoreType ?? null;
        this._localeStore      = W.getStore?.("LocaleStore") as LocaleStoreType ?? null;

        // PreloadedUserSettings store (try multiple methods)
        this._settingsStore = (
            W.getModule?.(m => (m as any)?.ProtoClass?.typeName?.includes?.("PreloadedUserSettings")) ??
            W.getModule?.(m => (m as any)?.ProtoClass?.typeName?.includes?.("PreloadedUserSettings"), { searchExports: true }) ??
            W.getModule?.(m => typeof (m as any)?.updateAsync === "function" && (m as any)?.ProtoClass?.typeName) ??
            (W.getModules?.(m => (m as any)?.ProtoClass?.typeName?.includes?.("PreloadedUserSettings")) ?? [])[0] ??
            null
        ) as SettingsStoreType | null;

        console.log("[ServerSorter] modules:", {
            GuildStore: !!this._guildStore,
            SortedGuildStore: !!this._sortedGuildStore,
            settingsStore: !!this._settingsStore,
            settingsTypeName: this._settingsStore?.ProtoClass?.typeName,
        });
    }

    private _t(key: string): string {
        const locale = this._localeStore?.locale ?? "en";
        const lang = locale.startsWith("ja") ? "ja" : "en";
        const strings = STRINGS[lang] as Record<string, string>;
        return strings[key] ?? (STRINGS.en as Record<string, string>)[key] ?? key;
    }

    private _injectButton() {
        const btn = injectSorterButton(
            () => this._openSorterModal(),
            () => this._injectButton(),
        );
        if (btn) this._btnContainer = btn;
    }

    private _removeButton() {
        removeSorterButton(this._btnContainer);
        this._btnContainer = null;
    }

    private async _applyFolderData(folders: GuildFolder[]): Promise<void> {
        const store = this._settingsStore;
        if (!store) throw new Error("PreloadedUserSettings store が見つかりません");
        await store.updateAsync("guildFolders", (cur) => {
            cur.folders.length = 0;
            for (const f of folders) {
                if (f.folderId !== undefined) {
                    const entry: any = { id: { value: String(f.folderId) }, guildIds: [...f.guildIds] };
                    if (f.folderName) entry.name = { value: f.folderName };
                    if (f.folderColor !== undefined) entry.color = { value: f.folderColor };
                    cur.folders.push(entry);
                } else {
                    for (const guildId of f.guildIds) cur.folders.push({ guildIds: [guildId] });
                }
            }
            return cur;
        }, 0);
    }

    private _mountModal(element: R.ReactElement, container: Element): () => void {
        if (BdApi.ReactDOM?.createRoot) {
            const root = BdApi.ReactDOM.createRoot(container);
            root.render(element);
            return () => { root.unmount(); container.remove(); };
        }
        BdApi.ReactDOM.render(element, container);
        return () => { BdApi.ReactDOM.unmountComponentAtNode(container); container.remove(); };
    }

    private _openCustomModal: OpenCustomModal = (renderContent, { small = false } = {}) => {
        const container = document.createElement("div");
        document.body.appendChild(container);
        const React = BdApi.React;
        const ce = React.createElement;
        let unmount: (() => void) | undefined;
        const close = () => unmount?.();
        const overlay = ce("div", {
            className: "ss-overlay",
            onClick: (e: R.MouseEvent) => { if (e.target === e.currentTarget) close(); },
        }, ce("div", { className: `ss-window${small ? " ss-window--small" : ""}` },
            renderContent(close)
        ));
        unmount = this._mountModal(overlay, container);
        return close;
    };

    private _openSorterModal() {
        if (!this._guildStore || !this._sortedGuildStore) {
            BdApi.UI.showToast("ServerSorter: stores not loaded", { type: "error" });
            return;
        }
        const t = (k: string) => this._t(k);
        const ServerSorterModal = makeServerSorterModal({
            GuildStore: this._guildStore,
            SortedGuildStore: this._sortedGuildStore,
            t,
            openCustomModal: this._openCustomModal,
            applyFolderData: (f) => this._applyFolderData(f),
        });
        this._openCustomModal(close => BdApi.React.createElement(ServerSorterModal, { onClose: close }));
    }
}

export default ServerSorter;
