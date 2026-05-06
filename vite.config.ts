import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

/** Défaut si aucun `.env` / variable `PORT` — doit rester aligné avec `.env.example`. */
const FALLBACK_PORT = 9012;

function resolvePort(env: Record<string, string>): number {
  const raw = env.PORT;
  const n = raw !== undefined ? Number.parseInt(raw, 10) : FALLBACK_PORT;
  return Number.isFinite(n) && n > 0 ? n : FALLBACK_PORT;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const port = resolvePort(env);

  return {
    plugins: [react()],
    server: {
      port,
      host: true,
    },
    preview: {
      port,
      host: true,
    },
  };
});
