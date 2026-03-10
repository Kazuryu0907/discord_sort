export interface GuildFolder {
    folderId: string | undefined;
    guildIds: string[];
    folderName?: string;
    folderColor?: number;
}

export interface Guild {
    id: string;
    name: string;
    icon?: string | null;
}

export interface GuildStoreType {
    getGuild(guildId: string): Guild | null;
}

export interface SortedGuildStoreType {
    getGuildFolders(): GuildFolder[];
}

export interface GuildFolderEntry {
    id?: { value: string };
    name?: { value: string };
    color?: { value: number };
    guildIds: string[];
}

export interface GuildFoldersProto {
    folders: GuildFolderEntry[];
}

export interface SettingsStoreType {
    ProtoClass?: { typeName?: string };
    updateAsync(
        key: string,
        updater: (cur: GuildFoldersProto) => GuildFoldersProto,
        flags: number
    ): Promise<void>;
}

export interface LocaleStoreType {
    locale: string;
}

export type DropMode = "reorder" | "merge" | null;
export type TranslateFn = (key: string) => string;
export type CloseModal = () => void;
export type OpenCustomModal = (
    render: (close: CloseModal) => ReactTypes.ReactElement,
    opts?: { small?: boolean }
) => CloseModal;

// bring in ReactTypes for the OpenCustomModal signature above
import type * as ReactTypes from "react";
