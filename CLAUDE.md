# eskamasu プロジェクトメモ

eskamasu は [ansuko](https://github.com/sera4am/ansuko) (`~/proj/ansuko`) の **es-toolkit 版**。
ansuko v2.0.11 をコピーし、ベースを `lodash` → `es-toolkit/compat` に差し替えたもの。コード共有はしていない（独立リポジトリ）。

### ansuko との同期ルール
- 独自関数・プラグインに変更を入れたら、**もう片方にも同じ変更を入れるか検討する**（基本は両方に反映）
- 違いは「ベースライブラリ」と「識別子の接頭辞 (`Ansuko*` / `Eskamasu*`)」だけに保つ
- ベース関数の import は `import * as lodash from "es-toolkit/compat"`（変数名は ansuko と差分を減らすため `lodash` のまま）
- namespace import には `default`（toolkit 関数）が含まれるので、`_` に展開する時と型 (`Omit<typeof lodash, "default">`) で除外している

このファイルは Claude Code が起動時に自動で読み込みます。
プロジェクト固有の「忘れがちな運用ルール」を集約しておく場所です。

---

## コミットメッセージ

- **コミットのタイトル・本文は英語で書く**（deploy.sh に渡すコミットメッセージ、CHANGELOG、リリースノートなどリリース周りも英語）

---

## リリースフロー (deploy.sh + CHANGELOG hook)

### 通常の開発中
1. コードを編集
2. **`CHANGELOG.md` の `## [Unreleased]` セクションに変更内容を追記**
   - サブセクションは Keep a Changelog 標準: `### Added` / `### Changed` / `### Deprecated` / `### Removed` / `### Fixed` / `### Security`
   - 破壊的変更には `(BREAKING)` を見出しに付ける（例: `### Removed (BREAKING)`）
3. `git commit` して push（バージョン番号はまだ気にしない）

### リリース時
```bash
./deploy.sh "コミットメッセージ" patch    # patch / minor / major
```

deploy.sh の内部フロー:
1. ユーザーの commit を push
2. `npm run build`
3. `npm version <patch|minor|major>` を実行
   - **ここで `scripts/promote-changelog.sh` が自動実行される** (`package.json` の `scripts.version` 経由)
   - `[Unreleased]` 見出しの直下に新バージョン見出し `## [X.Y.Z] - YYYY-MM-DD` を差し込む
   - 末尾の参照リンク (`[Unreleased]: .../compare/...HEAD` など) も自動追従
   - `git add CHANGELOG.md` して同じ commit に同梱
4. `git push --follow-tags`（version commit とタグをまとめて push）
5. `npm publish`

### CHANGELOG が空のまま patch リリースしてもよい？
OK。`[Unreleased]` の下に新バージョン見出しが並ぶだけ。気になるなら手動で `_No notable changes._` を書き足す。

### hook を一時無効化したい場合
`npm version <type> --no-commit-hooks`

### promote スクリプトのテスト
本番 commit せずに動作確認したい時は:
```bash
cp CHANGELOG.md /tmp/CHANGELOG.md.bak
npm_package_version=99.0.0 bash scripts/promote-changelog.sh
diff /tmp/CHANGELOG.md.bak CHANGELOG.md
# 確認後に元に戻す
mv /tmp/CHANGELOG.md.bak CHANGELOG.md
```

---

## プラグインアーキテクチャ (重要)

ansuko v1 にあった `_.extend(plugin)` は採用していない（ansuko v2 で型サジェストが効かない問題により削除済み）。

### ユーザー側の使い方
```ts
import _ from "eskamasu"
import "eskamasu/plugins/ja"     // ← side-effect import で _ が拡張される (型 + 実体)
import "eskamasu/plugins/geo"
import "eskamasu/plugins/prototype"

_.kanaToFull("ｶﾞ")              // 型サジェストが効く
```

### 仕組み
- `src/index.ts` の `EskamasuType` は `Omit<es-toolkit/compat, ...>` を継承（es-toolkit/compat の関数を手書き列挙していない）
- 各プラグインが `declare module "../index.js" { interface EskamasuType extends ... }` で型を merge
- `_.__plugins: Set<string>` で重複登録ガード（同じプラグインを複数ファイルから import しても1回だけ実行）

### 新しいプラグインを追加する場合の手順
1. `src/plugins/<name>.ts` を作成
2. ファイルの構造は既存プラグイン (`ja.ts` / `geo.ts` / `prototype.ts`) を参考に:
   - 公開する関数群を `Eskamasu<Name>Extension` interface で定義してエクスポート
   - `declare module "../index.js" { interface EskamasuType extends Eskamasu<Name>Extension {} }` を書く
   - `const PLUGIN_NAME = "<name>"; if (!_.__plugins.has(PLUGIN_NAME)) { _.__plugins.add(PLUGIN_NAME); /* 実装 */ }` で重複ガード
   - 末尾に `export {}` を入れて ESM module 化
3. `package.json` の `exports` に `"./plugins/<name>": "./dist/plugins/<name>.js"` を追加
4. `tests/<name>.plugin.test.js` をビルド済み dist 経由で書く（既存テスト参考）
5. README 3言語 (`README.md` / `README.ja.md` / `README.zh.md`) の「Plugins」セクションに使い方を追加
6. `CHANGELOG.md` の `[Unreleased]` に追記

---

## テストとビルド

```bash
npm run build       # tsc only
npm run typecheck   # 型チェックのみ
npm test            # build + vitest
npm run test:watch  # vitest watch mode
npm run lint        # eslint
```

テストは `tests/*.test.js` (ビルド済み dist を import する形式)。`vitest run` で全34テスト通過することを保証する運用。

---

## 注意事項

- **`README.md` / `README.ja.md` / `README.zh.md` は同期して更新する**（3言語で内容が乖離しないように）
- **`EskamasuType` interface に es-toolkit/compat の関数を手書きで追加しない**（`Omit<typeof lodash, ...>` で自動継承している）
- **`_.extend()` を復活させない**（型サジェストが効かない構造的問題があったため ansuko v2 で削除済み）
- **`dist/` は git 管理対象**（npm publish 時にビルド済みコードが必要なため）
