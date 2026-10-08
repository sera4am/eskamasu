# eskamasu

[![Tests](https://github.com/sera4am/eskamasu/actions/workflows/test.yml/badge.svg)](https://github.com/sera4am/eskamasu/actions/workflows/test.yml)
[![npm version](https://img.shields.io/npm/v/eskamasu)](https://www.npmjs.com/package/eskamasu)

[ansuko](https://github.com/sera4am/ansuko) の es-toolkit 版。[es-toolkit](https://github.com/toss/es-toolkit)（`es-toolkit/compat`、lodash互換）を拡張した、実用的で直感的な動作を提供するモダンなJavaScript/TypeScriptユーティリティライブラリ。

[English](./README.md) | [日本語](./README.ja.md) | [简体中文](./README.zh.md)

## なぜ eskamasu？

**eskamasu = es-toolkit + ansuko 流の拡張。**

eskamasu は [ansuko](https://github.com/sera4am/ansuko) の兄弟ライブラリです。独自関数とプラグイン（ja / geo / prototype）は同一で、違いはベースライブラリだけです：

| | ベースライブラリ | こんなときに |
|---|---|---|
| [ansuko](https://github.com/sera4am/ansuko) | `lodash` | lodash との完全な互換性が欲しい |
| **eskamasu** | `es-toolkit/compat` | es-toolkit をベースにしたい |

ansuko と同様、すべての関数は1つの `_` オブジェクトにまとめられています。これは意図的な設計で、`map` / `get` / `toNumber` のような短く汎用的な名前でモジュールスコープを汚さないためです。そのため、tree-shaking はこのライブラリの目標ではありません。

## インストール

```bash
npm install eskamasu
```

または `package.json` に追加：

```json
{
  "dependencies": {
    "eskamasu": "^0.1.0"
  }
}
```

## 基本思想

eskamasuは直感的な動作でJavaScriptのよくある不満を解消します：

### lodash互換の癖を修正

`es-toolkit/compat` は lodash の挙動を癖も含めて忠実に再現しています。eskamasu はそれを修正します：

```typescript
// ❌ lodash / es-toolkit/compat（直感的でない）
_.isEmpty(0)           // true  - 0は本当に「空」？
_.isEmpty(true)        // true  - trueは「空」？
_.castArray(null)      // [null] - なぜnullを残す？

// ✅ eskamasu（直感的）
_.isEmpty(0)           // false - 数値は空ではない
_.isEmpty(true)        // false - 真偽値は空ではない
_.castArray(null)      // []    - クリーンな空配列
```

元の実装は `_.isEmptyOrg` / `_.toNumberOrg` / `_.castArrayOrg`（`es-toolkit/compat` の実装）として引き続き利用できます。

### 安全なJSON処理

```typescript
// ❌ 標準JSON（面倒）
JSON.stringify('hello')  // '"hello"'  - 余計な引用符！
JSON.parse(badJson)      // throws     - try-catchが必要

// ✅ eskamasu（スムーズ）
_.jsonStringify('hello')     // null     - オブジェクトではない
_.jsonStringify({ a: 1 })    // '{"a":1}' - クリーン
_.parseJSON(badJson)         // null     - 例外なし
_.parseJSON('{ a: 1, }')     // {a:1}    - JSON5対応！
```

### Promise対応のフォールバック

```typescript
// ❌ 冗長なパターン
const data = await fetchData()
const result = data ? data : await fetchBackup()

// ✅ eskamasu（簡潔）
const result = await _.valueOr(
  () => fetchData(),
  () => fetchBackup()
)
```

### スマートな比較

```typescript
// ❌ 冗長な三項演算子地獄
const value = a === b ? a : (a == null && b == null ? a : defaultValue)

// ✅ eskamasu（読みやすい）
const value = _.equalsOr(a, b, defaultValue)  // null == undefined
```

## 主な機能

### 拡張されたes-toolkit/compat関数

- **`isEmpty`** - 空かどうかチェック（数値と真偽値は空ではない）
- **`castArray`** - 配列に変換、null/undefinedは `[]` を返す
- すべての `es-toolkit/compat` 関数が利用可能: `size`, `isNil`, `debounce`, `isEqual`, `keys`, `values`, `has` など（一部の例外は [lodash / ansuko との違い](#lodash--ansuko-との違い) を参照）

### 値処理とフロー制御

- **`valueOr`** - Promise/関数対応で値またはデフォルトを取得
- **`emptyOr`** - 空ならnullを返し、それ以外はコールバックを適用または値を返す
- **`hasOr`** - パスの存在確認、なければデフォルトを返す（深いパス & Promise対応）
- **`equalsOr`** - Promise対応の比較とフォールバック、直感的なnil処理
- **`changes`** - DB更新用のオブジェクト差分追跡（`profile.tags[1]` のような深いパス & 除外モード対応）
- **`swallow`** - エラー時にundefinedを返す関数実行（同期/非同期対応）
- **`swallowMap`** - エラーをundefinedとして扱う配列map（compactモードでエラー除外可）

### 型変換と検証

- **`toNumber`** - カンマ・全角対応の数値パース、`toFixed` で丸め可、無効時は `null`
- **`toBool`** - スマートな真偽値変換（"yes"/"no"/"true"/"false"/数値）、未検出時の動作を設定可能
- **`boolIf`** - フォールバック付き安全な真偽値変換
- **`isValidStr`** - 非空文字列検証
- **`isValidEmail`** - メールアドレス形式の検証（前後に空白がある値は無効）

### JSON処理

- **`parseJSON`** - try-catch不要の安全なJSON/JSON5パース（コメント & 末尾カンマ対応）
- **`jsonStringify`** - 有効なオブジェクトのみを文字列化、文字列のラップを防止

### 配列ユーティリティ

- **`arrayDepth`** - 配列のネスト深さを返す（非配列: 0、空配列: 1）
- **`castArray`** - 配列に変換、nilは `[]` になる（`[null]` にならない）

### 日本語テキスト（プラグイン: `eskamasu/plugins/ja`）

- **`kanaToFull`** - 半角カナ → 全角カナ（例: `ｶﾞｷﾞ` → `ガギ`）
- **`kanaToHalf`** - 全角 → 半角カナ（濁点分割: `ガギ` → `ｶﾞｷﾞ`）
- **`kanaToHira`** - カナ → ひらがな（半角は自動的に全角化）
- **`hiraToKana`** - ひらがな → カナ
- **`toHalfWidth`** - 全角 → 半角、オプションでハイフン正規化
- **`toFullWidth`** - 半角 → 全角、オプションでハイフン正規化
- **`haifun`** - 様々なハイフンを単一文字に正規化

### Geoユーティリティ（プラグイン: `eskamasu/plugins/geo`）

- **`toGeoJson`** - 自動検出付きの汎用GeoJSONコンバーター（高次元から順に試行）
- **`toPointGeoJson`** - 座標/オブジェクトをPoint GeoJSONに変換
- **`toPolygonGeoJson`** - 外周リングをPolygonに変換（閉じたリングを検証）
- **`toLineStringGeoJson`** - 座標をLineStringに変換（自己交差をチェック）
- **`toMultiPointGeoJson`** - 複数の点をMultiPointに変換
- **`toMultiPolygonGeoJson`** - 複数のポリゴンをMultiPolygonに変換
- **`toMultiLineStringGeoJson`** - 複数の線をMultiLineStringに変換
- **`unionPolygon`** - 複数のPolygon/MultiPolygonを単一のジオメトリに結合
- **`parseToTerraDraw`** - GeoJSONをTerra Draw互換のフィーチャーに変換
- **`mZoomInterpolate`** - ズームオブジェクトをMapBox補間式に変換
- **`mProps`** - camelCaseプロパティをMapBox互換形式に変換（minzoom、visibilityなどの特殊ケースに対応）

### Prototype拡張（プラグイン: `eskamasu/plugins/prototype`）

- **`Array.prototype.notMap`** - 否定された述語でmap → boolean配列
- **`Array.prototype.notFilter`** - 否定された述語でfilter（一致しない項目）

### タイミングユーティリティ

- **`waited`** - N個のアニメーションフレーム後に実行を遅延（React/DOMには `setTimeout` より良い）

## プラグインアーキテクチャ

eskamasuはコア + オプトインのプラグインアーキテクチャを採用しています：

- **コア**: すべての `es-toolkit/compat` 関数 + eskamasu 独自のユーティリティ
- **日本語プラグイン**: 日本語テキスト処理が必要な場合のみ読み込み
- **Geoプラグイン**（@turf/turf に依存）: GISアプリケーション用
- **Prototypeプラグイン**: Array prototypeの拡張が必要な場合のみ

```typescript
// コア
import _ from 'eskamasu'

// 必要に応じて日本語サポートを追加
import 'eskamasu/plugins/ja'  // side-effect import

// マッピングアプリ用にGIS機能を追加
import 'eskamasu/plugins/geo'
```

プラグインは side-effect import で読み込みます。`import 'eskamasu/plugins/<name>'` を一度書くだけで、`_` の実体と TypeScript の型（`declare module` merging 経由）が同時に拡張されるため、`_` に対して直接 IDE の補完が効きます。import しないプラグインはバンドルに含まれません。

## クイックスタート

### 基本的な使い方

```typescript
import _ from 'eskamasu'

// 拡張されたes-toolkit/compat関数
_.isEmpty(0)           // false（lodash / es-toolkit/compat のようにtrueではない！）
_.isEmpty([])          // true
_.castArray(null)      // []（[null]ではない！）
_.toNumber('1,234.5')  // 1234.5

// Promise対応の値処理
const value = await _.valueOr(
  () => cache.get(id),
  () => api.fetch(id)
)

// 安全なJSONパース
const data = _.parseJSON('{ "a": 1, /* comment */ }')  // JSON5対応！

// メールアドレス検証
_.isValidEmail('user@example.com')   // true
_.isValidEmail(' user@example.com ') // false

// データベース更新用のオブジェクト変更追跡
const diff = _.changes(
  original, 
  updated, 
  ['name', 'email', 'profile.bio']
)

// try-catch不要のエラーハンドリング
const result = _.swallow(() => riskyOperation())  // エラー時はundefined
const items = _.swallowMap([1, 2, 3], item => processItem(item), true)  // エラーを除外
```

### プラグインの使用

#### 日本語テキストプラグイン

```typescript
import _ from 'eskamasu'
import 'eskamasu/plugins/ja'

_.kanaToFull('ｶﾞｷﾞ')              // 'ガギ'
_.kanaToHira('アイウ')             // 'あいう'
_.toHalfWidth('ＡＢＣー１２３', '-') // 'ABC-123'
_.haifun('test‐data', '-')       // 'test-data'
```

#### Geoプラグイン

```typescript
import _ from 'eskamasu'
import 'eskamasu/plugins/geo'

// 様々な形式をGeoJSONに変換
_.toPointGeoJson([139.7671, 35.6812])
// => { type: 'Point', coordinates: [139.7671, 35.6812] }

_.toPointGeoJson({ lat: 35.6895, lng: 139.6917 })
// => { type: 'Point', coordinates: [139.6917, 35.6895] }

// 複数のポリゴンを結合
const unified = _.unionPolygon([polygon1, polygon2])

// MapBoxユーティリティ
_.mZoomInterpolate({ 10: 1, 15: 5, 20: 10 })
// => ["interpolate", ["linear"], ["zoom"], 10, 1, 15, 5, 20, 10]

_.mProps({
  fillColor: "#ff0000",
  sourceLayer: "buildings",
  visibility: true
})
// => { "fill-color": "#ff0000", "source-layer": "buildings", "visibility": "visible" }
```

#### Prototypeプラグイン

```typescript
import 'eskamasu/plugins/prototype'

// Array.prototypeが拡張される
[1, 2, 3].notMap(n => n > 1)      // [true, false, false]
[1, 2, 3].notFilter(n => n % 2)   // [2]（偶数）
```

### 複数プラグインの併用

```typescript
import _ from 'eskamasu'
import 'eskamasu/plugins/ja'
import 'eskamasu/plugins/geo'

// 日本語とGeoユーティリティの両方が `_` で使える
_.kanaToHira('アイウ')
_.toPointGeoJson([139.7, 35.6])
```

各プラグインは複数ファイルから import されても登録は1回のみです（重複登録ガードを内蔵）。

## lodash / ansuko との違い

`_` は `{ ...es-toolkit/compat, ...eskamasu 独自関数 }` です。以下の lodash 関数は `es-toolkit/compat` に存在しないため、`_` では**利用できません**：

- `chain`
- `mixin`
- `sortedUniq`, `sortedUniqBy`
- `tap`, `thru`
- `noConflict`
- `runInContext`

`_(value).map(...)` のようなラッパー形式の呼び出しもサポートしていません（ansuko でもサポートしていませんでした）。それ以外（eskamasu 独自関数とプラグインを含む）は ansuko と同じ動作です。

## ドキュメント

eskamasu の独自関数とプラグインは ansuko と同じ API なので、ansuko のドキュメントがそのまま使えます（import パスの `ansuko` を `eskamasu` に読み替えてください）：

- **[APIリファレンス](https://github.com/sera4am/ansuko/blob/main/docs/API.ja.md)** - 例付きの完全なAPIドキュメント
- **[使用ガイド](https://github.com/sera4am/ansuko/blob/main/docs/Guide.ja.md)** - 実際の使用例とパターン

## TypeScriptサポート

型定義を含む完全なTypeScriptサポート。すべての関数はジェネリック対応で完全に型付けされています。

## なぜlodash / es-toolkitだけでは不十分なのか？

lodashは優れており、es-toolkit/compat はモダンな実装で lodash 互換性を提供します。しかしその互換性には、[コミュニティで批判されている](https://github.com/lodash/lodash/issues)いくつかの癖も含まれています：

### 修正された動作

1. **`_.isEmpty(true)` が `true` を返す** - 真偽値は本当に「空」？
2. **`_.isEmpty(1)` が `true` を返す** - 数値1は「空」？
3. **`_.castArray(null)` が `[null]` を返す** - なぜnullを配列に含める？

### lodash / es-toolkitにない追加ユーティリティ

4. **安全なJSONパースがない** - 常にtry-catchブロックが必要
5. **フォールバック付き組み込み比較がない** - 冗長な三項演算子パターンがいたるところに
6. **Promise対応の値解決がない** - 手動のPromise処理が面倒
7. **オブジェクト差分追跡がない** - DB更新に外部ライブラリが必要
8. **`JSON.stringify("hello")` が引用符を追加** - `'"hello"'` という引用符が厄介

### 実際の使用例

```typescript
// lodash / es-toolkitでの一般的なパターン（冗長でエラーが起きやすい）
let data
try {
  const cached = cache.get(id)
  if (cached && !_.isEmpty(cached)) {
    data = cached
  } else {
    const fetched = await api.fetch(id)
    data = fetched || defaultValue
  }
} catch (e) {
  data = defaultValue
}

// eskamasuでの同じロジック（簡潔で安全）
const data = await _.valueOr(
  () => cache.get(id),
  () => api.fetch(id),
  defaultValue
)
```

eskamasuは、`es-toolkit/compat` の API を `_` 上でそのまま使えるようにしつつ（[lodash / ansuko との違い](#lodash--ansuko-との違い) に挙げた関数を除く）、これらの問題を修正し、モダンなJavaScript開発のための強力なユーティリティを追加しています。

## 依存関係

- **`es-toolkit`** - コアユーティリティ関数（`es-toolkit/compat` 経由）
- **`json5`** - コメントと末尾カンマ対応の拡張JSONパース
- **`@turf/turf`** - 地理空間解析（geoプラグインで使用）

## ソースからのビルド

```bash
npm install
npm run build
```

これにより、`dist` ディレクトリにコンパイルされたJavaScriptと型定義が生成されます。

## 開発

テストとドキュメントが苦手なので、壁打ちとドキュメントにClaudeを使ってます。

## ライセンス

MIT

## 作者

世来 直人
