import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base:
    process.env.NODE_ENV === "production"
      ? "/7702/" // 注意结尾斜杠
      : "/",
  build: {
    assetsDir: "static", // 统一资源目录
    manifest: true, // 生成资源映射表
  },
  server: {
    port: 3000,
    proxy: {
      "/rpc": {
        target: "https://net8889eth.confluxrpc.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rpc/, ""),
      },
    },
  },
});
