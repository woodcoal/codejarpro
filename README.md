![CodeJarPro Screenshot](https://github.com/woodcoal/codejarpro/blob/master/codejarpro.png)

# CodeJarPro 🍯✨

[English](README.md) | [中文](README_CN.md)

**A lightweight, modular, and extensible code editor for the modern web.**

`CodeJarPro` is an open-source project deeply refactored and functionally enhanced by [WOODCOAL (木炭)](https://github.com/woodcoal), based on the popular [antonmedv/codejar](https://github.com/antonmedv/codejar). It not only fully inherits the lightweight and efficient nature of `codejar` (only a few KB after gzip), but also introduces a powerful **modular plugin system**, with built-in core plugins like **line numbers** and **code marking**, allowing the compact editor to have professional capabilities and extensibility comparable to an IDE.

[![NPM Version](https://img.shields.io/npm/v/codejarpro.svg)](https://www.npmjs.com/package/codejarpro) [![NPM Bundle Size](https://img.shields.io/bundlephobia/minzip/codejarpro)](https://bundlephobia.com/result?p=codejarpro) [![License](https://img.shields.io/npm/l/codejarpro)](https://github.com/woodcoal/codejarpro/blob/master/LICENSE)

## ✨ Core Features

-   **Powerful Plugin System**: Easily mount or unmount features for an editor instance via the `addPlugin` API, achieving complete separation between the core and extensions.
-   **Built-in Core Plugins**: Provides the most commonly used developer plugins, **`LineNumbers`**, **`InsertMark`**, **`JsonValidate`**, and **`WordCounter`**, out of the box.
-   **Modern Build**: Packaged using `tsup`, providing ESM, CJS, and IIFE (browser) formats for each module (main library and plugins), perfectly adapting to any modern or traditional front-end project.
-   **Professional Development Experience**: Full TypeScript support with precise type definitions.
-   **Extremely Lightweight**: Inherits the core advantages of `codejar`, maintaining a minimal size and zero dependencies.

## 🚀 Installation

```bash
npm install codejarpro
```

## Quick Start

### 1\. In the Browser

This is the simplest way, suitable for static web pages or quick demos.

```html
<div class="editor"></div>

<script src="https://unpkg.com/codejarpro/dist/codejarpro.min.js"></script>
<script src="https://unpkg.com/codejarpro/dist/plugins/lineNumbers.min.js"></script>

<script>
	const editorElement = document.querySelector('.editor');

	// Code highlighting function, you can use libraries like Prism.js
	const highlight = (editor) => {
		// Your highlighting logic...
	};

	const cjp = CJP.CodeJarPro(editorElement, highlight, { tab: '\t' });

	// Register and enable the line numbers plugin
	cjp.addPlugin(CJP.Plugin.LineNumbers, { show: true });

	cjp.updateCode(`function sayHello() {\n  console.log('Hello, CodeJarPro!');\n}`);
</script>
```

### 2\. In Modern Front-end Projects (e.g., Vue with Vite)

This example shows how to integrate CodeJarPro in a Vue 3 component.

```vue
<template>
	<div ref="editorRef" style="height: 200px; border: 1px solid #ccc;"></div>
</template>

<script setup>
	import { onMounted, onBeforeUnmount, ref } from 'vue';
	import { CodeJarPro } from 'codejarpro';
	import { LineNumbers } from 'codejarpro/plugins';
	// Import your preferred highlighter, e.g., Prism.js
	import Prism from 'prismjs';

	const editorRef = ref(null);
	let cjp = null;

	onMounted(() => {
		if (editorRef.value) {
			const highlight = (editor) => {
				editor.innerHTML = Prism.highlight(
					editor.textContent || '',
					Prism.languages.javascript,
					'javascript'
				);
			};

			cjp = CodeJarPro(editorRef.value, highlight, { tab: '\t' });

			// Register and enable the line numbers plugin
			cjp.addPlugin(LineNumbers, { show: true });

			cjp.updateCode(`function sayHello() {\n  console.log('Hello, CodeJarPro!');\n}`);

			cjp.onUpdate((code) => {
				console.log('Code updated:', code);
			});
		}
	});

	onBeforeUnmount(() => {
		cjp?.destroy();
	});
</script>
```

---

## Core API Details

### Initializing `CodeJarPro(editor, highlight?, options?)`

This is the entry function to create an editor instance.

-   **`editor: HTMLElement`**: Required. The DOM element to be used as the editor.
-   **`highlight?: (editor: HTMLElement, pos?: Position) => void`**: Optional. A function for syntax highlighting. When the editor content is updated, this function will be called.
-   **`options?: Partial<Options>`**: Optional. A configuration object to customize the editor's behavior.

#### Configuration Options (`Options`)

-   `tab: string` (default: `'\t'`): The string to insert when the Tab key is pressed.
-   `indentOn: RegExp` (default: `/[({\[]$/`): A regular expression that triggers auto-indentation upon matching.
-   `moveToNewLine: RegExp` (default: `/^[)}\]]/`): A regular expression that moves to a new line upon matching.
-   `spellcheck: boolean` (default: `false`): Whether to enable spell checking.
-   `catchTab: boolean` (default: `true`): Whether to capture the Tab key event.
-   `preserveIdent: boolean` (default: `true`): Whether to preserve indentation on new lines.
-   `addClosing: boolean` (default: `true`): Whether to automatically close brackets and quotes.
-   `history: boolean` (default: `true`): Whether to enable undo/redo history.
-   `wrap: boolean` (default: `true`): Whether to enable code line wrapping.
-   `readonly: boolean` (default: `false`): Whether to make the editor read-only.
-   `autoclose: object`: Detailed configuration for the autoclosing feature.
-   `debounce: object`: Debounce configuration, in milliseconds.
    -   `highlight: number` (default: `300`): Debounce delay for the highlight function.
    -   `update: number` (default: `300`): Debounce delay for the `onUpdate` callback.
-   `disableDebug: boolean` (default: `true`): Whether to disable debugging. When enabled, it will print runtime logs to the console.

---

### `cjp` Instance Properties and Methods

The `CodeJarPro(...)` function returns an editor instance (which we'll call `cjp`), allowing you to fully control the editor.

#### Core Methods

-   **`cjp.updateCode(code: string, callOnUpdate?: boolean)`**: Programmatically updates the editor's code. `callOnUpdate` (default `true`) controls whether to trigger the `onUpdate` callback.
-   **`cjp.onUpdate((code: string) => void)`**: Registers a callback function that is triggered when the editor's code changes (with debouncing).
-   **`cjp.toString(): string`**: Gets the plain text content of the editor.
-   **`cjp.destroy()`**: Completely destroys the editor instance, removing all event listeners, plugins, and automatically created DOM elements to prevent memory leaks.
-   **`cjp.refresh()`**: Manually triggers a re-highlight of the editor without changing its content.

#### Cursor & History

-   **`cjp.save(): Position`**: Saves the current cursor position and selection information, returning a `Position` object.
-   **`cjp.restore(pos: Position)`**: Restores the cursor position and selection based on a previously saved `Position` object.
-   **`cjp.recordHistory()`**: Manually adds a snapshot to the history.

#### Plugin Management

-   **`cjp.addPlugin(plugin, config?)`**: Registers a plugin. Returns the plugin instance, through which you can call the plugin's specific APIs.
-   **`cjp.removePlugin(name)`**: Safely uninstalls a plugin by its name (`string`) or by passing the plugin instance itself.
-   **`cjp.updatePluginConfig(name, config)`**: Updates the configuration of a registered plugin.
-   **`cjp.destroyPlugins()`**: Destroys and removes all registered plugins.

#### Read-only Properties

-   **`cjp.editor: HTMLElement`**: A reference to the original DOM element serving as the editor.
-   **`cjp.id: string`**: The unique ID of the editor instance.
-   **`cjp.options: Options`**: The currently effective configuration object.
-   **`cjp.plugins: Map<string, IPlugin>`**: A Map object containing all registered plugin instances.

---

## 🔌 Plugin System

All extended functionalities of `CodeJarPro` are implemented through plugins.

### Using Built-in Plugins

`CodeJarPro` provides a series of core plugins out of the box.
**\>\> [Click here to view the detailed documentation for built-in plugins](src/plugins/README.md) \<\<**

### Plugin Development

You can easily create your own plugins to extend the editor's functionality. A plugin is essentially a function or an object that conforms to the `IPlugin` interface.

#### Basic Structure of a Plugin

```typescript
import { CodeJarProInstance, IPlugin, ActionName } from 'codejarpro';

// Define your plugin's options type if needed
interface MyPluginOptions {
	greeting: string;
}

// Your plugin can be a function that returns the plugin object
export function MyAwesomePlugin(cjp: CodeJarProInstance, config?: MyPluginOptions) {
	// Plugin initialization logic...
	console.log('MyAwesomePlugin is initialized with config:', config);

	// Must return an object that conforms to the IPlugin interface
	return {
		name: 'MyAwesomePlugin', // A unique name for your plugin

		// Core: onAction is the entry point for all editor events
		onAction: (params) => {
			const { name, code, event } = params;

			if (name === 'keyup') {
				console.log(`${config?.greeting}! New code length:`, code.length);
			}

			if (name === 'keydown' && (event as KeyboardEvent).key === 'F1') {
				alert('F1 pressed!');
				return true; // Returning true can prevent the default behavior
			}
		},

		// Optional: Allows external updates to the plugin's configuration
		updateConfig: (newConfig: MyPluginOptions) => {
			config = { ...config, ...newConfig };
			console.log('Config updated:', config);
		},

		// Optional: Cleanup function, called when the plugin is removed
		destroy: () => {
			console.log('MyAwesomePlugin is destroyed!');
			// ... Remove event listeners, clean up DOM, etc., here
		}
	};
}
```

#### The `onAction` Hook

This is the **only** channel through which plugins interact with the editor. The editor calls the `onAction` method of all registered plugins at various key points in its lifecycle.

The `params` argument of `onAction` includes:

-   `name: ActionName`: The name of the currently triggered event.
-   `code: string`: The current plain text content of the editor.
-   `event?: Event`: The original DOM event object (if any).

Available `ActionName`s include:

-   `beforeUpdate`: Triggered before the `onUpdate` callback. Can return `true` to prevent the update.
-   `afterUpdate`: Triggered after the `onUpdate` callback.
-   `highlight`: Triggered after the syntax highlighting is complete.
-   `keydown`, `keyup`, `click`, `focus`, `blur`, `paste`, `cut`, `scroll`, `resize`, `refresh`.

## Acknowledgements

The creation of `CodeJarPro` would not have been possible without the excellent foundation provided by [antonmedv/codejar](https://github.com/antonmedv/codejar). Special thanks to the original author, **Anton Medvedev**, for his outstanding work and selfless contribution.

## License

This project is licensed under the **MIT** License. Copyright is jointly held by **WOODCOAL (木炭)** and **Anton Medvedev**. See the `LICENSE` file for details.
