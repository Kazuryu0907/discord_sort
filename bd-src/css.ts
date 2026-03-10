export const CSS = `
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
