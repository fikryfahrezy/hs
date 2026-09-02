import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";

const DEFAULT_DEV_PORT = 5173;
const DEFAULT_DEV_API_PROXY_TARGET = "http://localhost:3000";

export default defineConfig(({ mode }) => {
  // `apps/web/.env` is optional; the defaults below keep the dev server working
  // without one. See `apps/web/.env.example`.
  const environment = loadEnv(
    mode,
    fileURLToPath(new URL(".", import.meta.url)),
    "VITE_",
  );

  return {
    plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
    resolve: {
      alias: {
        "#app": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      port: Number(environment.VITE_DEV_PORT) || DEFAULT_DEV_PORT,
      proxy: {
        "/api":
          environment.VITE_DEV_API_PROXY_TARGET || DEFAULT_DEV_API_PROXY_TARGET,
      },
    },
  };
});
