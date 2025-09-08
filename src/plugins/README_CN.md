本文档详细介绍了 CodeJarPro 内置的核心插件，包括如何使用它们的 API 和所有可用的配置选项。

---

## 1. 行号插件 (`LineNumbers`)

为编辑器提供强大且自适应的行号显示功能。它能自动处理代码换行和编辑器尺寸变化导致的行高不一致问题。

### 注册与配置

你可以通过 `cjp.addPlugin` 方法来注册并配置行号插件。

```javascript
// 注册并开启行号
const lineNumbers = cjp.addPlugin('lineNumbers', CJP.Plugin.LineNumbers, {
	show: true
});
```

在 ESM 环境中：

```javascript
import { LineNumbers } from 'codejarpro/plugins';
const lineNumbers = cjp.addPlugin('lineNumbers', LineNumbers, { show: true });
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

-   **`lineNumbers.destroy()`**

    销毁插件实例，清理资源并移除所有相关的 DOM 元素。

---

## 2. 标记插件 (`InsertMark`)

允许你在代码的任意行列位置插入一个视觉标记，非常适合用于展示语法错误、警告或其他提示信息。

### 注册

此插件无需初始化配置。

```javascript
// 浏览器环境
const insertMark = cjp.addPlugin('insertMark', CJP.Plugin.InsertMark);

// ESM 环境
import { InsertMark } from 'codejarpro/plugins';
const insertMark = cjp.addPlugin('insertMark', InsertMark);
```

### API

插件实例 `insertMark` 暴露了以下核心方法：

-   **`insertMark.addMarker(info)`**

    在指定位置添加一个标记。

    -   `info: object`: 标记的详细信息，包含以下属性：
        -   `markerId: string`: 标记的唯一 ID。
        -   `line: number`: 行号 (从 1 开始)。
        -   `column: number`: 列号 (从 1 开始)。
        -   `message?: string`: 鼠标悬停在标记上时显示的提示信息 (会设置到 `title` 属性上)。
        -   `markerClass?: string`: 应用于标记 `<span>` 元素的 CSS 类名。
        -   `markerStyle?: string`: 应用于标记的内联样式。

-   **`insertMark.removeMarker(markerId)`**

    根据 ID 移除一个指定的标记。

-   **`insertMark.removeAllMarkers()`**

    移除所有由该插件创建的标记，通常用于在重新校验代码前进行清理。

-   **`insertMark.destroy()`**

    销毁插件实例，清理资源并移除所有相关的 DOM 元素。

### 使用示例 (JSON 语法校验)

```css
/* 定义一个错误标记的样式 */
.error-marker {
	--icon: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="m12 16l4-4l-4-4l-1.4 1.4l1.6 1.6H8v2h4.2l-1.6 1.6zm0 6q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22"/></svg>');
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
	insertMark.removeMarker('json-syntax-error');
} catch (e) {
	// 解析失败，找出错误位置
	const pos = parseErrorPosition(e.message, code);

	// 在错误位置添加标记
	insertMark.addMarker({
		markerId: 'json-syntax-error',
		line: pos.line,
		column: pos.column,
		message: e.message,
		markerClass: 'error-marker'
	});
}
```

---

## 3. JSON 验证插件 (`JsonValidate`)

自动检测并标记编辑器中的 JSON 语法错误，提供实时的 JSON 格式验证功能。

### 注册与配置

```javascript
// 浏览器环境
const jsonValidate = cjp.addPlugin('jsonValidate', CJP.Plugin.JsonValidate, {
	enabled: true,
	markerClass: 'json-error',
	markerStyle:
		'background-color: rgba(255, 215, 0, 0.3); padding: 0 5px; border-radius: 2px; text-decoration: wavy underline red; text-underline-offset: 3px; text-decoration-thickness: 2px;'
});

// ESM 环境
import { JsonValidate } from 'codejarpro/plugins';
const jsonValidate = cjp.addPlugin('jsonValidate', JsonValidate, {
	enabled: true
});
```

#### 配置选项

-   `config.enabled: boolean | (() => boolean)`: 控制插件是否启用。可以是布尔值或返回布尔值的函数。
    -   `true`: 启用 JSON 验证。
    -   `false` (默认): 禁用 JSON 验证。
-   `config.markerClass?: string`: 应用于错误标记的 CSS 类名。
-   `config.markerStyle?: string`: 应用于错误标记的内联样式。默认样式为黄色背景带红色波浪线。
-   `config.onError?: (error: Error | false, pos?: { line?: number; column?: number; index: number }) => void`: 存在错误时的回调函数。
    -   `error`: 当为 `false` 时表示没有错误，否则为 JSON 解析错误对象。
    -   `pos`: 错误位置信息，包含行号、列号和索引位置。

### API

插件实例 `jsonValidate` 提供以下方法：

-   **`jsonValidate.updateConfig(config)`**

    动态更新插件配置。

    **示例：**

    ```javascript
    // 启用 JSON 验证
    jsonValidate.updateConfig({ enabled: true });

    // 自定义错误标记样式
    jsonValidate.updateConfig({
    	markerStyle: 'background-color: rgba(255, 99, 71, 0.2); border-bottom: 2px dotted red;'
    });
    ```

-   **`jsonValidate.validate(code)`**

    手动触发一次 JSON 验证。

    -   `code: string`: 要验证的 JSON 字符串。
    -   返回: `true` (JSON 格式有错误), `undefined` (JSON 格式正确或插件未启用)。

    **示例：**

    ```javascript
    const hasError = jsonValidate.validate(cjp.toString());
    if (!hasError) {
    	console.log('JSON 格式正确');
    } else {
    	console.log('JSON 格式错误，已在编辑器中标记');
    }
    ```

-   **`jsonValidate.destroy()`**

    销毁插件实例，清理资源并移除所有相关的 DOM 元素。

---

## 4. 字数统计插件 (`WordCounter`)

实时统计编辑器中的字符数、单词数并显示当前光标位置（行号和列号）。

### 注册与配置

```javascript
// 浏览器环境
const wordCounter = cjp.addPlugin('wordCounter', CJP.Plugin.WordCounter, {
	target: document.getElementById('counter-display'),
	format: (info) => `字符: ${info.chars} | 单词: ${info.words} | 位置: ${info.row}:${info.col}`
});

// ESM 环境
import { WordCounter } from 'codejarpro/plugins';
const wordCounter = cjp.addPlugin('wordCounter', WordCounter);
```

#### 配置选项

-   `config.target?: HTMLElement`: 显示统计信息的 HTML 元素。如果未提供，插件将自动创建一个 div 并添加到编辑器父元素中。
-   `config.format?: (info) => string`: 自定义统计信息的格式化函数。
    -   `info.words: number`: 单词数量。
    -   `info.chars: number`: 字符数量。
    -   `info.row: number`: 当前光标所在行号。
    -   `info.col: number`: 当前光标所在列号。

### API

插件实例 `wordCounter` 提供以下方法：

-   **`wordCounter.updateConfig(config)`**

    动态更新插件配置。

    **示例：**

    ```javascript
    // 更改显示目标元素
    wordCounter.updateConfig({
    	target: document.getElementById('new-counter-display')
    });

    // 自定义显示格式
    wordCounter.updateConfig({
    	format: (info) => `${info.chars} 字符, ${info.words} 词, 行 ${info.row}, 列 ${info.col}`
    });
    ```

-   **`wordCounter.destroy()`**

    销毁插件实例，清理资源并移除所有相关的 DOM 元素。

### 辅助函数

WordCounter 插件还导出了一个实用的辅助函数，可用于获取字符串中特定索引位置的行列号：

-   **`getLineColumn(source, index)`**

    根据字符串索引获取行列号。

    -   `source: string`: 原始字符串。
    -   `index: number`: 目标字符的索引位置。
    -   返回: 包含 `line` 和 `column` 的对象，或 `undefined`（如果输入无效）。

    **示例：**

    ```javascript
    import { getLineColumn } from 'codejarpro/plugins/wordCounter';

    const text = 'Hello\nWorld\nJavaScript';
    const position = getLineColumn(text, 8); // 索引8对应的字符是'W'
    console.log(position); // 输出: { line: 2, column: 1 }
    ```

---

## 5. 插件通用 API

所有插件都共享以下通用方法：

-   **`plugin.destroy()`**: 销毁插件实例，清理资源并移除所有相关的 DOM 元素。

```javascript
// 销毁不再需要的插件
lineNumbers.destroy();
jsonValidate.destroy();
insertMark.destroy();
wordCounter.destroy();
```
