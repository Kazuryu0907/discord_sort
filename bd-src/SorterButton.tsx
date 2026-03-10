// tsconfig の jsxFactory: "React.createElement" により、
// BdApi.React が JSX のファクトリとして使われる
const React = BdApi.React;

const BUTTON_ID = "ss-sorter-btn";

// ── コンポーネント定義 ─────────────────────────────────────────────────────────

function FolderIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40px"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#45a366"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
    );
}

function SorterButton({ onClick }: { onClick: () => void }) {
    return (
        <div
            title="Server Sorter"
            className="vc-server-sorter-guild-wrapper"
            onClick={onClick}
        >
            <FolderIcon />
        </div>
    );
}

// ── 公開 API ──────────────────────────────────────────────────────────────────

/**
 * サーバーリストにプラグイン起動ボタンを挿入する。
 *
 * - '.guilds_*' クラスの要素を探し、先頭に container を差し込む
 * - 要素がまだ存在しない場合は 1 秒後にリトライ（Discord の遅延レンダリング対策）
 *
 * @returns 挿入した container 要素、またはリトライが必要な場合は null
 */
export function injectSorterButton(
    onClickModal: () => void,
    onRetry: () => void,
): HTMLElement | null {
    if (document.getElementById(BUTTON_ID)) return null;

    const guildListEl = document.querySelector('[class*="guilds_"]');
    if (!guildListEl) {
        setTimeout(onRetry, 1000);
        return null;
    }

    const container = document.createElement("div");
    container.id = BUTTON_ID;

    // React 18+: createRoot / それ以前: legacy render
    if (BdApi.ReactDOM?.createRoot) {
        const root = BdApi.ReactDOM.createRoot(container);
        root.render(<SorterButton onClick={onClickModal} />);
    } else {
        BdApi.ReactDOM.render(<SorterButton onClick={onClickModal} />, container);
    }

    guildListEl.insertBefore(container, guildListEl.firstChild);
    return container;
}

/** injectSorterButton で挿入したボタンを DOM から除去する */
export function removeSorterButton(btn: HTMLElement | null): void {
    btn?.remove();
    document.getElementById(BUTTON_ID)?.remove();
}
