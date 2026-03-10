#!/usr/bin/env node
/**
 * Build script for ServerSorter BetterDiscord plugin.
 * Bundles bd-src/Plugin.ts (TypeScript) into a single ServerSorter.plugin.js
 *
 * Usage: node build-bd.js
 */

const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");
const os = require("os");

const HEADER = `/**
 * @name ServerSorter
 * @description Sort Discord servers via drag & drop GUI
 * @version 2.0.0
 * @author kazuryu
 */`;

const DESTINATIONS = [
    path.join(__dirname, "ServerSorter.plugin.js"),
    path.join(os.homedir(), "Library/Application Support/BetterDiscord/plugins/ServerSorter.plugin.js"),
];

// --ci flag (or CI=true env var set automatically by GitHub Actions):
// Only writes to DESTINATIONS[0] (repo-local ServerSorter.plugin.js).
// Without the flag, also copies to the local BetterDiscord plugins directory.
const isCI = process.argv.includes("--ci") || process.env.CI === "true";

async function build() {
    const result = await esbuild.build({
        entryPoints: [path.join(__dirname, "bd-src/Plugin.ts")],
        bundle: true,
        // iife avoids relying on `exports` being defined in BD's loader context
        format: "iife",
        globalName: "__ssPlugin",
        platform: "browser",
        target: "es2020",
        write: false,
        logLevel: "info",
    });

    // iife output: var __ssPlugin = (() => { ... })();
    // export default class → __ssPlugin.default = ServerSorter
    const bundled = result.outputFiles[0].text;
    const output = `${HEADER}\n\n${bundled}\nmodule.exports = __ssPlugin.default;`;

    for (const dest of (isCI ? DESTINATIONS.slice(0, 1) : DESTINATIONS)) {
        fs.writeFileSync(dest, output);
        console.log(`✓ Built: ${dest}`);
    }
}

build().catch(err => { console.error(err); process.exit(1); });
