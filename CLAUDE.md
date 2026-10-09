# eskamasu プロジェクトメモ

eskamasu は [ansuko](https://github.com/sera4am/ansuko) (`~/proj/ansuko`) の **es-toolkit 版**。
ansuko v2.0.11 をコピーし、ベースを `lodash` → `es-toolkit/compat` に差し替えたもの。コード共有はしていない（独立リポジトリ）。

**ansuko との最大の違い: `_` オブジェクトを使わず named export で提供する**（v0.2.0〜）。
`import { isEmpty, get } from "eskamasu"` の形で、tree-shaking が効くことが es-toolkit ベースにする意義。

### ansuko との同期ルール
- 独自関数・プラグインに変更を入れたら、**もう片方にも同じ変更を入れるか検討する**（基本は両方に反映）
- 関数の中身（ロジック）は ansuko と揃える。違いは「ベースライブラリ」と「公開方法（ansuko は `_`、eskamasu は named export）」
- ベース関数の import は `import * as lodash from "es-toolkit/compat"`（変数名は ansuko と差分を減らすため `lodash` のまま）
- プラグイン内部は `import * as _ from "../index.js"` で namespace import しているので、本体の `_.xxx` の書き方は ansuko とほぼ同じまま移植できる

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

## エクスポート / プラグインアーキテクチャ (重要)

### ユーザー側の使い方
```ts
import { isEmpty, get, valueOr } from "eskamasu"           // es-toolkit/compat 全関数 + 独自関数
import { kanaToFull } from "eskamasu/plugins/ja"
import { toPointGeoJson } from "eskamasu/plugins/geo"
import "eskamasu/plugins/prototype"                         // これだけは side-effect import
```

### 仕組み
- `src/index.ts` で `export * from "es-toolkit/compat"` し、独自関数を明示的に `export { ... }` している
  - 名前が被る `isEmpty` / `toNumber` / `castArray` は ESM の仕様で明示 export が優先される（上書き）
  - 上書き前のオリジナルは `isEmptyOrg` / `toNumberOrg` / `castArrayOrg` として export
- default export (`_`) は**作らない**（作るとバンドルに全関数が入って tree-shaking が死ぬ）
- `ja` / `geo` はサブパスで分けている（`@turf/turf` などの重い依存を本体に入れないため）
- `package.json` の `sideEffects` に `plugins/prototype.js` だけを列挙している

### 新しいプラグインを追加する場合の手順
1. `src/plugins/<name>.ts` を作成
2. 既存プラグイン (`ja.ts` / `geo.ts`) を参考に、`import * as _ from "../index.js"` で本体を参照し、公開関数を末尾で `export { ... }` する
   - prototype 拡張のような side-effect を持つ場合は `package.json` の `sideEffects` に追加する
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

テストは `tests/*.test.js` (ビルド済み dist を import する形式)。`vitest run` で全テスト通過することを保証する運用。

---

## 注意事項

- **`README.md` / `README.ja.md` / `README.zh.md` は同期して更新する**（3言語で内容が乖離しないように）
- **es-toolkit/compat の関数を手書きで再エクスポートしない**（`export *` で自動的に再エクスポートしている）
- **default export の `_` を復活させない**（tree-shaking が効かなくなる。v0.2.0 で削除済み）
- **`dist/` は git 管理対象**（npm publish 時にビルド済みコードが必要なため）
