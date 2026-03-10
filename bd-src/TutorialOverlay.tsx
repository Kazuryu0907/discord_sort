import type { TranslateFn } from "./types";
import { Btn } from "./Btn";

const React = BdApi.React;
const ce = React.createElement;

interface TipItem {
    icon: string;
    title: string;
    desc: string;
}

interface TutorialOverlayProps {
    onDismiss: () => void;
}

export function makeTutorialOverlay(t: TranslateFn) {
    const tips: TipItem[] = [
        { icon: "↕️", title: t("tip0Title"), desc: t("tip0Desc") },
        { icon: "📂", title: t("tip1Title"), desc: t("tip1Desc") },
        { icon: "➕", title: t("tip2Title"), desc: t("tip2Desc") },
        { icon: "✏️", title: t("tip3Title"), desc: t("tip3Desc") },
    ];

    return function TutorialOverlay({ onDismiss }: TutorialOverlayProps) {
        return ce("div", { className: "vc-ss-tutorial-overlay" },
            ce("div", { className: "vc-ss-tutorial-box" },
                ce("h3", { className: "vc-ss-tutorial-title" }, t("tutorialTitle")),
                ce("div", { className: "vc-ss-tutorial-subtitle" }, t("tutorialSubtitle")),
                ce("div", { className: "vc-ss-tutorial-grid" },
                    ...tips.map(tip => ce("div", { key: tip.title, className: "vc-ss-tutorial-card" },
                        ce("div", { className: "vc-ss-tutorial-icon" }, tip.icon),
                        ce("div", { className: "vc-ss-tutorial-tip-title" }, tip.title),
                        ce("div", { className: "vc-ss-tutorial-desc" }, tip.desc)
                    ))
                ),
                ce(Btn, { color: Btn.Colors.BRAND, onClick: onDismiss }, t("tutorialDismiss"))
            )
        );
    };
}
