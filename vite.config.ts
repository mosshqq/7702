import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
