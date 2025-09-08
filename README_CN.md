![CodeJarPro 截图](https://github.com/woodcoal/codejarpro/blob/master/codejarpro.png)

# CodeJarPro 🍯✨

[English](README.md) | [中文](README_CN.md)

**一个为现代 Web 打造的、轻量级、模块化、可扩展的代码编辑器。**

`CodeJarPro` 是在广受欢迎的 [antonmedv/codejar](https://github.com/antonmedv/codejar) 基础上，由 [木炭 (WOODCOAL)](https://github.com/woodcoal) 进行深度重构和功能增强的开源项目。它不仅完整继承了 `codejar` 的轻量与高效（gzip 后仅几 KB），更引入了强大的**模块化插件系统**，并内置了**行号**、**代码标记**、**JSON 校验**和**字数统计**等核心插件，让小巧的编辑器也能拥有媲美 IDE 的专业能力与扩展性。

[![NPM Version](https://img.shields.io/npm/v/codejarpro.svg)](https://www.npmjs.com/package/codejarpro) [![NPM Bundle Size](https://img.shields.io/bundlephobia/minzip/codejarpro)](https://bundlephobia.com/result?p=codejarpro) [![License](https://img.shields.io/npm/l/codejarpro)](https://github.com/woodcoal/codejarpro/blob/master/LICENSE)

## ✨ 核心特性

-   **强大的插件系统**: 通过 `addPlugin` API，可以轻松地为编辑器实例挂载或卸载功能，实现了核心与扩展的完全分离。
-   **内置核心插件**: 开箱即用，提供了开发者最常用的**行号 (`LineNumbers`)**、**代码标记 (`InsertMark`)**、**JSON 校验 (`JsonValidate`)** 和**字数统计 (`WordCounter`)** 插件。
-   **现代化构建**: 使用 `tsup` 进行打包，为每个模块（主库和插件）都提供了 ESM, CJS 和 IIFE (浏览器) 三种格式，完美适配任何现代或传统的前端项目。
-   **专业的开发体验**: 完整的 TypeScript 支持，提供精确的类型定义。
-   **极致轻量**: 继承了 `codejar` 的核心优势，保持了极小的体积和零依赖的特性。

## 🚀 安装

```bash
npm install codejarpro
```

## 快速上手

### 1\. 浏览器中使用

这是最简单的方式，适合静态网页或快速演示。

```html
<div class="editor"></div>

<script src="https://unpkg.com/codejarpro/dist/codejarpro.min.js"></script>
<script src="https://unpkg.com/codejarpro/dist/plugins/lineNumbers.min.js"></script>

<script>
	const editorElement = document.querySelector('.editor');

	// 代码高亮函数，可以使用 Prism.js 等库
	const highlight = (editor) => {
		// 你的高亮逻辑...
	};

	const cjp = CJP.CodeJarPro(editorElement, highlight, { tab: '\t' });

	// 注册并开启行号插件
	cjp.addPlugin(CJP.Plugin.LineNumbers, { show: true });

	cjp.updateCode(`function sayHello() {\n  console.log('Hello, CodeJarPro!');\n}`);
</script>
```

### 2\. 在现代前端项目（如 Vite + Vue）中使用

这个例子展示了如何在 Vue 3 组件中集成 CodeJarPro。

```vue
<template>
	<div ref="editorRef" style="height: 200px; border: 1px solid #ccc;"></div>
</template>

<script setup>
	import { onMounted, onBeforeUnmount, ref } from 'vue';
	import { CodeJarPro } from 'codejarpro';
	import { LineNumbers } from 'codejarpro/plugins';
	// 引入你喜欢的高亮库，例如 Prism.js
	import Prism from 'prismjs';

	const editorRef = ref(null);
	let cjp = null;

	onMounted(() => {
		if (editorRef.value) {
			// 定义高亮函数
			const highlight = (editor) => {
				editor.innerHTML = Prism.highlight(
					editor.textContent || '',
					Prism.languages.javascript,
					'javascript'
				);
			};

			// 初始化编辑器
			cjp = CodeJarPro(editorRef.value, highlight, { tab: '\t' });

			// 注册并启用行号插件
			cjp.addPlugin(LineNumbers, { show: true });

			// 设置初始代码
			cjp.updateCode(`function sayHello() {\n  console.log('Hello, CodeJarPro!');\n}`);

			// 监听代码更新
			cjp.onUpdate((code) => {
				console.log('代码已更新:', code);
			});
		}
	});

	// 组件销毁时，销毁编辑器实例
	onBeforeUnmount(() => {
		cjp?.destroy();
	});
</script>
```

---

## 核心 API 详解

### 初始化 `CodeJarPro(editor, highlight?, options?)`

这是创建编辑器实例的入口函数。

-   **`editor: HTMLElement`** : 必需。作为编辑器的 DOM 元素。
-   **`highlight?: (editor: HTMLElement, pos?: Position) => void`** : 可选。一个用于语法高亮的函数。当编辑器内容更新时，此函数会被调用。
-   **`options?: Partial<Options>`** : 可选。一个配置对象，用于自定义编辑器的行为。

#### 配置选项 (`Options`)

-   `tab: string` (默认: `'\t'`): 按下 Tab 键时插入的字符串。
-   `indentOn: RegExp` (默认: `/[({\[]$/`): 匹配时自动缩进的正则表达式。
-   `moveToNewLine: RegExp` (默认: `/^[)}\]]/`): 匹配时移动到新行的正则表达式。
-   `spellcheck: boolean` (默认: `false`): 是否开启拼写检查。
-   `catchTab: boolean` (默认: `true`): 是否捕获 Tab 键事件。
-   `preserveIdent: boolean` (默认: `true`): 换行时是否保留缩进。
-   `addClosing: boolean` (默认: `true`): 是否自动闭合括号和引号。
-   `history: boolean` (默认: `true`): 是否启用撤销/重做历史记录。
-   `wrap: boolean` (默认: `true`): 是否开启自动换行。
-   `readonly: boolean` (默认: `false`): 是否将编辑器设为只读模式。
-   `autoclose: object`: 自动闭合功能的详细配置。
-   `debounce: object`: 防抖配置，单位毫秒。
    -   `highlight: number` (默认: `300`): 高亮函数的防抖延迟。
    -   `update: number` (默认: `300`): `onUpdate` 回调的防抖延迟。
-   `disableDebug: boolean` (默认: `true`): 是否关闭调试信息。开启后将在控制台打印运行日志。

---

### `cjp` 实例属性与方法

`CodeJarPro(...)` 函数会返回一个编辑器实例（我们称之为 `cjp`），你可以通过它来完全控制编辑器。

#### 核心方法

-   **`cjp.updateCode(code: string, callOnUpdate?: boolean)`** : 以编程方式更新编辑器的代码。`callOnUpdate` (默认`true`) 控制是否触发 `onUpdate` 回调。
-   **`cjp.onUpdate((code: string) => void)`** : 注册一个回调函数，当编辑器代码发生变化时触发（有防抖处理）。
-   **`cjp.toString(): string`** : 获取编辑器内的纯文本内容。
-   **`cjp.destroy()`** : 彻底销毁编辑器实例，移除所有事件监听、插件和自动创建的 DOM 元素，用于防止内存泄漏。
-   **`cjp.refresh()`**: 手动触发一次重新高亮，不会改变编辑器内容。

#### 光标与历史

-   **`cjp.save(): Position`** : 保存当前的光标位置和选区信息，返回一个 `Position` 对象。
-   **`cjp.restore(pos: Position)`** : 根据之前保存的 `Position` 对象，恢复光标位置和选区。
-   **`cjp.recordHistory()`** : 手动在历史记录中添加一个快照。

#### 插件管理

-   **`cjp.addPlugin(plugin, config?)`** : 注册一个插件。返回插件实例，你可以通过它调用插件的专属 API。
-   **`cjp.removePlugin(name)`** : 根据名称 (`string`) 或插件实例本身，安全地卸载一个插件。
-   **`cjp.updatePluginConfig(name, config)`** : 更新已注册插件的配置。
-   **`cjp.destroyPlugins()`** : 销毁并移除所有已注册的插件。

#### 只读属性

-   **`cjp.editor: HTMLElement`** : 指向作为编辑器的原始 DOM 元素。
-   **`cjp.id: string`** : 编辑器实例的唯一 ID。
-   **`cjp.options: Options`** : 当前生效的配置对象。
-   **`cjp.plugins: Map<string, IPlugin>`** : 一个包含所有已注册插件实例的 Map 对象。

---

## 🔌 插件系统

`CodeJarPro` 的所有扩展功能都通过插件实现。

### 使用内置插件

`CodeJarPro` 提供了一系列开箱即用的核心插件。
**\>\> [点击这里，查看内置插件的详细文档](src/plugins/README_CN.md) \<\<**

### 插件开发 (Plugin Development)

你可以轻松创建自己的插件来扩展编辑器功能。一个插件本质上是一个符合 `IPlugin` 接口的函数或对象。

#### 插件的基本结构

```typescript
import { CodeJarProInstance, IPlugin, ActionName } from 'codejarpro';

// 如果你的插件需要配置，先定义一个类型
interface MyPluginOptions {
	greeting: string;
}

// 你的插件可以是一个返回插件对象的函数
export function MyAwesomePlugin(cjp: CodeJarProInstance, config?: MyPluginOptions) {
	// 插件的初始化逻辑...
	console.log('MyAwesomePlugin 已初始化, 配置:', config);

	// 必须返回一个符合 IPlugin 接口的对象
	return {
		name: 'MyAwesomePlugin', // 插件的唯一名称

		// 核心：onAction 是所有编辑器事件的入口
		onAction: (params) => {
			const { name, code, event } = params;

			if (name === 'keyup') {
				console.log(`${config?.greeting}! 新的代码长度:`, code.length);
			}

			if (name === 'keydown' && (event as KeyboardEvent).key === 'F1') {
				alert('F1 按键被按下了!');
				return true; // 返回 true 可以阻止默认行为
			}
		},

		// 可选：允许外部更新插件配置
		updateConfig: (newConfig: MyPluginOptions) => {
			config = { ...config, ...newConfig };
			console.log('配置已更新:', config);
		},

		// 可选：清理函数，在插件被移除时调用
		destroy: () => {
			console.log('MyAwesomePlugin 已销毁!');
			// ... 在这里移除事件监听、清理 DOM 等
		}
	};
}
```

#### `onAction` 钩子

这是插件与编辑器交互的**唯一**渠道。编辑器在生命周期的各个关键节点，都会调用所有已注册插件的 `onAction` 方法。

`onAction` 的参数 `params` 包含：

-   `name: ActionName`: 当前触发的事件名称。
-   `code: string`: 编辑器当前的纯文本内容。
-   `event?: Event`: 原始的 DOM 事件对象（如果有的话）。

可用的 `ActionName` 包括：

-   `beforeUpdate`: 在 `onUpdate` 回调之前触发。返回 `true` 可以阻止本次更新。
-   `afterUpdate`: 在 `onUpdate` 回调之后触发。
-   `highlight`: 在语法高亮完成之后触发。
-   `keydown`, `keyup`, `click`, `focus`, `blur`, `paste`, `cut`, `scroll`, `resize`, `refresh`。

## 致谢 (Acknowledgements)

`CodeJarPro` 的诞生离不开 [antonmedv/codejar](https://github.com/antonmedv/codejar) 这个优秀的基础项目。在此，特别感谢原作者 **Anton Medvedev** 的杰出工作和无私奉献。

## 许可证 (License)

本项目遵循 **MIT** 许可证，版权归 **木炭 (WOODCOAL)** 和 **Anton Medvedev** 共同所有。详情请见 `LICENSE` 文件。
