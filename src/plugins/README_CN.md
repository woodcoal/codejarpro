# CodeJarPro 核心插件文档

本文档详细介绍了 CodeJarPro 内置的核心插件，包括如何使用它们的 API 和所有可用的配置选项。

---

## 1. 行号插件 (`LineNumbers`)

为编辑器提供强大且自适应的行号显示功能。它能自动处理代码换行和编辑器尺寸变化导致的行高不一致问题。

### 注册与配置

javascript
import { LineNumbers } from 'codejarpro/plugins';
const lineNumbers = cjp.addPlugin(LineNumbers, { show: true });

#### 配置选项

-   `config.show: boolean`: 控制行号的显示与隐藏。
    -   `true` (默认): 显示行号。
    -   `false`: 隐藏行号。

### API

插件实例 `lineNumbers` 暴露了以下方法：

-   **`lineNumbers.updateConfig(config)`**

    动态地更新行号插件的配置。

    **示例：**

    ```javascript
    // 隐藏行号
    lineNumbers.updateConfig({ show: false });
    ```

---

## 2\. 代码标记插件 (`InsertMark`)

允许你在代码的任意行列位置插入一个视觉标记，非常适合用于展示语法错误、警告或其他提示信息。

### 注册

此插件无需初始化配置。

```javascript
import { InsertMark } from 'codejarpro/plugins';
const insertMark = cjp.addPlugin(InsertMark);
```

### API

插件实例 `insertMark` 暴露了以下核心方法：

-   **`insertMark.addMarker(info)`**

    在指定位置添加一个标记。

    -   `info: object`: 标记的详细信息，包含以下属性：
        -   `markerId: string`: 标记的唯一 ID。
        -   `line: number`: 行号 (从 1 开始)。
        -   `column: number`: 列号 (从 1 开始)。
        -   `message?: string`: 鼠标悬停在标记上时显示的提示信息。
        -   `markerClass?: string`: 应用于标记 `<span>` 元素的 CSS 类名。
        -   `markerStyle?: string`: 应用于标记的内联样式。

-   **`insertMark.removeMarker(markerId)`**：根据 ID 移除一个指定的标记。

-   **`insertMark.removeAllMarkers()`**：移除所有由该插件创建的标记。

### 使用示例 (JSON 语法校验)

```javascript
// 假设 'insertMark' 是 InsertMark 插件的实例,
// 'cjp' 是 CodeJarPro 的实例.

const code = cjp.toString();
try {
	JSON.parse(code);
	// 解析成功，移除旧的错误标记
	insertMark.removeMarker('json-syntax-error');
} catch (e) {
	// 解析失败，找出错误位置
	// (parseErrorPosition 是你可能需要编写的辅助函数)
	const pos = parseErrorPosition(e.message, code);

	// 在错误位置添加标记
	insertMark.addMarker({
		markerId: 'json-syntax-error',
		line: pos.line,
		column: pos.column,
		message: e.message,
		markerClass: 'error-marker' // 用于定义样式的 CSS 类
	});
}
```

---

## 3\. JSON 验证插件 (`JsonValidate`)

自动检测并标记编辑器中的 JSON 语法错误，提供实时的 JSON 格式验证功能。

### 注册与配置

```javascript
import { JsonValidate } from 'codejarpro/plugins';
const jsonValidate = cjp.addPlugin(JsonValidate, {
	enabled: true,
	// 可选：自定义样式
	markerClass: 'json-error-marker',
	// 可选：错误回调
	onError: (error, pos) => {
		if (error) {
			console.log(`JSON 错误: ${error.message} 在第 ${pos.line} 行`);
		} else {
			console.log('JSON 格式有效！');
		}
	}
});
```

#### 配置选项

-   `config.enabled: boolean | ((code: string) => boolean)`: 控制插件是否启用。可以是布尔值或返回布尔值的函数。默认：`false`。
-   `config.ignoreEmpty?: boolean`: 忽略空值。默认：`true`。
-   `config.markerClass?: string`: 应用于错误标记的 CSS 类名。
-   `config.markerStyle?: string`: 应用于错误标记的内联样式。
-   `config.onError?: (error: Error | false, code?: string, pos?: { line?: number; column?: number; index: number }) => void`: 发现或清除错误时的回调函数。
    -   `error: Error | false`: 错误对象如果发现错误，否则为 `false`。
    -   `code?: string`: 当前编辑器中的代码。
    -   `pos?: { line?: number; column?: number; index: number }`: 错误位置信息。

### API

-   **`jsonValidate.updateConfig(config)`**：动态更新插件配置。
-   **`jsonValidate.validate(code)`**：手动触发一次 JSON 验证。如果发现错误，返回 `true`。

---

## 4\. 字数统计插件 (`WordCounter`)

实时统计编辑器中的字符数、单词数并显示当前光标位置（行号和列号）。

### 注册与配置

```javascript
import { WordCounter } from 'codejarpro/plugins';

// 在你的 HTML 中创建一个目标元素: <div id="counter-display"></div>
const counterElement = document.getElementById('counter-display');

const wordCounter = cjp.addPlugin(WordCounter, {
	target: counterElement,
	format: (info) => `字符: ${info.chars} | 单词: ${info.words} | 位置: ${info.row}:${info.col}`
});
```

#### 配置选项

-   `config.target?: HTMLElement`: 显示统计信息的 HTML 元素。如果未提供，插件将自动创建一个 `div`。
-   `config.format?: (info) => string`: 自定义统计信息的格式化函数。
    -   `info.words: number`: 单词数量。
    -   `info.chars: number`: 字符数量。
    -   `info.row: number`: 当前光标所在行号。
    -   `info.col: number`: 当前光标所在列号。

### API

-   **`wordCounter.updateConfig(config)`**：动态更新插件配置。

### 辅助函数

WordCounter 模块还导出了一个实用的辅助函数：

-   **`getLineColumn(source: string, index: number)`**：根据字符串中特定索引位置的字符，获取其所在的行列号。

```javascript
import { getLineColumn } from 'codejarpro/plugins/wordCounter'; // 注意导入路径
const text = 'Hello\nWorld';
const position = getLineColumn(text, 7); // { line: 2, column: 2 }
```

---

## 5\. 插件通用 API

所有插件都共享以下通用方法：

-   **`plugin.destroy()`**: 销毁插件实例，清理资源并移除所有相关的 DOM 元素。

```javascript
// 销毁不再需要的插件
lineNumbers.destroy();
jsonValidate.destroy();
```
