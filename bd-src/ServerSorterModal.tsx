import type * as R from "react";
import type { GuildFolder, GuildStoreType, SortedGuildStoreType, TranslateFn, OpenCustomModal, DropMode } from "./types";
import { PLUGIN_ID } from "./constants";
import { keyOf, purgeEmpty, flipAnimate } from "./utils";
import { Btn } from "./Btn";
import { makeGuildIcon } from "./GuildIcon";
import { makeOpenFolderEditModal } from "./FolderEditModal";
import { makeFolderCard, type DragHandlers } from "./FolderCard";
import { makeTutorialOverlay } from "./TutorialOverlay";

const React = BdApi.React;
const ce = React.createElement;

interface ServerSorterModalDeps {
    GuildStore: GuildStoreType;
    SortedGuildStore: SortedGuildStoreType;
    t: TranslateFn;
    openCustomModal: OpenCustomModal;
    applyFolderData: (folders: GuildFolder[]) => Promise<void>;
}

interface ServerSorterModalProps {
    onClose: () => void;
}

/**
 * makeServerSorterModal はファクトリ関数。
 * GuildStore 等の runtime 依存をクロージャに閉じ込め、
 * モーダルを開くたびにコンポーネントを再生成しないよう 1 回だけ呼ぶ。
 */
export function makeServerSorterModal(deps: ServerSorterModalDeps) {
    const { GuildStore, SortedGuildStore, t, openCustomModal, applyFolderData } = deps;
    const { useState, useRef, useLayoutEffect } = React;

    // 依存コンポーネントをここで生成（再レンダーのたびに作り直さない）
    const GuildIcon = makeGuildIcon(GuildStore);
    const openFolderEditModal = makeOpenFolderEditModal(openCustomModal, t);
    const FolderCard = makeFolderCard(GuildStore, t);
    const TutorialOverlay = makeTutorialOverlay(t);

    return function ServerSorterModal({ onClose }: ServerSorterModalProps) {
        // ── State ──────────────────────────────────────────────────────────────
        //
        // folders: 現在の表示順。SortedGuildStore から初期化する。
        //   ungrouped サーバーは guildIds を 1 件ずつに展開して扱う
        //   （フォルダ内とオーバーラップしないよう folderId: undefined で区別）
        const [folders, setFolders] = useState<GuildFolder[]>(() => {
            const raw = SortedGuildStore.getGuildFolders();
            return raw.flatMap(f =>
                f.folderId !== undefined
                    ? [f]
                    : f.guildIds.map(guildId => ({ folderId: undefined, guildIds: [guildId] }))
            );
        });

        // showTutorial: BdApi.Data に永続化された "tutorialSeen" フラグで初期値を決める
        const [showTutorial, setShowTutorial] = useState(() => !(BdApi.Data.load(PLUGIN_ID, "tutorialSeen") ?? false));

        // DnD 状態
        //   dragKey  : 現在ドラッグ中のアイテムキー
        //   dropKey  : ドラッグオーバー中のターゲットキー
        //   dropMode : フォルダへのドロップ時に横位置で決まる挙動
        //     "merge"   → フォルダ中央にドロップ: サーバーをフォルダに追加
        //     "reorder" → フォルダ端にドロップ:   フォルダの前に並び替え
        const [dragKey, setDragKey] = useState<string | null>(null);
        const [dropKey, setDropKey] = useState<string | null>(null);
        const [dropMode, setDropMode] = useState<DropMode>(null);

        // itemRefs: 各グリッドアイテムの DOM ref をキーで管理（FLIP アニメーション用）
        const itemRefs = useRef(new Map<string, HTMLDivElement>());
        // prevPositions: setFolders 直前のアイテム位置を記録（FLIP の "First" ステップ）
        const prevPositions = useRef(new Map<string, DOMRect>());

        // ── FLIP アニメーション ────────────────────────────────────────────────
        // folders 変更後のレイアウト確定時（useLayoutEffect）に "Last" 位置を取得し、
        // prevPositions に記録した "First" との差分でトランジションをかける
        useLayoutEffect(() => {
            if (prevPositions.current.size === 0) return;
            for (const [key, el] of itemRefs.current) {
                const prev = prevPositions.current.get(key);
                if (prev) flipAnimate(el, prev);
            }
            prevPositions.current = new Map();
        }, [folders]);

        /** setFolders 呼び出しの直前に全アイテムの位置をスナップショットする */
        function capturePositions() {
            const map = new Map<string, DOMRect>();
            for (const [key, el] of itemRefs.current) map.set(key, el.getBoundingClientRect());
            prevPositions.current = map;
        }

        /** DnD 終了・キャンセル時に 3 つの DnD state を一括リセット */
        function resetDrag() { setDragKey(null); setDropKey(null); setDropMode(null); }

        // ── handleDrop ────────────────────────────────────────────────────────
        //
        // DnD キー体系:
        //   "f:{folderId}"            … フォルダカード全体
        //   "b:{guildId}"             … ungrouped サーバー（bare item）
        //   "i:{folderId}:{guildId}"  … フォルダ内の個別サーバー
        //
        // ドロップ先がフォルダ（toKey = "f:"）の場合、dropMode で分岐:
        //   merge   → サーバーをフォルダに追加（fromKey が "f:" のときは不可）
        //   reorder → fromKey をフォルダの直前に挿入
        //
        // ドロップ先が bare item（toKey = "b:"）の場合:
        //   fromKey が "i:" → フォルダから取り出して bare item の前に ungrouped 挿入
        //   それ以外        → 通常の並び替え
        function handleDrop(fromKey: string, toKey: string) {
            if (fromKey === toKey) return;

            if (toKey.startsWith("f:")) {
                // ── ケース 1: merge（サーバー → フォルダ中央） ─────────────────
                if (dropMode === "merge" && !fromKey.startsWith("f:")) {
                    // "i:xxx:yyy" → guildId = yyy、"b:yyy" → guildId = yyy
                    const guildId = fromKey.startsWith("b:") ? fromKey.slice(2) : fromKey.split(":")[2];
                    // フォルダ内サーバー ("i:") の場合は元フォルダのキーを保持
                    const fromFolderKey = fromKey.startsWith("i:") ? `f:${fromKey.split(":")[1]}` : null;
                    // 同じフォルダへのドロップは no-op
                    if (fromFolderKey === toKey) { resetDrag(); return; }
                    setFolders(prev => {
                        let arr = prev.map(f => {
                            // 元フォルダから guildId を取り除く
                            if (fromFolderKey && keyOf(f) === fromFolderKey) return { ...f, guildIds: f.guildIds.filter(id => id !== guildId) };
                            // ドロップ先フォルダに guildId を追加
                            if (keyOf(f) === toKey) return { ...f, guildIds: [...f.guildIds, guildId] };
                            return f;
                        });
                        // bare item だった場合はそのエントリを配列から除去
                        if (fromKey.startsWith("b:")) arr = arr.filter(f => !(f.folderId === undefined && f.guildIds[0] === guildId));
                        return purgeEmpty(arr);
                    });
                    resetDrag(); return;
                }

                // ── ケース 2: フォルダ内サーバー → フォルダ端（reorder で取り出し） ──
                if (fromKey.startsWith("i:")) {
                    const [, fromFolderId, guildId] = fromKey.split(":");
                    const fromFolderKey = `f:${fromFolderId}`;
                    if (fromFolderKey === toKey) { resetDrag(); return; }
                    capturePositions();
                    setFolders(prev => {
                        // 元フォルダから取り出し（空になったら purgeEmpty で削除）
                        const removed = purgeEmpty(prev.map(f =>
                            keyOf(f) === fromFolderKey ? { ...f, guildIds: f.guildIds.filter(id => id !== guildId) } : f
                        ));
                        // ドロップ先フォルダの直前に ungrouped として挿入
                        const toIdx = removed.findIndex(f => keyOf(f) === toKey);
                        const result = [...removed];
                        result.splice(toIdx === -1 ? result.length : toIdx, 0, { folderId: undefined, guildIds: [guildId] });
                        return result;
                    });
                    resetDrag(); return;
                }

                // ── ケース 3: フォルダ / bare → フォルダ端（reorder） ──────────
                capturePositions();
                setFolders(prev => {
                    const arr = [...prev];
                    const fromIdx = arr.findIndex(f => keyOf(f) === fromKey);
                    if (fromIdx === -1) return prev;
                    const [item] = arr.splice(fromIdx, 1);
                    const toIdx = arr.findIndex(f => keyOf(f) === toKey);
                    if (toIdx === -1) return prev;
                    arr.splice(toIdx, 0, item);
                    return arr;
                });
                resetDrag(); return;
            }

            // ── ドロップ先が bare item ─────────────────────────────────────────
            if (fromKey.startsWith("i:")) {
                // ── ケース 4: フォルダ内サーバー → bare item の前に ungrouped 挿入 ──
                const [, fromFolderId, guildId] = fromKey.split(":");
                capturePositions();
                setFolders(prev => {
                    const removed = purgeEmpty(prev.map(f =>
                        keyOf(f) === `f:${fromFolderId}` ? { ...f, guildIds: f.guildIds.filter(id => id !== guildId) } : f
                    ));
                    const toIdx = removed.findIndex(f => keyOf(f) === toKey);
                    const result = [...removed];
                    result.splice(toIdx === -1 ? result.length : toIdx, 0, { folderId: undefined, guildIds: [guildId] });
                    return result;
                });
                resetDrag(); return;
            }

            // ── ケース 5: フォルダ / bare → bare item の前（通常並び替え） ──────
            capturePositions();
            setFolders(prev => {
                const arr = [...prev];
                const fromIdx = arr.findIndex(f => keyOf(f) === fromKey);
                const toIdx = arr.findIndex(f => keyOf(f) === toKey);
                if (fromIdx === -1 || toIdx === -1) return prev;
                const [item] = arr.splice(fromIdx, 1);
                // splice 後に toIdx がずれるため再検索
                arr.splice(arr.findIndex(f => keyOf(f) === toKey), 0, item);
                return arr;
            });
            resetDrag();
        }

        // ── makeDragHandlers ──────────────────────────────────────────────────
        // 各グリッドアイテムに渡す DnD イベントハンドラをまとめたオブジェクトを返す。
        //
        // isDragging / isDropTarget / isMergeTarget は CSS クラス付与に使う視覚フラグ。
        //   ※ フォルダ内サーバー("i:") をドラッグ中は親フォルダカード全体も isDragging にする
        //
        // onDragOver でフォルダの場合のみ横位置から dropMode を計算:
        //   中央 30~70% → merge、端 ~30% / 70%~ → reorder
        function makeDragHandlers(itemKey: string): DragHandlers {
            // "i:folderId:guildId" をドラッグ中なら親フォルダキーも取得
            const dragFolderKey = dragKey?.startsWith("i:") ? `f:${dragKey.split(":")[1]}` : null;
            const isFolder = itemKey.startsWith("f:");
            return {
                // 自分がドラッグ中 or 自分がドラッグ中サーバーの親フォルダ
                isDragging: dragKey === itemKey || dragFolderKey === itemKey,
                // reorder ターゲット（フォルダの場合は dropMode === "reorder" のみ）
                isDropTarget: dropKey === itemKey && (!isFolder || dropMode === "reorder") && itemKey !== dragFolderKey,
                // merge ターゲット（フォルダへの中央ドロップ時のみ青グロー）
                isMergeTarget: dropKey === itemKey && isFolder && dropMode === "merge",
                onDragStart: (e: R.DragEvent<HTMLDivElement>) => {
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", itemKey);
                    setDragKey(itemKey);
                },
                onDragEnd: resetDrag,
                onDragOver: (e: R.DragEvent<HTMLDivElement>) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    if (dropKey !== itemKey) setDropKey(itemKey);
                    if (isFolder) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const relX = (e.clientX - rect.left) / rect.width;
                        const mode: DropMode = (relX < 0.3 || relX > 0.7) ? "reorder" : "merge";
                        if (dropMode !== mode) setDropMode(mode);
                    }
                },
                // 子要素への移動は無視（relatedTarget が自分の子なら dropKey をリセットしない）
                onDragLeave: (e: R.DragEvent<HTMLDivElement>) => {
                    if (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget as Node)) {
                        setDropKey(null);
                        setDropMode(null);
                    }
                },
                onDrop: (e: R.DragEvent<HTMLDivElement>) => {
                    e.preventDefault();
                    if (dragKey) handleDrop(dragKey, itemKey);
                },
            };
        }

        /** key → DOM ref のマッピングを管理するコールバック ref ファクトリ */
        function makeRef(k: string): R.RefCallback<HTMLDivElement> {
            return el => {
                if (el) itemRefs.current.set(k, el);
                else itemRefs.current.delete(k);
            };
        }

        // ── レンダー ─────────────────────────────────────────────────────────
        return ce(React.Fragment, null,
            // ヘッダー: タイトル + ? ボタン（チュートリアル再表示）
            ce("div", { className: "ss-header" },
                ce("h4", { className: "vc-ss-modal-title" }, "Server Sorter"),
                ce("div", { style: { flex: 1 } }),
                ce("button", { className: "vc-ss-info-btn", onClick: () => setShowTutorial(true), title: t("viewHelp") }, "?")
            ),

            // コンテンツ: チュートリアルオーバーレイ + グリッド
            ce("div", { className: "ss-content vc-ss-v2-body" },
                // 初回起動時（または ? ボタン押下時）にオーバーレイ表示
                showTutorial && ce(TutorialOverlay, {
                    onDismiss: () => { BdApi.Data.save(PLUGIN_ID, "tutorialSeen", true); setShowTutorial(false); },
                }),

                // auto-fill グリッド: フォルダカード（span 2）と bare item が混在
                ce("div", { className: "vc-ss-v2-grid" },
                    ...folders.map(folder => {
                        const k = keyOf(folder);

                        // フォルダカード
                        if (folder.folderId !== undefined) {
                            return ce(FolderCard, {
                                key: folder.folderId, folder, openFolderEditModal,
                                onUpdate: (name, color) => setFolders(prev =>
                                    prev.map(f => f.folderId === folder.folderId ? { ...f, folderName: name, folderColor: color } : f)
                                ),
                                drag: makeDragHandlers(k), setRef: makeRef(k),
                                dragKey,
                                onItemDragStart: key => setDragKey(key),
                                onItemDragEnd: resetDrag,
                            });
                        }

                        // ungrouped サーバー（bare item）: カードなしでアイコンのみ
                        const guildId = folder.guildIds[0];
                        const drag = makeDragHandlers(k);
                        return ce("div", {
                            key: guildId, ref: makeRef(k),
                            className: ["vc-ss-v2-bare-item",
                                drag.isDragging ? "vc-ss-v2-bare-item--dragging" : "",
                                drag.isDropTarget ? "vc-ss-v2-bare-item--drop-target" : "",
                            ].filter(Boolean).join(" "),
                            draggable: true,
                            // stopPropagation でフォルダカードへの伝播を防ぐ
                            onDragStart: (e: R.DragEvent<HTMLDivElement>) => { e.stopPropagation(); drag.onDragStart(e); },
                            onDragEnd: drag.onDragEnd,
                            onDragOver: drag.onDragOver,
                            onDragLeave: drag.onDragLeave,
                            onDrop: drag.onDrop,
                        },
                            // data-name を親ラッパーに持たせて ::after でツールチップ表示
                            ce("div", { className: "vc-ss-v2-bare-icon", "data-name": GuildStore.getGuild(guildId)?.name ?? guildId },
                                ce(GuildIcon, { guildId, size: 40 })
                            )
                        );
                    })
                )
            ),

            // フッター: 適用 / 新規グループ / 閉じる / 再起動
            ce("div", { className: "ss-footer vc-ss-footer" },
                ce(Btn, {
                    color: Btn.Colors.GREEN,
                    onClick: async () => {
                        try {
                            await applyFolderData(folders);
                            BdApi.UI.showToast(t("applySuccess"), { type: "success" });
                        } catch (e) {
                            BdApi.UI.showToast(`${t("applyFailure")}: ${e instanceof Error ? e.message : e}`, { type: "error" });
                        }
                    },
                }, t("applySort")),
                // 空のフォルダを末尾に追加（folderId はランダムな大きな整数で仮割り当て）
                ce(Btn, {
                    color: Btn.Colors.BRAND,
                    onClick: () => setFolders(prev => [...prev, {
                        folderId: String(Math.floor(Math.random() * 9e9) + 1e9),
                        guildIds: [],
                    }]),
                }, t("createGroup")),
                ce(Btn, { color: Btn.Colors.PRIMARY, onClick: onClose }, t("close"))
            )
        );
    };
}
