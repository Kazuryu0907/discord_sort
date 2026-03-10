import type * as R from "react";

const React = BdApi.React;
const ce = React.createElement;

export type BtnColor = "green" | "brand" | "primary" | "red";

export interface BtnProps {
    color?: BtnColor;
    onClick?: () => void;
    children?: R.ReactNode;
}

export const BtnColors = {
    GREEN:   "green"   as const,
    BRAND:   "brand"   as const,
    PRIMARY: "primary" as const,
    RED:     "red"     as const,
};

const _Btn = (props: BtnProps) =>
    ce("button", {
        className: `ss-btn ss-btn--${props.color ?? "brand"}`,
        onClick: props.onClick,
    }, props.children);

export const Btn = Object.assign(_Btn, { Colors: BtnColors });
