import react from "@vitejs/plugin-react";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import { resolve } from "path";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        "@main": resolve(`src/main`),
        "@shared": resolve(`src/shared`),
      },
    },
  },
  preload: {
    resolve: {
      alias: {
        "@shared": resolve(`src/shared`),
      },
    },
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    resolve: {
      alias: {
        "@renderer": resolve(`src/renderer/src`),
        "@shared": resolve(`src/shared`),
      },
    },
    plugins: [react()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, "src/renderer/index.html"),
          input: resolve(__dirname, "src/renderer/input.html"),
        },
      },
    },
  },
});
