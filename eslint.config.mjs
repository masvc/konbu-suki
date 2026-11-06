import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Prisma の生成物。手で書いていないので対象外にする
    "src/generated/**",
    // 作業用の置き場。スクリプトが出す JSON や、確認に使った使い捨ての .ts が入る。
    // gitignore の対象だが eslint は見に行くので、ここでも外す。残っていると
    // 本体に問題が無いのに lint が落ち、push 前チェックが止まる。
    "scripts/tmp/**",
  ]),
]);

export default eslintConfig;
