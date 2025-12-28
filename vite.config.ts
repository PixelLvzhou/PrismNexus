import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import { viteMockServe } from "vite-plugin-mock";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    viteMockServe({
      // mock文件目录
      mockPath: "src/mock",
      // 开发环境启用mock
      enable: true,
    }),
  ],
  // 已更新为正确的GitHub仓库名称'shanhaijing'
  base: "/shanhaijing/",
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  // 配置服务器选项，允许通过自定义域名访问
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    cors: true,
  },
  // 配置输出目录为docs，用于GitHub Pages部署
  build: {
    outDir: "docs",
  },
});
