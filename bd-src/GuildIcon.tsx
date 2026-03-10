import type { GuildStoreType } from "./types";

const React = BdApi.React;
const ce = React.createElement;

interface GuildIconProps {
    guildId: string;
    size?: number;
}

export function makeGuildIcon(GuildStore: GuildStoreType) {
    return function GuildIcon({ guildId, size = 32 }: GuildIconProps) {
        const guild = GuildStore.getGuild(guildId);
        if (guild?.icon) {
            return ce("img", {
                src: `https://cdn.discordapp.com/icons/${guildId}/${guild.icon}.png?size=32`,
                style: { width: size, height: size, borderRadius: "50%", flexShrink: 0 },
            });
        }
        return ce("div", {
            style: {
                width: size, height: size, borderRadius: "50%", flexShrink: 0,
                background: "var(--background-base-low)", display: "flex",
                alignItems: "center", justifyContent: "center",
                fontSize: size * 0.4, color: "var(--text-strong)",
            },
        }, guild?.name?.[0] ?? "?");
    };
}
