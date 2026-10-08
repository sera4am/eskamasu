import { defineConfig } from "eslint/config";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([
    // グローバル除外
    {
        ignores: ["**/dist/", "**/node_modules/", "**/*.config.js", "**/*.config.mjs"]
    },

    // JavaScript/TypeScript共通設定
    js.configs.recommended,

    // TypeScriptファイル用の設定
    {
        files: ["**/*.ts", "**/*.tsx"],

        plugins: {
            "@typescript-eslint": typescriptEslint,
        },

        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.jest,
            },

            parser: tsParser,
            ecmaVersion: "latest",
            sourceType: "module",

            parserOptions: {
                project: "./tsconfig.json",
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },

        rules: {
            // JavaScript用のno-unused-varsを無効化（重要！）
            "no-unused-vars": "off",

            // TypeScript用のno-unused-varsを有効化
            "@typescript-eslint/no-unused-vars": ["error", {
                vars: "all",
                args: "after-used",
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_",
                caughtErrors: "all",
                caughtErrorsIgnorePattern: "^_",
                ignoreRestSiblings: true,
            }],

            // no-undefもTypeScript側で処理されるのでoff
            "no-undef": "off",

            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "@typescript-eslint/no-explicit-any": "off",

            // case文での変数宣言を許可
            "no-case-declarations": "off",
        },
    },
]);
