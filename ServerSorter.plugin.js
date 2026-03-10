/**
 * @name ServerSorter
 * @description Sort Discord servers via drag & drop GUI
 * @version 2.0.0
 * @author kazuryu
 */

"use strict";
var __ssPlugin = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // bd-src/Plugin.ts
  var Plugin_exports = {};
  __export(Plugin_exports, {
    default: () => Plugin_default
  });

  // bd-src/constants.ts
  var PLUGIN_ID = "ServerSorter";
  var PLUGIN_DESC = "Sort Discord servers via drag & drop GUI";
  var PLUGIN_VER = "2.0.0";
  var PLUGIN_AUTHOR = "Kazuryu";
  var MAX_PREVIEW = 2;
  var FOLDER_COLORS = [
    // 行1（明るい）
    1752220,
    3066993,
    3447003,
    10181046,
    15277667,
    15844367,
    15105570,
    15158332,
    9807270,
    6323595,
    // 行2（暗い）
    1146986,
    2067276,
    2123412,
    7419530,
    11342935,
    12745742,
    11027200,
    10038562,
    9936031,
    5533306
  ];
  var STRINGS = {
    ja: {
      folderEditTitle: "\u30D5\u30A9\u30EB\u30C0\u3092\u7DE8\u96C6",
      folderNameLabel: "\u30D5\u30A9\u30EB\u30C0\u540D",
      folderNamePlaceholder: "\u30D5\u30A9\u30EB\u30C0\u540D",
      colorLabel: "\u8272",
      colorNone: "\u8272\u306A\u3057",
      save: "\u4FDD\u5B58",
      cancel: "\u30AD\u30E3\u30F3\u30BB\u30EB",
      defaultFolderName: "\u30D5\u30A9\u30EB\u30C0",
      tutorialTitle: "\u4F7F\u3044\u65B9",
      tutorialSubtitle: "\u53F3\u4E0A\u306E ? \u30DC\u30BF\u30F3\u304B\u3089\u3044\u3064\u3067\u3082\u898B\u8FD4\u305B\u307E\u3059",
      tutorialDismiss: "\u308F\u304B\u3063\u305F\uFF01",
      viewHelp: "\u4F7F\u3044\u65B9\u3092\u898B\u308B",
      tip0Title: "\u4E26\u3073\u66FF\u3048",
      tip0Desc: "\u30B5\u30FC\u30D0\u30FC\u30FB\u30B0\u30EB\u30FC\u30D7\u3092\u30C9\u30E9\u30C3\u30B0&\u30C9\u30ED\u30C3\u30D7\u3057\u3066\u9806\u756A\u3092\u5165\u308C\u66FF\u3048\u3089\u308C\u307E\u3059",
      tip1Title: "\u30B0\u30EB\u30FC\u30D7\u306B\u8FFD\u52A0",
      tip1Desc: "\u30B5\u30FC\u30D0\u30FC\u3092\u30B0\u30EB\u30FC\u30D7\u306E\u4E2D\u592E\u306B\u30C9\u30ED\u30C3\u30D7\u3059\u308B\u3068\u30B0\u30EB\u30FC\u30D7\u306B\u8FFD\u52A0\u3067\u304D\u307E\u3059",
      tip2Title: "\u30B0\u30EB\u30FC\u30D7\u65B0\u898F\u4F5C\u6210",
      tip2Desc: "\u30D5\u30C3\u30BF\u30FC\u306E\u300C\u65B0\u898F\u30B0\u30EB\u30FC\u30D7\u4F5C\u6210\u300D\u30DC\u30BF\u30F3\u3067\u7A7A\u306E\u30B0\u30EB\u30FC\u30D7\u3092\u8FFD\u52A0\u3067\u304D\u307E\u3059",
      tip3Title: "\u30B0\u30EB\u30FC\u30D7\u7DE8\u96C6",
      tip3Desc: "\u30B0\u30EB\u30FC\u30D7\u3092\u53F3\u30AF\u30EA\u30C3\u30AF\u3057\u3066\u540D\u524D\u3084\u8272\u3092\u5909\u66F4\u3067\u304D\u307E\u3059",
      applySort: "\u9069\u7528",
      createGroup: "\u65B0\u898F\u30B0\u30EB\u30FC\u30D7\u4F5C\u6210",
      close: "\u9589\u3058\u308B",
      applySuccess: "\u4E26\u3073\u66FF\u3048\u3092\u9069\u7528\u3057\u307E\u3057\u305F",
      applyFailure: "\u9069\u7528\u306B\u5931\u6557\u3057\u307E\u3057\u305F"
    },
    en: {
      folderEditTitle: "Edit Folder",
      folderNameLabel: "Folder Name",
      folderNamePlaceholder: "Folder name",
      colorLabel: "Color",
      colorNone: "No color",
      save: "Save",
      cancel: "Cancel",
      defaultFolderName: "Folder",
      tutorialTitle: "How to Use",
      tutorialSubtitle: "You can always view this again from the ? button in the top right",
      tutorialDismiss: "Got it!",
      viewHelp: "View help",
      tip0Title: "Reorder",
      tip0Desc: "Drag and drop servers and groups to rearrange their order",
      tip1Title: "Add to Group",
      tip1Desc: "Drop a server onto the center of a group to add it",
      tip2Title: "Create Group",
      tip2Desc: 'Use the "Create Group" button in the footer to add an empty group',
      tip3Title: "Edit Group",
      tip3Desc: "Right-click a group to change its name and color",
      applySort: "Apply",
      createGroup: "Create Group",
      close: "Close",
      applySuccess: "Order applied successfully",
      applyFailure: "Failed to apply order"
    }
  };

  // bd-src/css.ts
  var CSS = `
:root {
    --vc-ss-panel-radius: 20px;
    --vc-ss-glass-bg: rgba(255,255,255,0.06);
    --vc-ss-glass-border: rgba(255,255,255,0.18);
    --vc-ss-glass-blur: blur(24px) saturate(180%);
    --vc-ss-glass-shadow: 0 8px 32px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(0,0,0,0.08);
    --vc-ss-transition: 0.15s;
}
.vc-ss-modal-title { margin:0; font-size:16px; font-weight:700; color:var(--text-strong); }
.vc-server-sorter-modal { width:90vw!important; max-width:90vw!important; height:90vh!important; max-height:90vh!important; }
.vc-ss-v2-body { display:flex!important; flex-direction:column!important; overflow-y:auto!important; padding:16px!important; gap:16px; position:relative; }
.vc-ss-v2-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(90px,1fr)); gap:12px; padding-top:32px; }
.vc-ss-v2-card { grid-column:span 2; border-radius:var(--vc-ss-panel-radius); background:var(--vc-ss-glass-bg); backdrop-filter:var(--vc-ss-glass-blur); -webkit-backdrop-filter:var(--vc-ss-glass-blur); border:1px solid var(--vc-ss-glass-border); box-shadow:var(--vc-ss-glass-shadow); padding:8px 0 12px; min-height:80px; cursor:grab; }
.vc-ss-v2-card-items { display:flex; flex-wrap:wrap; gap:8px; padding:4px 12px 0; }
.vc-ss-v2-card-item { position:relative; cursor:pointer; border-radius:50%; transition:transform var(--vc-ss-transition),opacity var(--vc-ss-transition); opacity:0.9; }
.vc-ss-v2-card-item:hover { transform:scale(1.1); opacity:1; }
.vc-ss-v2-card-item::after { content:attr(data-name); position:absolute; bottom:calc(100% + 6px); left:50%; transform:translateX(-50%); background:var(--bg-overlay-4,rgba(0,0,0,0.75)); color:var(--text-strong); font-size:12px; font-weight:500; white-space:nowrap; padding:4px 8px; border-radius:6px; pointer-events:none; opacity:0; transition:opacity var(--vc-ss-transition); z-index:10; }
.vc-ss-v2-card-item:hover::after { opacity:1; }
.vc-ss-v2-bare-item { position:relative; display:flex; align-items:center; justify-content:center; min-height:80px; cursor:grab; border-radius:12px; border:1px solid var(--vc-ss-glass-border); background:var(--vc-ss-glass-bg); backdrop-filter:var(--vc-ss-glass-blur); -webkit-backdrop-filter:var(--vc-ss-glass-blur); transition:border-color var(--vc-ss-transition),background var(--vc-ss-transition); }
.vc-ss-v2-bare-item:hover { border-color:rgba(255,255,255,0.28); background:rgba(255,255,255,0.09); z-index:100; }
.vc-ss-v2-bare-icon { position:relative; }
.vc-ss-v2-bare-icon::after { content:attr(data-name); position:absolute; bottom:calc(100% + 6px); left:50%; transform:translateX(-50%); background:var(--bg-overlay-4,rgba(0,0,0,0.75)); color:var(--text-strong); font-size:12px; font-weight:500; white-space:nowrap; padding:4px 8px; border-radius:6px; pointer-events:none; opacity:0; transition:opacity var(--vc-ss-transition); z-index:10; }
.vc-ss-v2-bare-item:hover .vc-ss-v2-bare-icon::after { opacity:1; }
.vc-ss-v2-card-item--dragging { opacity:0.35; cursor:grabbing; }
.vc-ss-v2-card--dragging, .vc-ss-v2-bare-item--dragging { opacity:0.35; cursor:grabbing; }
.vc-ss-v2-card--drop-target { border-color:rgba(255,255,255,0.55); border-left:3px solid rgba(255,255,255,0.8); box-shadow:0 0 0 2px rgba(255,255,255,0.25),var(--vc-ss-glass-shadow); }
.vc-ss-v2-card--merge-target { border-color:rgba(88,166,255,0.8); background:rgba(88,166,255,0.12); box-shadow:0 0 0 2px rgba(88,166,255,0.35),0 0 16px rgba(88,166,255,0.25),var(--vc-ss-glass-shadow); }
.vc-ss-v2-bare-item--drop-target { background:rgba(255,255,255,0.12); border-left:3px solid rgba(255,255,255,0.8); border-radius:12px; }
.vc-ss-v2-card--collapsible:hover { border-color:rgba(255,255,255,0.28); }
.vc-ss-v2-card-toggle { margin-left:auto; padding-right:14px; font-size:10px; color:var(--channels-default); opacity:0.6; }
.vc-ss-v2-card-more { width:40px; height:40px; border-radius:50%; background:rgba(255,255,255,0.1); border:1px solid var(--vc-ss-glass-border); display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; color:var(--channels-default); flex-shrink:0; }
.vc-ss-folder-panel-title { padding:8px 14px 6px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; color:var(--channels-default); display:flex; align-items:center; }
.vc-ss-edit-body { display:flex!important; flex-direction:column!important; gap:8px; padding:16px!important; }
.vc-ss-edit-label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; color:var(--channels-default); margin-bottom:2px; }
.vc-ss-edit-input { background:var(--background-base-low); border:1px solid var(--vc-ss-glass-border); border-radius:8px; color:var(--text-strong); font-size:14px; padding:8px 12px; width:100%; outline:none; box-sizing:border-box; margin-bottom:8px; }
.vc-ss-edit-input:focus { border-color:rgba(255,255,255,0.35); }
.vc-ss-edit-colors { display:flex; flex-wrap:wrap; gap:8px; }
.vc-ss-edit-swatch { width:28px; height:28px; border-radius:50%; cursor:pointer; border:2px solid transparent; transition:transform var(--vc-ss-transition),border-color var(--vc-ss-transition); flex-shrink:0; }
.vc-ss-edit-swatch:hover { transform:scale(1.2); }
.vc-ss-edit-swatch--selected { border-color:var(--text-strong); }
.vc-ss-edit-swatch--none { background:var(--background-base-low); border:2px dashed var(--vc-ss-glass-border); position:relative; overflow:hidden; }
.vc-ss-edit-swatch--none::before,.vc-ss-edit-swatch--none::after { content:""; position:absolute; top:50%; left:50%; width:65%; height:2px; background:var(--channels-default); }
.vc-ss-edit-swatch--none::before { transform:translate(-50%,-50%) rotate(45deg); }
.vc-ss-edit-swatch--none::after { transform:translate(-50%,-50%) rotate(-45deg); }
.vc-ss-info-btn { width:29px; height:29px; border-radius:50%; border:1px solid var(--vc-ss-glass-border); background:var(--vc-ss-glass-bg); color:var(--channels-default); font-size:15px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:background var(--vc-ss-transition),color var(--vc-ss-transition); margin-right:4px; }
.vc-ss-info-btn:hover { background:rgba(255,255,255,0.12); color:var(--text-strong); }
.vc-ss-tutorial-overlay { position:absolute; inset:0; z-index:200; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.55); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); border-radius:4px; padding:24px; }
.vc-ss-tutorial-box { display:flex; flex-direction:column; align-items:center; gap:20px; padding:32px; border-radius:var(--vc-ss-panel-radius); background:var(--vc-ss-glass-bg); backdrop-filter:var(--vc-ss-glass-blur); -webkit-backdrop-filter:var(--vc-ss-glass-blur); border:1px solid var(--vc-ss-glass-border); box-shadow:var(--vc-ss-glass-shadow); max-width:520px; width:100%; }
.vc-ss-tutorial-title { margin:0; font-size:20px; font-weight:700; color:var(--text-strong); }
.vc-ss-tutorial-subtitle { font-size:12px; color:var(--channels-default); margin-top:-12px; }
.vc-ss-tutorial-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; width:100%; }
.vc-ss-tutorial-card { padding:16px; border-radius:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); display:flex; flex-direction:column; gap:6px; }
.vc-ss-tutorial-icon { font-size:28px; line-height:1; }
.vc-ss-tutorial-tip-title { font-size:13px; font-weight:700; color:var(--text-strong); }
.vc-ss-tutorial-desc { font-size:12px; color:var(--channels-default); line-height:1.5; }
.vc-ss-footer { gap:12px!important; padding:16px 24px!important; }
.vc-server-sorter-guild-wrapper { align-content:center; align-items:center; position:relative; width:40px; height:40px; display:flex; box-sizing:border-box; color:var(--text-default); background-color:var(--background-mod-subtle); border-radius:25%; cursor:pointer; margin:4px auto; justify-content:center; }
.vc-server-sorter-guild-wrapper:hover { background-color:var(--background-brand); color:var(--white); }
.vc-server-sorter-guild-wrapper::after { content:"Server Sorter"; position:absolute; left:calc(100% + 12px); top:50%; transform:translateY(-50%); background:var(--bg-overlay-4,rgba(0,0,0,0.85)); color:var(--text-strong,#fff); font-size:14px; font-weight:500; white-space:nowrap; padding:6px 10px; border-radius:6px; pointer-events:none; opacity:0; transition:opacity 0.15s; z-index:1000; }
.vc-server-sorter-guild-wrapper:hover::after { opacity:1; }
/* custom modal chrome */
.ss-overlay { position:fixed; inset:0; z-index:1000; background:rgba(0,0,0,0.85); display:flex; align-items:center; justify-content:center; }
.ss-window { background:var(--bg-overlay-1,#313338); border-radius:8px; display:flex; flex-direction:column; overflow:hidden; width:90vw; height:90vh; }
.ss-window--small { width:440px; height:auto; max-width:90vw; max-height:90vh; }
.ss-header { padding:16px 20px; display:flex; align-items:center; border-bottom:1px solid var(--vc-ss-glass-border); flex-shrink:0; }
.ss-content { flex:1; overflow:auto; min-height:0; }
.ss-footer { padding:16px 24px; display:flex; flex-direction:row-reverse; gap:12px; align-items:center; border-top:1px solid var(--vc-ss-glass-border); flex-shrink:0; }
.ss-btn { border:none; border-radius:3px; padding:2px 16px; height:38px; cursor:pointer; font-size:14px; font-weight:500; color:#fff; min-width:96px; transition:filter 0.1s; }
.ss-btn:hover { filter:brightness(1.1); }
.ss-btn--green { background:#2D7D46; }
.ss-btn--brand { background:#5865F2; }
.ss-btn--primary { background:#4E5058; }
.ss-btn--red { background:#DA373C; }
`;

  // bd-src/utils.ts
  function colorToHex(c) {
    return `#${(c & 16777215).toString(16).padStart(6, "0")}`;
  }
  function keyOf(f) {
    return f.folderId !== void 0 ? `f:${f.folderId}` : `b:${f.guildIds[0]}`;
  }
  function purgeEmpty(arr) {
    return arr.filter((f) => f.folderId === void 0 || f.guildIds.length > 0);
  }
  function flipAnimate(el, prev) {
    const curr = el.getBoundingClientRect();
    const dx = prev.left - curr.left;
    const dy = prev.top - curr.top;
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
    el.style.transition = "none";
    el.style.transform = `translate(${dx}px,${dy}px)`;
    el.getBoundingClientRect();
    el.style.transition = "transform 0.35s cubic-bezier(0.4,0,0.2,1)";
    el.style.transform = "";
    el.addEventListener("transitionend", () => {
      el.style.transition = "";
    }, { once: true });
  }

  // bd-src/Btn.tsx
  var React = BdApi.React;
  var ce = React.createElement;
  var BtnColors = {
    GREEN: "green",
    BRAND: "brand",
    PRIMARY: "primary",
    RED: "red"
  };
  var _Btn = (props) => ce("button", {
    className: `ss-btn ss-btn--${props.color ?? "brand"}`,
    onClick: props.onClick
  }, props.children);
  var Btn = Object.assign(_Btn, { Colors: BtnColors });

  // bd-src/GuildIcon.tsx
  var React2 = BdApi.React;
  var ce2 = React2.createElement;
  function makeGuildIcon(GuildStore) {
    return function GuildIcon({ guildId, size = 32 }) {
      const guild = GuildStore.getGuild(guildId);
      if (guild?.icon) {
        return ce2("img", {
          src: `https://cdn.discordapp.com/icons/${guildId}/${guild.icon}.png?size=32`,
          style: { width: size, height: size, borderRadius: "50%", flexShrink: 0 }
        });
      }
      return ce2("div", {
        style: {
          width: size,
          height: size,
          borderRadius: "50%",
          flexShrink: 0,
          background: "var(--background-base-low)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.4,
          color: "var(--text-strong)"
        }
      }, guild?.name?.[0] ?? "?");
    };
  }

  // bd-src/FolderEditModal.tsx
  var React3 = BdApi.React;
  var ce3 = React3.createElement;
  function makeFolderEditContent(t) {
    const { useState } = React3;
    return function FolderEditContent({ folder, onSave, onClose }) {
      const [name, setName] = useState(folder.folderName ?? "");
      const [color, setColor] = useState(folder.folderColor);
      return ce3(
        React3.Fragment,
        null,
        ce3(
          "div",
          { className: "ss-header" },
          ce3("h4", { className: "vc-ss-modal-title" }, t("folderEditTitle"))
        ),
        ce3(
          "div",
          { className: "ss-content vc-ss-edit-body" },
          ce3("div", { className: "vc-ss-edit-label" }, t("folderNameLabel")),
          ce3("input", {
            className: "vc-ss-edit-input",
            value: name,
            onChange: (e) => setName(e.currentTarget.value),
            placeholder: t("folderNamePlaceholder"),
            maxLength: 100,
            autoFocus: true
          }),
          ce3("div", { className: "vc-ss-edit-label" }, t("colorLabel")),
          ce3(
            "div",
            { className: "vc-ss-edit-colors" },
            ...FOLDER_COLORS.map((c) => ce3("div", {
              key: c,
              className: `vc-ss-edit-swatch${color === c ? " vc-ss-edit-swatch--selected" : ""}`,
              style: { background: colorToHex(c) },
              onClick: () => setColor(c),
              title: colorToHex(c)
            }))
          )
        ),
        ce3(
          "div",
          { className: "ss-footer" },
          ce3(Btn, { color: Btn.Colors.BRAND, onClick: () => {
            onSave(name, color);
            onClose();
          } }, t("save")),
          ce3("div", { style: { flex: 1 } }),
          ce3(Btn, { color: Btn.Colors.PRIMARY, onClick: onClose }, t("cancel"))
        )
      );
    };
  }
  function makeOpenFolderEditModal(openCustomModal, t) {
    const FolderEditContent = makeFolderEditContent(t);
    return function openFolderEditModal(folder, onSave) {
      openCustomModal(
        (close) => ce3(FolderEditContent, { folder, onSave, onClose: close }),
        { small: true }
      );
    };
  }

  // bd-src/FolderCard.tsx
  var React4 = BdApi.React;
  var ce4 = React4.createElement;
  function makeFolderCard(GuildStore, t) {
    const { useState, useRef } = React4;
    const GuildIcon = makeGuildIcon(GuildStore);
    return function FolderCard({
      folder,
      onUpdate,
      drag,
      setRef,
      dragKey,
      onItemDragStart,
      onItemDragEnd,
      openFolderEditModal
    }) {
      const name = folder.folderName || t("defaultFolderName");
      const total = folder.guildIds.length;
      const collapsible = total > MAX_PREVIEW;
      const [expanded, setExpanded] = useState(false);
      const visibleIds = collapsible && !expanded ? folder.guildIds.slice(0, MAX_PREVIEW) : folder.guildIds;
      const hasDragged = useRef(false);
      const hex = folder.folderColor != null ? colorToHex(folder.folderColor) : null;
      const colorStyle = hex ? { borderColor: `${hex}66`, background: `${hex}14` } : void 0;
      const className = [
        "vc-ss-v2-card",
        collapsible ? "vc-ss-v2-card--collapsible" : "",
        drag.isDragging ? "vc-ss-v2-card--dragging" : "",
        drag.isMergeTarget ? "vc-ss-v2-card--merge-target" : drag.isDropTarget ? "vc-ss-v2-card--drop-target" : ""
      ].filter(Boolean).join(" ");
      return ce4(
        "div",
        {
          ref: setRef,
          className,
          draggable: true,
          style: colorStyle,
          onDragStart: (e) => {
            e.stopPropagation();
            hasDragged.current = true;
            drag.onDragStart(e);
          },
          onDragEnd: (e) => {
            drag.onDragEnd(e);
            setTimeout(() => {
              hasDragged.current = false;
            }, 0);
          },
          onDragOver: drag.onDragOver,
          onDragLeave: drag.onDragLeave,
          onDrop: drag.onDrop,
          onClick: collapsible ? () => {
            if (!hasDragged.current) setExpanded((v) => !v);
          } : void 0,
          onMouseDown: (e) => {
            if (e.button === 2) e.stopPropagation();
          },
          onContextMenu: (e) => {
            e.preventDefault();
            e.stopPropagation();
            openFolderEditModal(folder, onUpdate);
          }
        },
        ce4(
          "div",
          { className: "vc-ss-folder-panel-title" },
          name,
          collapsible && ce4("span", { className: "vc-ss-v2-card-toggle" }, expanded ? "\u25B2" : "\u25BC")
        ),
        ce4(
          "div",
          { className: "vc-ss-v2-card-items" },
          ...visibleIds.map((guildId) => {
            const itemKey = `i:${folder.folderId}:${guildId}`;
            return ce4("div", {
              key: guildId,
              className: ["vc-ss-v2-card-item", dragKey === itemKey ? "vc-ss-v2-card-item--dragging" : ""].filter(Boolean).join(" "),
              "data-name": GuildStore.getGuild(guildId)?.name ?? guildId,
              draggable: true,
              onDragStart: (e) => {
                e.stopPropagation();
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", itemKey);
                onItemDragStart(itemKey);
              },
              onDragEnd: onItemDragEnd
            }, ce4(GuildIcon, { guildId, size: 40 }));
          }),
          collapsible && !expanded && ce4("div", { className: "vc-ss-v2-card-more" }, `+${total - MAX_PREVIEW}`)
        )
      );
    };
  }

  // bd-src/TutorialOverlay.tsx
  var React5 = BdApi.React;
  var ce5 = React5.createElement;
  function makeTutorialOverlay(t) {
    const tips = [
      { icon: "\u2195\uFE0F", title: t("tip0Title"), desc: t("tip0Desc") },
      { icon: "\u{1F4C2}", title: t("tip1Title"), desc: t("tip1Desc") },
      { icon: "\u2795", title: t("tip2Title"), desc: t("tip2Desc") },
      { icon: "\u270F\uFE0F", title: t("tip3Title"), desc: t("tip3Desc") }
    ];
    return function TutorialOverlay({ onDismiss }) {
      return ce5(
        "div",
        { className: "vc-ss-tutorial-overlay" },
        ce5(
          "div",
          { className: "vc-ss-tutorial-box" },
          ce5("h3", { className: "vc-ss-tutorial-title" }, t("tutorialTitle")),
          ce5("div", { className: "vc-ss-tutorial-subtitle" }, t("tutorialSubtitle")),
          ce5(
            "div",
            { className: "vc-ss-tutorial-grid" },
            ...tips.map((tip) => ce5(
              "div",
              { key: tip.title, className: "vc-ss-tutorial-card" },
              ce5("div", { className: "vc-ss-tutorial-icon" }, tip.icon),
              ce5("div", { className: "vc-ss-tutorial-tip-title" }, tip.title),
              ce5("div", { className: "vc-ss-tutorial-desc" }, tip.desc)
            ))
          ),
          ce5(Btn, { color: Btn.Colors.BRAND, onClick: onDismiss }, t("tutorialDismiss"))
        )
      );
    };
  }

  // bd-src/ServerSorterModal.tsx
  var React6 = BdApi.React;
  var ce6 = React6.createElement;
  function makeServerSorterModal(deps) {
    const { GuildStore, SortedGuildStore, t, openCustomModal, applyFolderData } = deps;
    const { useState, useRef, useLayoutEffect } = React6;
    const GuildIcon = makeGuildIcon(GuildStore);
    const openFolderEditModal = makeOpenFolderEditModal(openCustomModal, t);
    const FolderCard = makeFolderCard(GuildStore, t);
    const TutorialOverlay = makeTutorialOverlay(t);
    return function ServerSorterModal({ onClose }) {
      const [folders, setFolders] = useState(() => {
        const raw = SortedGuildStore.getGuildFolders();
        return raw.flatMap(
          (f) => f.folderId !== void 0 ? [f] : f.guildIds.map((guildId) => ({ folderId: void 0, guildIds: [guildId] }))
        );
      });
      const [showTutorial, setShowTutorial] = useState(() => !(BdApi.Data.load(PLUGIN_ID, "tutorialSeen") ?? false));
      const [dragKey, setDragKey] = useState(null);
      const [dropKey, setDropKey] = useState(null);
      const [dropMode, setDropMode] = useState(null);
      const itemRefs = useRef(/* @__PURE__ */ new Map());
      const prevPositions = useRef(/* @__PURE__ */ new Map());
      useLayoutEffect(() => {
        if (prevPositions.current.size === 0) return;
        for (const [key, el] of itemRefs.current) {
          const prev = prevPositions.current.get(key);
          if (prev) flipAnimate(el, prev);
        }
        prevPositions.current = /* @__PURE__ */ new Map();
      }, [folders]);
      function capturePositions() {
        const map = /* @__PURE__ */ new Map();
        for (const [key, el] of itemRefs.current) map.set(key, el.getBoundingClientRect());
        prevPositions.current = map;
      }
      function resetDrag() {
        setDragKey(null);
        setDropKey(null);
        setDropMode(null);
      }
      function handleDrop(fromKey, toKey) {
        if (fromKey === toKey) return;
        if (toKey.startsWith("f:")) {
          if (dropMode === "merge" && !fromKey.startsWith("f:")) {
            const guildId = fromKey.startsWith("b:") ? fromKey.slice(2) : fromKey.split(":")[2];
            const fromFolderKey = fromKey.startsWith("i:") ? `f:${fromKey.split(":")[1]}` : null;
            if (fromFolderKey === toKey) {
              resetDrag();
              return;
            }
            setFolders((prev) => {
              let arr = prev.map((f) => {
                if (fromFolderKey && keyOf(f) === fromFolderKey) return { ...f, guildIds: f.guildIds.filter((id) => id !== guildId) };
                if (keyOf(f) === toKey) return { ...f, guildIds: [...f.guildIds, guildId] };
                return f;
              });
              if (fromKey.startsWith("b:")) arr = arr.filter((f) => !(f.folderId === void 0 && f.guildIds[0] === guildId));
              return purgeEmpty(arr);
            });
            resetDrag();
            return;
          }
          if (fromKey.startsWith("i:")) {
            const [, fromFolderId, guildId] = fromKey.split(":");
            const fromFolderKey = `f:${fromFolderId}`;
            if (fromFolderKey === toKey) {
              resetDrag();
              return;
            }
            capturePositions();
            setFolders((prev) => {
              const removed = purgeEmpty(prev.map(
                (f) => keyOf(f) === fromFolderKey ? { ...f, guildIds: f.guildIds.filter((id) => id !== guildId) } : f
              ));
              const toIdx = removed.findIndex((f) => keyOf(f) === toKey);
              const result = [...removed];
              result.splice(toIdx === -1 ? result.length : toIdx, 0, { folderId: void 0, guildIds: [guildId] });
              return result;
            });
            resetDrag();
            return;
          }
          capturePositions();
          setFolders((prev) => {
            const arr = [...prev];
            const fromIdx = arr.findIndex((f) => keyOf(f) === fromKey);
            if (fromIdx === -1) return prev;
            const [item] = arr.splice(fromIdx, 1);
            const toIdx = arr.findIndex((f) => keyOf(f) === toKey);
            if (toIdx === -1) return prev;
            arr.splice(toIdx, 0, item);
            return arr;
          });
          resetDrag();
          return;
        }
        if (fromKey.startsWith("i:")) {
          const [, fromFolderId, guildId] = fromKey.split(":");
          capturePositions();
          setFolders((prev) => {
            const removed = purgeEmpty(prev.map(
              (f) => keyOf(f) === `f:${fromFolderId}` ? { ...f, guildIds: f.guildIds.filter((id) => id !== guildId) } : f
            ));
            const toIdx = removed.findIndex((f) => keyOf(f) === toKey);
            const result = [...removed];
            result.splice(toIdx === -1 ? result.length : toIdx, 0, { folderId: void 0, guildIds: [guildId] });
            return result;
          });
          resetDrag();
          return;
        }
        capturePositions();
        setFolders((prev) => {
          const arr = [...prev];
          const fromIdx = arr.findIndex((f) => keyOf(f) === fromKey);
          const toIdx = arr.findIndex((f) => keyOf(f) === toKey);
          if (fromIdx === -1 || toIdx === -1) return prev;
          const [item] = arr.splice(fromIdx, 1);
          arr.splice(arr.findIndex((f) => keyOf(f) === toKey), 0, item);
          return arr;
        });
        resetDrag();
      }
      function makeDragHandlers(itemKey) {
        const dragFolderKey = dragKey?.startsWith("i:") ? `f:${dragKey.split(":")[1]}` : null;
        const isFolder = itemKey.startsWith("f:");
        return {
          // 自分がドラッグ中 or 自分がドラッグ中サーバーの親フォルダ
          isDragging: dragKey === itemKey || dragFolderKey === itemKey,
          // reorder ターゲット（フォルダの場合は dropMode === "reorder" のみ）
          isDropTarget: dropKey === itemKey && (!isFolder || dropMode === "reorder") && itemKey !== dragFolderKey,
          // merge ターゲット（フォルダへの中央ドロップ時のみ青グロー）
          isMergeTarget: dropKey === itemKey && isFolder && dropMode === "merge",
          onDragStart: (e) => {
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", itemKey);
            setDragKey(itemKey);
          },
          onDragEnd: resetDrag,
          onDragOver: (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            if (dropKey !== itemKey) setDropKey(itemKey);
            if (isFolder) {
              const rect = e.currentTarget.getBoundingClientRect();
              const relX = (e.clientX - rect.left) / rect.width;
              const mode = relX < 0.3 || relX > 0.7 ? "reorder" : "merge";
              if (dropMode !== mode) setDropMode(mode);
            }
          },
          // 子要素への移動は無視（relatedTarget が自分の子なら dropKey をリセットしない）
          onDragLeave: (e) => {
            if (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget)) {
              setDropKey(null);
              setDropMode(null);
            }
          },
          onDrop: (e) => {
            e.preventDefault();
            if (dragKey) handleDrop(dragKey, itemKey);
          }
        };
      }
      function makeRef(k) {
        return (el) => {
          if (el) itemRefs.current.set(k, el);
          else itemRefs.current.delete(k);
        };
      }
      return ce6(
        React6.Fragment,
        null,
        // ヘッダー: タイトル + ? ボタン（チュートリアル再表示）
        ce6(
          "div",
          { className: "ss-header" },
          ce6("h4", { className: "vc-ss-modal-title" }, "Server Sorter"),
          ce6("div", { style: { flex: 1 } }),
          ce6("button", { className: "vc-ss-info-btn", onClick: () => setShowTutorial(true), title: t("viewHelp") }, "?")
        ),
        // コンテンツ: チュートリアルオーバーレイ + グリッド
        ce6(
          "div",
          { className: "ss-content vc-ss-v2-body" },
          // 初回起動時（または ? ボタン押下時）にオーバーレイ表示
          showTutorial && ce6(TutorialOverlay, {
            onDismiss: () => {
              BdApi.Data.save(PLUGIN_ID, "tutorialSeen", true);
              setShowTutorial(false);
            }
          }),
          // auto-fill グリッド: フォルダカード（span 2）と bare item が混在
          ce6(
            "div",
            { className: "vc-ss-v2-grid" },
            ...folders.map((folder) => {
              const k = keyOf(folder);
              if (folder.folderId !== void 0) {
                return ce6(FolderCard, {
                  key: folder.folderId,
                  folder,
                  openFolderEditModal,
                  onUpdate: (name, color) => setFolders(
                    (prev) => prev.map((f) => f.folderId === folder.folderId ? { ...f, folderName: name, folderColor: color } : f)
                  ),
                  drag: makeDragHandlers(k),
                  setRef: makeRef(k),
                  dragKey,
                  onItemDragStart: (key) => setDragKey(key),
                  onItemDragEnd: resetDrag
                });
              }
              const guildId = folder.guildIds[0];
              const drag = makeDragHandlers(k);
              return ce6(
                "div",
                {
                  key: guildId,
                  ref: makeRef(k),
                  className: [
                    "vc-ss-v2-bare-item",
                    drag.isDragging ? "vc-ss-v2-bare-item--dragging" : "",
                    drag.isDropTarget ? "vc-ss-v2-bare-item--drop-target" : ""
                  ].filter(Boolean).join(" "),
                  draggable: true,
                  // stopPropagation でフォルダカードへの伝播を防ぐ
                  onDragStart: (e) => {
                    e.stopPropagation();
                    drag.onDragStart(e);
                  },
                  onDragEnd: drag.onDragEnd,
                  onDragOver: drag.onDragOver,
                  onDragLeave: drag.onDragLeave,
                  onDrop: drag.onDrop
                },
                // data-name を親ラッパーに持たせて ::after でツールチップ表示
                ce6(
                  "div",
                  { className: "vc-ss-v2-bare-icon", "data-name": GuildStore.getGuild(guildId)?.name ?? guildId },
                  ce6(GuildIcon, { guildId, size: 40 })
                )
              );
            })
          )
        ),
        // フッター: 適用 / 新規グループ / 閉じる / 再起動
        ce6(
          "div",
          { className: "ss-footer vc-ss-footer" },
          ce6(Btn, {
            color: Btn.Colors.GREEN,
            onClick: async () => {
              try {
                await applyFolderData(folders);
                BdApi.UI.showToast(t("applySuccess"), { type: "success" });
              } catch (e) {
                BdApi.UI.showToast(`${t("applyFailure")}: ${e instanceof Error ? e.message : e}`, { type: "error" });
              }
            }
          }, t("applySort")),
          // 空のフォルダを末尾に追加（folderId はランダムな大きな整数で仮割り当て）
          ce6(Btn, {
            color: Btn.Colors.BRAND,
            onClick: () => setFolders((prev) => [...prev, {
              folderId: String(Math.floor(Math.random() * 9e9) + 1e9),
              guildIds: []
            }])
          }, t("createGroup")),
          ce6(Btn, { color: Btn.Colors.PRIMARY, onClick: onClose }, t("close"))
        )
      );
    };
  }

  // bd-src/SorterButton.tsx
  var React7 = BdApi.React;
  var BUTTON_ID = "ss-sorter-btn";
  function FolderIcon() {
    return /* @__PURE__ */ React7.createElement(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        width: "40px",
        height: "24",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "#45a366",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      },
      /* @__PURE__ */ React7.createElement("path", { d: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" })
    );
  }
  function SorterButton({ onClick }) {
    return /* @__PURE__ */ React7.createElement(
      "div",
      {
        title: "Server Sorter",
        className: "vc-server-sorter-guild-wrapper",
        onClick
      },
      /* @__PURE__ */ React7.createElement(FolderIcon, null)
    );
  }
  function injectSorterButton(onClickModal, onRetry) {
    if (document.getElementById(BUTTON_ID)) return null;
    const guildListEl = document.querySelector('[class*="guilds_"]');
    if (!guildListEl) {
      setTimeout(onRetry, 1e3);
      return null;
    }
    const container = document.createElement("div");
    container.id = BUTTON_ID;
    if (BdApi.ReactDOM?.createRoot) {
      const root = BdApi.ReactDOM.createRoot(container);
      root.render(/* @__PURE__ */ React7.createElement(SorterButton, { onClick: onClickModal }));
    } else {
      BdApi.ReactDOM.render(/* @__PURE__ */ React7.createElement(SorterButton, { onClick: onClickModal }), container);
    }
    guildListEl.insertBefore(container, guildListEl.firstChild);
    return container;
  }
  function removeSorterButton(btn) {
    btn?.remove();
    document.getElementById(BUTTON_ID)?.remove();
  }

  // bd-src/Plugin.ts
  var ServerSorter = class {
    constructor() {
      this._guildStore = null;
      this._sortedGuildStore = null;
      this._settingsStore = null;
      this._localeStore = null;
      this._btnContainer = null;
      this._openCustomModal = (renderContent, { small = false } = {}) => {
        const container = document.createElement("div");
        document.body.appendChild(container);
        const React8 = BdApi.React;
        const ce7 = React8.createElement;
        let unmount;
        const close = () => unmount?.();
        const overlay = ce7("div", {
          className: "ss-overlay",
          onClick: (e) => {
            if (e.target === e.currentTarget) close();
          }
        }, ce7(
          "div",
          { className: `ss-window${small ? " ss-window--small" : ""}` },
          renderContent(close)
        ));
        unmount = this._mountModal(overlay, container);
        return close;
      };
    }
    getName() {
      return PLUGIN_ID;
    }
    getDescription() {
      return PLUGIN_DESC;
    }
    getVersion() {
      return PLUGIN_VER;
    }
    getAuthor() {
      return PLUGIN_AUTHOR;
    }
    start() {
      BdApi.DOM.addStyle(PLUGIN_ID, CSS);
      this._loadMods();
      this._injectButton();
      window.ServerSorterDebug = {
        openModal: () => this._openSorterModal(),
        applyFolderData: (f) => this._applyFolderData(f)
      };
    }
    stop() {
      BdApi.DOM.removeStyle(PLUGIN_ID);
      this._removeButton();
      delete window.ServerSorterDebug;
    }
    _loadMods() {
      const W = BdApi.Webpack;
      this._guildStore = W.getStore?.("GuildStore") ?? null;
      this._sortedGuildStore = W.getStore?.("SortedGuildStore") ?? null;
      this._localeStore = W.getStore?.("LocaleStore") ?? null;
      this._settingsStore = W.getModule?.((m) => m?.ProtoClass?.typeName?.includes?.("PreloadedUserSettings")) ?? W.getModule?.((m) => m?.ProtoClass?.typeName?.includes?.("PreloadedUserSettings"), { searchExports: true }) ?? W.getModule?.((m) => typeof m?.updateAsync === "function" && m?.ProtoClass?.typeName) ?? (W.getModules?.((m) => m?.ProtoClass?.typeName?.includes?.("PreloadedUserSettings")) ?? [])[0] ?? null;
      console.log("[ServerSorter] modules:", {
        GuildStore: !!this._guildStore,
        SortedGuildStore: !!this._sortedGuildStore,
        settingsStore: !!this._settingsStore,
        settingsTypeName: this._settingsStore?.ProtoClass?.typeName
      });
    }
    _t(key) {
      const locale = this._localeStore?.locale ?? "en";
      const lang = locale.startsWith("ja") ? "ja" : "en";
      const strings = STRINGS[lang];
      return strings[key] ?? STRINGS.en[key] ?? key;
    }
    _injectButton() {
      const btn = injectSorterButton(
        () => this._openSorterModal(),
        () => this._injectButton()
      );
      if (btn) this._btnContainer = btn;
    }
    _removeButton() {
      removeSorterButton(this._btnContainer);
      this._btnContainer = null;
    }
    async _applyFolderData(folders) {
      const store = this._settingsStore;
      if (!store) throw new Error("PreloadedUserSettings store \u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093");
      await store.updateAsync("guildFolders", (cur) => {
        cur.folders.length = 0;
        for (const f of folders) {
          if (f.folderId !== void 0) {
            const entry = { id: { value: String(f.folderId) }, guildIds: [...f.guildIds] };
            if (f.folderName) entry.name = { value: f.folderName };
            if (f.folderColor !== void 0) entry.color = { value: f.folderColor };
            cur.folders.push(entry);
          } else {
            for (const guildId of f.guildIds) cur.folders.push({ guildIds: [guildId] });
          }
        }
        return cur;
      }, 0);
    }
    _mountModal(element, container) {
      if (BdApi.ReactDOM?.createRoot) {
        const root = BdApi.ReactDOM.createRoot(container);
        root.render(element);
        return () => {
          root.unmount();
          container.remove();
        };
      }
      BdApi.ReactDOM.render(element, container);
      return () => {
        BdApi.ReactDOM.unmountComponentAtNode(container);
        container.remove();
      };
    }
    _openSorterModal() {
      if (!this._guildStore || !this._sortedGuildStore) {
        BdApi.UI.showToast("ServerSorter: stores not loaded", { type: "error" });
        return;
      }
      const t = (k) => this._t(k);
      const ServerSorterModal = makeServerSorterModal({
        GuildStore: this._guildStore,
        SortedGuildStore: this._sortedGuildStore,
        t,
        openCustomModal: this._openCustomModal,
        applyFolderData: (f) => this._applyFolderData(f)
      });
      this._openCustomModal((close) => BdApi.React.createElement(ServerSorterModal, { onClose: close }));
    }
  };
  var Plugin_default = ServerSorter;
  return __toCommonJS(Plugin_exports);
})();

module.exports = __ssPlugin.default;