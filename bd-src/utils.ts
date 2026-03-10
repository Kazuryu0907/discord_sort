import type { GuildFolder } from "./types";

export function colorToHex(c: number): string {
    return `#${(c & 0xFFFFFF).toString(16).padStart(6, "0")}`;
}

export function keyOf(f: GuildFolder): string {
    return f.folderId !== undefined ? `f:${f.folderId}` : `b:${f.guildIds[0]}`;
}

export function purgeEmpty(arr: GuildFolder[]): GuildFolder[] {
    return arr.filter(f => f.folderId === undefined || f.guildIds.length > 0);
}

export function flipAnimate(el: HTMLElement, prev: DOMRect): void {
    const curr = el.getBoundingClientRect();
    const dx = prev.left - curr.left;
    const dy = prev.top - curr.top;
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
    el.style.transition = "none";
    el.style.transform = `translate(${dx}px,${dy}px)`;
    el.getBoundingClientRect(); // force reflow
    el.style.transition = "transform 0.35s cubic-bezier(0.4,0,0.2,1)";
    el.style.transform = "";
    el.addEventListener("transitionend", () => { el.style.transition = ""; }, { once: true });
}
