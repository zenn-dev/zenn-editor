import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  tsconfig: "./tsconfig.json",
  outDir: "dist",
  dts: true,
  clean: true,
  sourcemap: true,
  format: ["esm", "cjs"],
});
