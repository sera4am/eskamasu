# eskamasu

[![Tests](https://github.com/sera4am/eskamasu/actions/workflows/test.yml/badge.svg)](https://github.com/sera4am/eskamasu/actions/workflows/test.yml)
[![npm version](https://img.shields.io/npm/v/eskamasu)](https://www.npmjs.com/package/eskamasu)

[ansuko](https://github.com/sera4am/ansuko) 的 es-toolkit 版。在 [es-toolkit](https://github.com/toss/es-toolkit)（`es-toolkit/compat`，兼容 lodash）基础上扩展、提供实用且直观易懂的现代JavaScript/TypeScript工具库。

[English](./README.md) | [日本語](./README.ja.md) | [简体中文](./README.zh.md)

## 为什么选择 eskamasu？

**eskamasu = es-toolkit + ansuko 风格的扩展。**

eskamasu 是 [ansuko](https://github.com/sera4am/ansuko) 的姊妹库。自有函数与插件（ja / geo / prototype）完全相同，唯一的区别是底层库：

| | 底层库 | 适用场景 |
|---|---|---|
| [ansuko](https://github.com/sera4am/ansuko) | `lodash` | 需要与 lodash 完全兼容 |
| **eskamasu** | `es-toolkit/compat` | 希望以 es-toolkit 为基础 |

与 ansuko 一样，所有函数都集中在一个 `_` 对象下。这是有意为之：避免 `map`、`get`、`toNumber` 这类简短通用的名称污染模块作用域。因此，tree-shaking 并不是本库的目标。

## 安装

```bash
npm install eskamasu
```

或添加到你的 `package.json`：

```json
{
  "dependencies": {
    "eskamasu": "^0.1.0"
  }
}
```

## 核心理念

eskamasu以直观的语法,解决了JavaScript中常见的痛点。

### 修正 lodash 兼容的非常规行为

`es-toolkit/compat` 忠实再现了 lodash 的行为，包括其怪癖。eskamasu 对此进行了修正：

```typescript
// ❌ lodash / es-toolkit/compat（不直观）
_.isEmpty(0)           // true  - 0真的为「空」吗？
_.isEmpty(true)        // true  - true算「空」吗？
_.castArray(null)      // [null] - 为何保留null？

// ✅ eskamasu（直观）
_.isEmpty(0)           // false - 数值不为空
_.isEmpty(true)        // false - 布尔值不为空
_.castArray(null)      // []    - 得到空数组
```

原始实现仍可通过 `_.isEmptyOrg`、`_.toNumberOrg`、`_.castArrayOrg`（`es-toolkit/compat` 的实现）使用。

### 安全的 JSON 处理

```typescript
// ❌ 标准 JSON（繁琐）
JSON.stringify('hello')  // '"hello"'  - 多余的引号
JSON.parse(badJson)      // throws    - 必须用try-catch

// ✅ eskamasu（简洁直观）
_.jsonStringify('hello')     // null     - 非对象不序列化
_.jsonStringify({ a: 1 })    // '{"a":1}' - 结构简洁
_.parseJSON(badJson)         // null     - 不抛异常
_.parseJSON('{ a: 1, }')     // {a:1}    - 支持JSON5！
```

### 支持Promise的回滚

```typescript
// ❌ 冗长写法
const data = await fetchData()
const result = data ? data : await fetchBackup()

// ✅ eskamasu（简洁）
const result = await _.valueOr(
  () => fetchData(),
  () => fetchBackup()
)
```

### 智能比较

```typescript
// ❌ 三元运算符地狱
const value = a === b ? a : (a == null && b == null ? a : defaultValue)

// ✅ eskamasu（可读）
const value = _.equalsOr(a, b, defaultValue)  // null == undefined
```

## 主要特性

### 增强型es-toolkit/compat函数

- **`isEmpty`** - 检查是否为空（数字和布尔值不视为空）
- **`castArray`** - 转换为数组，若为null/undefined 则返回 `[]`
- 支持所有 `es-toolkit/compat` 函数：`size`、`isNil`、`debounce`、`isEqual`、`keys`、`values`、`has` 等（少数例外见[与 lodash / ansuko 的区别](#与-lodash--ansuko-的区别)）

### 数值处理与流控制

- **`valueOr`** - 支持Promise和函数，获取目标值或默认值
- **`emptyOr`** - 若为空则返回null，否则应用回调或返回值
- **`hasOr`** - 检查路径是否存在，不存在则返回默认值（支持深层路径及 Promise）
- **`equalsOr`** - 支持Promise的比较与回退，具备直观的Nil处理机制
- **`changes`** - 用于数据库更新的对象差分追踪（支持 `profile.tags[1]` 等深层路径及排除模式）
- **`swallow`** - 执行函数并在报错时返回undefined（支持同步/异步）
- **`swallowMap`** - 将错误处理为undefined的数组map（支持compact模式排除错误项）

### 类型转换与验证

- **`toNumber`** - 解析包含逗号、全角字符的数字，可选 `toFixed` 四舍五入，无效时返回null
- **`toBool`** - 智能布尔值转换（支持 "yes"/"no"/"true"/"false"/数字），可配置未检测到时的行为检测处理
- **`boolIf`** - 带有回退机制的安全布尔值转换
- **`isValidStr`** - 非空字符串验证
- **`isValidEmail`** - 邮箱格式校验（严格模式：前后包含空格视为无效）

### JSON 处理

- **`parseJSON`** - 无需try-catch的安全JSON/JSON5解析（支持注释及末尾逗号）
- **`jsonStringify`** - 仅字符串化有效对象，防止字符串被重复包裹

### 数组工具

- **`arrayDepth`** - 返回数组的嵌套深度（非数组：0，空数组：1）
- **`castArray`** - 转换为数组，nil 变为 `[]`（而非 `[null]`）

### 日语文本处理（插件：`eskamasu/plugins/ja`）

- **`kanaToFull`** - 半角片假名 → 全角（例如 `ｶﾞｷﾞ` → `ガギ`）
- **`kanaToHalf`** - 全角 → 半角片假名（浊音拆分：`ガギ` → `ｶﾞｷﾞ`）
- **`kanaToHira`** - 片假名 → 平假名（自动先转换半角）
- **`hiraToKana`** - 平假名 → 片假名
- **`toHalfWidth`** - 全角 → 半角，可选连字符标准化
- **`toFullWidth`** - 半角 → 全角，可选连字符标准化
- **`haifun`** - 将各种形式的连字符统一正规化

### Geo地理空间工具（插件：`eskamasu/plugins/geo`）

- **`toGeoJson`** - 具备自动检测功能的通用GeoJSON转换器（按高维到低维顺序尝试）
- **`toPointGeoJson`** - 将坐标或对象转换为Point GeoJSON
- **`toPolygonGeoJson`** - 将外环转换为Polygon（验证闭合环）
- **`toLineStringGeoJson`** - 将坐标转换为LineString（检查自相交）
- **`toMultiPointGeoJson`** - 将多个点转换为MultiPoint
- **`toMultiPolygonGeoJson`** - 将多个多边形转换为MultiPolygon
- **`toMultiLineStringGeoJson`** - 将多条线转换为MultiLineString
- **`unionPolygon`** - 将多个Polygon/MultiPolygon合并为单一几何体
- **`parseToTerraDraw`** - 将GeoJSON转换为兼容Terra Draw的Feature
- **`mZoomInterpolate`** - 将缩放对象转换为MapBox插值表达式
- **`mProps`** - 将（camelCase）属性转换为MapBox兼容格式（处理minzoom、visibility等特殊情况）

### Prototype原型扩展（插件：`eskamasu/plugins/prototype`）

- **`Array.prototype.notMap`** - 使用谓词取反进行map，返回布尔数组
- **`Array.prototype.notFilter`** - 使用谓词取反进行filter（筛选不匹配的项）

### 时间工具

- **`waited`** - 延迟N个动画帧后执行（在 React/DOM 环境下比`setTimeout`更优）

## 插件架构

eskamasu采用核心 + 按需引入的插件架构：

- **核心**：所有 `es-toolkit/compat` 函数 + eskamasu 自有工具
- **日文插件**：仅在需要日文文本处理时引入
- **Geo 插件**（依赖 @turf/turf）：面向 GIS 应用
- **Prototype 插件**：仅在需要扩展 Array.prototype 时引入

```typescript
// 核心
import _ from 'eskamasu'

// 按需加入日文支持
import 'eskamasu/plugins/ja'  // 副作用引入

// 地图类应用再挂载 GIS
import 'eskamasu/plugins/geo'
```

插件通过副作用引入加载。只需 `import 'eskamasu/plugins/<name>'` 一次，`_` 在运行时和 TypeScript 类型层面（通过 `declare module` 合并）都会被扩展，因此 IDE 可以直接在 `_` 上进行自动补全。未 import 的插件不会被打包。

## 快速开始

### 基本用法

```typescript
import _ from 'eskamasu'

// 增强的 es-toolkit/compat 函数
_.isEmpty(0)           // false（不像 lodash / es-toolkit/compat 那样是 true！）
_.isEmpty([])          // true
_.castArray(null)      // []（不是 [null]！）
_.toNumber('1,234.5')  // 1234.5

// 支持 Promise 的值处理
const value = await _.valueOr(
  () => cache.get(id),
  () => api.fetch(id)
)

// 安全的 JSON 解析
const data = _.parseJSON('{ "a": 1, /* 注释 */ }')  // 支持 JSON5！

// 邮箱格式校验
_.isValidEmail('user@example.com')   // true
_.isValidEmail(' user@example.com ') // false

// 跟踪对象更改以进行数据库更新
const diff = _.changes(
  original, 
  updated, 
  ['name', 'email', 'profile.bio']
)

// 无需 try-catch 的错误处理
const result = _.swallow(() => riskyOperation())  // 出错时为 undefined
const items = _.swallowMap([1, 2, 3], item => processItem(item), true)  // 过滤错误
```

### 使用插件

#### 日文文本插件

```typescript
import _ from 'eskamasu'
import 'eskamasu/plugins/ja'

_.kanaToFull('ｶﾞｷﾞ')              // 'ガギ'
_.kanaToHira('アイウ')             // 'あいう'
_.toHalfWidth('ＡＢＣー１２３', '-') // 'ABC-123'
_.haifun('test‐data', '-')       // 'test-data'
```

#### 地理插件

```typescript
import _ from 'eskamasu'
import 'eskamasu/plugins/geo'

// 将各种格式转换为 GeoJSON
_.toPointGeoJson([139.7671, 35.6812])
// => { type: 'Point', coordinates: [139.7671, 35.6812] }

_.toPointGeoJson({ lat: 35.6895, lng: 139.6917 })
// => { type: 'Point', coordinates: [139.6917, 35.6895] }

// 合并多个多边形
const unified = _.unionPolygon([polygon1, polygon2])

// MapBox 工具
_.mZoomInterpolate({ 10: 1, 15: 5, 20: 10 })
// => ["interpolate", ["linear"], ["zoom"], 10, 1, 15, 5, 20, 10]

_.mProps({
  fillColor: "#ff0000",
  sourceLayer: "buildings",
  visibility: true
})
// => { "fill-color": "#ff0000", "source-layer": "buildings", "visibility": "visible" }
```

#### 原型插件

```typescript
import 'eskamasu/plugins/prototype'

// 现在 Array.prototype 已扩展
[1, 2, 3].notMap(n => n > 1)      // [true, false, false]
[1, 2, 3].notFilter(n => n % 2)   // [2]（偶数）
```

### 同时使用多个插件

```typescript
import _ from 'eskamasu'
import 'eskamasu/plugins/ja'
import 'eskamasu/plugins/geo'

// 现在 `_` 上同时拥有日文和地理工具
_.kanaToHira('アイウ')
_.toPointGeoJson([139.7, 35.6])
```

每个插件即使被多个文件 import，也只会注册一次（内置了重复注册防护）。

## 与 lodash / ansuko 的区别

`_` 等于 `{ ...es-toolkit/compat, ...eskamasu 自有函数 }`。以下 lodash 函数在 `es-toolkit/compat` 中不存在，因此在 `_` 上**不可用**：

- `chain`
- `mixin`
- `sortedUniq`、`sortedUniqBy`
- `tap`、`thru`
- `noConflict`
- `runInContext`

也不支持 `_(value).map(...)` 这种包装器式调用（ansuko 同样不支持）。除此之外（包括 eskamasu 自有函数和插件），行为与 ansuko 相同。

## 文档

eskamasu 的自有函数和插件与 ansuko 的 API 相同，因此可以直接参考 ansuko 的文档（只需将 import 路径中的 `ansuko` 替换为 `eskamasu`）：

- **[API 参考](https://github.com/sera4am/ansuko/blob/main/docs/API.zh.md)** - 包含示例的完整API文档
- **[使用指南](https://github.com/sera4am/ansuko/blob/main/docs/Guide.zh.md)** - 实际使用案例与设计模式

## 支持TypeScript 

完美支持TypeScript，包含完整的类型定义。所有函数均支持泛型，并经过严格的类型标注。

## 为什么仅有lodash / es-toolkit还不够？

lodash很优秀，es-toolkit/compat 也以现代化的实现提供了 lodash 兼容性——但这种兼容性同样包含了一些[被社区广为诟病](https://github.com/lodash/lodash/issues)的怪癖：

### 已修正的部分

1. **`_.isEmpty(true)` 返回 `true`** - 布尔值真的为"空"吗？
2. **`_.isEmpty(1)` 返回 `true`** - 数字1怎么能为"空"呢？
3. **`_.castArray(null)` 返回 `[null]`** - 为什么要把null包含在数组里？

### lodash / es-toolkit中没有的工具函数

4. **无安全的 JSON 解析** - 总是需要写重复的try-catch代码块
5. **无内置的比较与后备** - 代码中到处充斥着冗余的三元运算符
6. **无 Promise 感知的值解析** - 手动处理Promise逻辑非常繁琐
7. **无对象差异跟踪** - 进行数据库更新操作时往往需要引入额外库
8. **`JSON.stringify("hello")` 会添加多余引号** - 生成 `'"hello"'` 这种带引号的繁琐字符串

### 实际使用案例

```typescript
// lodash / es-toolkit的常见写法（冗长且易错）
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

// eskamasu的实现逻辑（简洁且安全）
const data = await _.valueOr(
  () => cache.get(id),
  () => api.fetch(id),
  defaultValue
)
```

eskamasu在 `_` 上保留了 `es-toolkit/compat` 的 API（[与 lodash / ansuko 的区别](#与-lodash--ansuko-的区别)中列出的函数除外），在修正上述问题的同时，为现代JavaScript开发增添了强大的工具函数。

## 依赖项

- **`es-toolkit`** - 核心工具函数（通过 `es-toolkit/compat`）
- **`json5`** - 支持注释和末尾逗号的扩展JSON解析
- **`@turf/turf`** - 地理空间分析（用于geo插件）

## 从源代码构建

```bash
npm install
npm run build
```

执行后将在`dist`目录下生成编译后的JavaScript文件和类型定义。

## 开发相关
因为不太擅长写测试和文档，我在使用 Claude 构思的同时，也得到了一位好朋友的贴心帮助，共同完成了这份文档。

## 许可证

MIT

## 作者

Naoto Sera

---

技术无国界，开源即和平。无论世界如何变迁，愿代码始终纯粹。
