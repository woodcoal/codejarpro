# CodeJarPro Core Plugins Documentation

This document provides detailed information on the built-in core plugins for CodeJarPro, including how to use their APIs and all available configuration options.

---

## 1. Line Numbers Plugin (`LineNumbers`)

Provides a powerful and adaptive line number display feature for the editor. It automatically handles inconsistencies in line height caused by code wrapping and editor resizing.

### Registration and Configuration

javascript
import { LineNumbers } from 'codejarpro/plugins';
const lineNumbers = cjp.addPlugin(LineNumbers, { show: true });

#### Configuration Options

-   `config.show: boolean`: Controls the visibility of the line numbers.
    -   `true` (default): Shows the line numbers.
    -   `false`: Hides the line numbers.

### API

The plugin instance `lineNumbers` exposes the following methods:

-   **`lineNumbers.updateConfig(config)`**

    Dynamically updates the configuration of the line numbers plugin.

    **Example:**

    ```javascript
    // Hide line numbers
    lineNumbers.updateConfig({ show: false });
    ```

---

## 2\. Insert Mark Plugin (`InsertMark`)

Allows you to insert a visual marker at any row and column in the code, which is ideal for displaying syntax errors, warnings, or other informational messages.

### Registration

This plugin does not require initial configuration.

```javascript
import { InsertMark } from 'codejarpro/plugins';
const insertMark = cjp.addPlugin(InsertMark);
```

### API

The plugin instance `insertMark` exposes the following core methods:

-   **`insertMark.addMarker(info)`**

    Adds a marker at a specified position.

    -   `info: object`: An object containing the marker's details:
        -   `markerId: string`: A unique ID for the marker.
        -   `line: number`: The line number (starting from 1).
        -   `column: number`: The column number (starting from 1).
        -   `message?: string`: A tooltip message to display when hovering over the marker.
        -   `markerClass?: string`: The CSS class name to apply to the marker's `<span>` element.
        -   `markerStyle?: string`: Inline styles to apply to the marker.

-   **`insertMark.removeMarker(markerId)`**: Removes a specific marker by its ID.

-   **`insertMark.removeAllMarkers()`**: Removes all markers created by this plugin.

### Usage Example (JSON Syntax Validation)

```javascript
// Assuming 'insertMark' is an instance of the InsertMark plugin
// and 'cjp' is the CodeJarPro instance.

const code = cjp.toString();
try {
	JSON.parse(code);
	// Parse successful, remove old error markers
	insertMark.removeMarker('json-syntax-error');
} catch (e) {
	// Parse failed, find error position
	// (parseErrorPosition is a helper function you might need to write)
	const pos = parseErrorPosition(e.message, code);

	// Add marker at the error position
	insertMark.addMarker({
		markerId: 'json-syntax-error',
		line: pos.line,
		column: pos.column,
		message: e.message,
		markerClass: 'error-marker' // A CSS class for styling
	});
}
```

---

## 3\. JSON Validation Plugin (`JsonValidate`)

Automatically detects and marks JSON syntax errors in the editor, providing real-time JSON format validation.

### Registration and Configuration

```javascript
import { JsonValidate } from 'codejarpro/plugins';
const jsonValidate = cjp.addPlugin(JsonValidate, {
	enabled: true,
	// Optional: custom styling
	markerClass: 'json-error-marker',
	// Optional: callback for errors
	onError: (error, pos) => {
		if (error) {
			console.log(`JSON Error: ${error.message} at line ${pos.line}`);
		} else {
			console.log('JSON is valid!');
		}
	}
});
```

#### Configuration Options

-   `config.enabled: boolean | (() => boolean)`: Controls whether the plugin is enabled. Can be a boolean or a function that returns a boolean. Default: `false`.
-   `config.markerClass?: string`: The CSS class name to apply to error markers.
-   `config.markerStyle?: string`: Inline styles to apply to error markers.
-   `config.onError?: (error: Error | false, pos?: { line?: number; column?: number; index: number }) => void`: Callback function when an error is found or cleared.

### API

-   **`jsonValidate.updateConfig(config)`**: Dynamically updates the plugin configuration.
-   **`jsonValidate.validate(code)`**: Manually triggers a JSON validation. Returns `true` if an error is found.

---

## 4\. Word Counter Plugin (`WordCounter`)

Real-time counting of characters, words, and display of current cursor position (line and column numbers).

### Registration and Configuration

```javascript
import { WordCounter } from 'codejarpro/plugins';

// Create a target element in your HTML: <div id="counter-display"></div>
const counterElement = document.getElementById('counter-display');

const wordCounter = cjp.addPlugin(WordCounter, {
	target: counterElement,
	format: (info) => `Chars: ${info.chars} | Words: ${info.words} | Pos: ${info.row}:${info.col}`
});
```

#### Configuration Options

-   `config.target?: HTMLElement`: The HTML element to display the counting information. If not provided, a `div` will be created automatically.
-   `config.format?: (info) => string`: A custom function to format the counting information.
    -   `info.words: number`: Number of words.
    -   `info.chars: number`: Number of characters.
    -   `info.row: number`: Current cursor line number.
    -   `info.col: number`: Current cursor column number.

### API

-   **`wordCounter.updateConfig(config)`**: Dynamically updates the plugin configuration.

### Helper Function

The WordCounter module also exports a useful helper function:

-   **`getLineColumn(source: string, index: number)`**: Gets the line and column number for a character at a specific index in a string.

```javascript
import { getLineColumn } from 'codejarpro/plugins/wordCounter'; // Note the import path
const text = 'Hello\nWorld';
const position = getLineColumn(text, 7); // { line: 2, column: 2 }
```

---

## 5\. Plugin Common API

All plugins share the following common method:

-   **`plugin.destroy()`**: Destroys the plugin instance, cleans up resources, and removes all related DOM elements.

```javascript
// Destroy plugins that are no longer needed
lineNumbers.destroy();
jsonValidate.destroy();
```
