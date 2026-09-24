import { fileURLToPath } from "node:url";
import { defineConfig, lazyPlugins } from "vite-plus";
import { devtools } from "@tanstack/devtools-vite";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact from "@vitejs/plugin-react";
import stylex from "@stylexjs/unplugin";

const srcDir = fileURLToPath(new URL("./src", import.meta.url));

const config = defineConfig({
  fmt: {},
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
  test: {
    include: ["src/**/*.test.ts"],
  },
  resolve: { tsconfigPaths: true },
  plugins: lazyPlugins(() => [
    devtools(),
    stylex.vite({ aliases: { "#/*": [`${srcDir}/*`] } }),
    tanstackStart(),
    viteReact(),
  ]),
});

export default config;
