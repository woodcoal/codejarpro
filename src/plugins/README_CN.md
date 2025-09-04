# CodeJarPro 核心插件文档

本文档详细介绍了 CodeJarPro 内置的核心插件，包括如何使用它们的 API 和所有可用的配置选项。

---

## 1. 行号插件 (`LineNumbers`)

为编辑器提供强大且自适应的行号显示功能。它能自动处理代码换行和编辑器尺寸变化导致的行高不一致问题。

### 注册与配置

你可以通过 `cjp.addPlugin` 方法来注册并配置行号插件。

```javascript
// 注册并开启行号
const lineNumbers = cjp.addPlugin("lineNumbers", CJP.Plugin.LineNumbers, {
	show: true,
});
```

在 ESM 环境中：

```javascript
import { LineNumbers } from "codejarpro/plugins";
const lineNumbers = cjp.addPlugin("lineNumbers", LineNumbers, { show: true });
```

#### 配置选项

-   `config.show: boolean`: 控制行号的显示与隐藏。
    -   `true` (默认): 显示行号。
    -   `false`: 隐藏行号。

### API

行号插件通常在后台自动工作，但你也可以通过插件实例来动态更新其配置。

-   **`lineNumbers.updateConfig(config)`**

    动态地更新行号插件的配置。

    **示例：**

    ```javascript
    // 隐藏行号
    lineNumbers.updateConfig({ show: false });

    // 再次显示行号
    lineNumbers.updateConfig({ show: true });
    ```

---

## 2\. 标记插件 (`InsertMark`)

允许你在代码的任意行列位置插入一个视觉标记，非常适合用于展示语法错误、警告或其他提示信息。

### 注册

此插件无需初始化配置。

```javascript
// 浏览器环境
const insertMark = cjp.addPlugin("insertMark", CJP.Plugin.InsertMark);

// ESM 环境
import { InsertMark } from "codejarpro/plugins";
const insertMark = cjp.addPlugin("insertMark", InsertMark);
```

### API

插件实例 `insertMark` 暴露了以下核心方法：

-   **`insertMark.addMarker(markerId, info)`**

    在指定位置添加一个标记。

    -   `markerId: string`: 标记的唯一 ID，例如 `'json-error-1'`。
    -   `info: object`: 标记的详细信息，包含以下属性：
        -   `line: number`: 行号 (从 1 开始)。
        -   `column: number`: 列号 (从 1 开始)。
        -   `message?: string`: 鼠标悬停在标记上时显示的提示信息 (会设置到 `title` 属性上)。
        -   `markerClass: string`: 应用于标记 `<span>` 元素的 CSS 类名，例如 `'error-marker'`。

-   **`insertMark.removeMarker(markerId)`**

    根据 ID 移除一个指定的标记。

-   **`insertMark.removeAllMarkers()`**

    移除所有由该插件创建的标记，通常用于在重新校验代码前进行清理。

### 使用示例 (JSON 语法校验)

```css
/* 定义一个错误标记的样式 */
.error-marker {
	--icon: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE --><path fill="currentColor" d="m12 16l4-4l-4-4l-1.4 1.4l1.6 1.6H8v2h4.2l-1.6 1.6zm0 6q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22"/></svg>');
	-webkit-mask: var(--icon) no-repeat;
	mask: var(--icon) no-repeat;
	-webkit-mask-size: 100% 100%;
	mask-size: 100% 100%;
	background-color: currentColor;
	color: inherit;
	width: 14px;
	height: 14px;
	padding: 0.2em;
	color: red;
	display: inline-block;
	position: relative;
	margin: 0 3px -3px 8px;
}
```

```javascript
const code = cjp.toString();
try {
	JSON.parse(code);
	// 解析成功，移除旧的错误标记
	insertMark.removeMarker("json-syntax-error");
} catch (e) {
	// 解析失败，找出错误位置
	const pos = parseErrorPosition(e.message, code); // parseErrorPosition 是你自己的解析函数

	// 在错误位置添加标记
	insertMark.addMarker("json-syntax-error", {
		line: pos.line,
		column: pos.column,
		message: e.message,
		markerClass: "error-marker",
	});
}
```
