# CodeJarPro Core Plugins Documentation

This document provides detailed information on the built-in core plugins for CodeJarPro, including how to use their APIs and all available configuration options.

---

## 1. Line Numbers Plugin (`LineNumbers`)

Provides a powerful and adaptive line number display feature for the editor. It automatically handles inconsistencies in line height caused by code wrapping and editor resizing.

### Registration and Configuration

You can register and configure the line numbers plugin using the `cjp.addPlugin` method.

```javascript
// Register and enable line numbers
const lineNumbers = cjp.addPlugin('lineNumbers', CJP.Plugin.LineNumbers, {
	show: true
});
```

In an ESM environment:

```javascript
import { LineNumbers } from 'codejarpro/plugins';
const lineNumbers = cjp.addPlugin('lineNumbers', LineNumbers, { show: true });
```

#### Configuration Options

-   `config.show: boolean`: Controls the visibility of the line numbers.
    -   `true` (default): Shows the line numbers.
    -   `false`: Hides the line numbers.

### API

The line numbers plugin typically works automatically in the background, but you can also dynamically update its configuration through the plugin instance.

-   **`lineNumbers.updateConfig(config)`**

    Dynamically updates the configuration of the line numbers plugin.

    **Example:**

    ```javascript
    // Hide line numbers
    lineNumbers.updateConfig({ show: false });

    // Show line numbers again
    lineNumbers.updateConfig({ show: true });
    ```

-   **`lineNumbers.destroy()`**

    Destroys the plugin instance, cleans up resources, and removes all related DOM elements.

---

## 2. Marker Plugin (`InsertMark`)

Allows you to insert a visual marker at any row and column in the code, which is ideal for displaying syntax errors, warnings, or other informational messages.

### Registration

This plugin does not require initial configuration.

```javascript
// Browser environment
const insertMark = cjp.addPlugin('insertMark', CJP.Plugin.InsertMark);

// ESM environment
import { InsertMark } from 'codejarpro/plugins';
const insertMark = cjp.addPlugin('insertMark', InsertMark);
```

### API

The plugin instance `insertMark` exposes the following core methods:

-   **`insertMark.addMarker(info)`**

    Adds a marker at a specified position.

    -   `info: object`: An object containing the marker's details, with the following properties:
        -   `markerId: string`: A unique ID for the marker.
        -   `line: number`: The line number (starting from 1).
        -   `column: number`: The column number (starting from 1).
        -   `message?: string`: A tooltip message to display when hovering over the marker (will be set to the `title` attribute).
        -   `markerClass?: string`: The CSS class name to apply to the marker's `<span>` element.
        -   `markerStyle?: string`: Inline styles to apply to the marker.

-   **`insertMark.removeMarker(markerId)`**

    Removes a specific marker by its ID.

-   **`insertMark.removeAllMarkers()`**

    Removes all markers created by this plugin, typically used for cleanup before re-validating the code.

-   **`insertMark.destroy()`**

    Destroys the plugin instance, cleans up resources, and removes all related DOM elements.

### Usage Example (JSON Syntax Validation)

```css
/* Define a style for the error marker */
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
	// Parse successful, remove old error markers
	insertMark.removeMarker('json-syntax-error');
} catch (e) {
	// Parse failed, find error position
	const pos = parseErrorPosition(e.message, code);

	// Add marker at the error position
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

## 3. JSON Validation Plugin (`JsonValidate`)

Automatically detects and marks JSON syntax errors in the editor, providing real-time JSON format validation functionality.

### Registration and Configuration

```javascript
// Browser environment
const jsonValidate = cjp.addPlugin('jsonValidate', CJP.Plugin.JsonValidate, {
	enabled: true,
	markerClass: 'json-error',
	markerStyle:
		'background-color: rgba(255, 215, 0, 0.3); padding: 0 5px; border-radius: 2px; text-decoration: wavy underline red; text-underline-offset: 3px; text-decoration-thickness: 2px;'
});

// ESM environment
import { JsonValidate } from 'codejarpro/plugins';
const jsonValidate = cjp.addPlugin('jsonValidate', JsonValidate, {
	enabled: true
});
```

#### Configuration Options

-   `config.enabled: boolean | (() => boolean)`: Controls whether the plugin is enabled. Can be a boolean or a function that returns a boolean.
    -   `true`: Enables JSON validation.
    -   `false` (default): Disables JSON validation.
-   `config.markerClass?: string`: The CSS class name to apply to error markers.
-   `config.markerStyle?: string`: Inline styles to apply to error markers. The default style is a yellow background with a red wavy underline.
-   `config.onError?: (error: Error | false, pos?: { line?: number; column?: number; index: number }) => void`: Callback function when there is an error.
    -   `error`: `false` when there is no error, otherwise the JSON parsing error object.
    -   `pos`: Error position information, including line number, column number, and index position.

### API

The plugin instance `jsonValidate` provides the following methods:

-   **`jsonValidate.updateConfig(config)`**

    Dynamically updates the plugin configuration.

    **Example:**

    ```javascript
    // Enable JSON validation
    jsonValidate.updateConfig({ enabled: true });

    // Customize error marker style
    jsonValidate.updateConfig({
    	markerStyle: 'background-color: rgba(255, 99, 71, 0.2); border-bottom: 2px dotted red;'
    });
    ```

-   **`jsonValidate.validate(code)`**

    Manually triggers a JSON validation.

    -   `code: string`: The JSON string to validate.
    -   Returns: `true` (JSON format has errors), `undefined` (JSON format is correct or plugin is not enabled).

    **Example:**

    ```javascript
    const hasError = jsonValidate.validate(cjp.toString());
    if (!hasError) {
    	console.log('JSON format is correct');
    } else {
    	console.log('JSON format has errors, marked in the editor');
    }
    ```

-   **`jsonValidate.destroy()`**

    Destroys the plugin instance, cleans up resources, and removes all related DOM elements.

---

## 4. Word Counter Plugin (`WordCounter`)

Real-time counting of characters, words, and display of current cursor position (line and column numbers) in the editor.

### Registration and Configuration

```javascript
// Browser environment
const wordCounter = cjp.addPlugin('wordCounter', CJP.Plugin.WordCounter, {
	target: document.getElementById('counter-display'),
	format: (info) =>
		`Characters: ${info.chars} | Words: ${info.words} | Position: ${info.row}:${info.col}`
});

// ESM environment
import { WordCounter } from 'codejarpro/plugins';
const wordCounter = cjp.addPlugin('wordCounter', WordCounter);
```

#### Configuration Options

-   `config.target?: HTMLElement`: The HTML element to display the counting information. If not provided, the plugin will automatically create a div and add it to the editor's parent element.
-   `config.format?: (info) => string`: A custom function to format the counting information.
    -   `info.words: number`: Number of words.
    -   `info.chars: number`: Number of characters.
    -   `info.row: number`: Current cursor line number.
    -   `info.col: number`: Current cursor column number.

### API

The plugin instance `wordCounter` provides the following methods:

-   **`wordCounter.updateConfig(config)`**

    Dynamically updates the plugin configuration.

    **Example:**

    ```javascript
    // Change display target element
    wordCounter.updateConfig({
    	target: document.getElementById('new-counter-display')
    });

    // Custom display format
    wordCounter.updateConfig({
    	format: (info) =>
    		`${info.chars} chars, ${info.words} words, line ${info.row}, column ${info.col}`
    });
    ```

-   **`wordCounter.destroy()`**

    Destroys the plugin instance, cleans up resources, and removes all related DOM elements.

### Helper Function

The WordCounter plugin also exports a useful helper function for getting the line and column number at a specific index in a string:

-   **`getLineColumn(source, index)`**

    Gets the line and column number based on string index.

    -   `source: string`: The original string.
    -   `index: number`: The target character's index position.
    -   Returns: An object containing `line` and `column`, or `undefined` (if input is invalid).

    **Example:**

    ```javascript
    import { getLineColumn } from 'codejarpro/plugins/wordCounter';

    const text = 'Hello\nWorld\nJavaScript';
    const position = getLineColumn(text, 8); // The character at index 8 is 'W'
    console.log(position); // Output: { line: 2, column: 1 }
    ```

---

## 5. Plugin Common API

All plugins share the following common method:

-   **`plugin.destroy()`**: Destroys the plugin instance, cleans up resources, and removes all related DOM elements.

```javascript
// Destroy plugins that are no longer needed
lineNumbers.destroy();
jsonValidate.destroy();
insertMark.destroy();
wordCounter.destroy();
```
