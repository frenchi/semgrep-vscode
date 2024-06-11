#!/usr/bin/env node

import cssModulesPlugin from "esbuild-css-modules-plugin";
import esbuild from "esbuild";

async function buildExtension(watch) {
  const options = {
    logLevel: "info",
    entryPoints: ["./src/extension.ts"],
    outfile: "./out/main.js",
    bundle: true,
    platform: "node",
    format: "cjs",
    external: ["vscode"],
    sourcemap: isSourcemap,
  };
  if (watch) {
    let ctx = await esbuild.context(options);
    await ctx.watch();
  } else {
    await esbuild.build(options);
  }
}
async function buildSearchWebview(watch) {
  let options = {
    logLevel: "info",
    entryPoints: ["./src/search-ui/index.tsx"],
    outfile: "./out/search-webview.js",
    bundle: true,
    plugins: [cssModulesPlugin()],
    sourcemap: isSourcemap,
  };
  if (watch) {
    let ctx = await esbuild.context(options);
    await ctx.watch();
  } else {
    await esbuild.build(options);
  }
}
async function buildAiChatWebview(watch) {
  let options = {
    logLevel: "info",
    entryPoints: ["./src/ai-chat/index.tsx"],
    outfile: "./out/ai-chat-webview.js",
    bundle: true,
    plugins: [cssModulesPlugin()],
    sourcemap: isSourcemap,
  };
  if (watch) {
    let ctx = await esbuild.context(options);
    await ctx.watch();
  } else {
    await esbuild.build(options);
  }
}

const isWatch = process.argv.includes("--watch");
const isSourcemap = process.argv.includes("--sourcemap");

await Promise.all([
  buildExtension(isWatch, isSourcemap),
  buildSearchWebview(isWatch, isSourcemap),
  buildAiChatWebview(isWatch, isSourcemap),
]);
