import type * as ReactTypes from "react";

declare global {
    const BdApi: {
        React: typeof ReactTypes;
        ReactDOM: {
            createRoot?: (container: Element) => {
                render(el: ReactTypes.ReactElement): void;
                unmount(): void;
            };
            render(el: ReactTypes.ReactElement, container: Element): void;
            unmountComponentAtNode(container: Element): void;
        };
        DOM: {
            addStyle(id: string, css: string): void;
            removeStyle(id: string): void;
        };
        Webpack: {
            getStore?(name: string): unknown;
            getModule?(filter: (m: unknown) => boolean, opts?: { searchExports?: boolean }): unknown;
            getModules?(filter: (m: unknown) => boolean): unknown[] | null;
        };
        Data: {
            load(pluginId: string, key: string): unknown;
            save(pluginId: string, key: string, data: unknown): void;
        };
        UI: {
            showToast(message: string, opts?: { type?: "success" | "error" | "warning" | "info" }): void;
        };
    };
}

export {};
