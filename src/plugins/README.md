# CodeJarPro Core Plugins Documentation

This document provides detailed information on the built-in core plugins for CodeJarPro, including how to use their APIs and all available configuration options.

---

## 1\. Line Numbers Plugin (`LineNumbers`)

Provides a powerful and adaptive line number display feature for the editor. It automatically handles inconsistencies in line height caused by code wrapping and editor resizing.

### Registration and Configuration

You can register and configure the line numbers plugin using the `cjp.addPlugin` method.

```javascript
// Register and enable line numbers
const lineNumbers = cjp.addPlugin("lineNumbers", CJP.Plugin.LineNumbers, {
	show: true,
});
```

In an ESM environment:

```javascript
import { LineNumbers } from "codejarpro/plugins";
const lineNumbers = cjp.addPlugin("lineNumbers", LineNumbers, { show: true });
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

---

## 2\. Marker Plugin (`InsertMark`)

Allows you to insert a visual marker at any row and column in the code, which is ideal for displaying syntax errors, warnings, or other informational messages.

### Registration

This plugin does not require initial configuration.

```javascript
// Browser environment
const insertMark = cjp.addPlugin("insertMark", CJP.Plugin.InsertMark);

// ESM environment
import { InsertMark } from "codejarpro/plugins";
const insertMark = cjp.addPlugin("insertMark", InsertMark);
```

### API

The plugin instance `insertMark` exposes the following core methods:

-   **`insertMark.addMarker(markerId, info)`**

    Adds a marker at a specified position.

    -   `markerId: string`: A unique ID for the marker, e.g., `'json-error-1'`.
    -   `info: object`: An object containing the marker's details, with the following properties:
        -   `line: number`: The line number (starting from 1).
        -   `column: number`: The column number (starting from 1).
        -   `message?: string`: A tooltip message to display when hovering over the marker (will be set to the `title` attribute).
        -   `markerClass: string`: The CSS class name to apply to the marker's `<span>` element, e.g., `'error-marker'`.

-   **`insertMark.removeMarker(markerId)`**

    Removes a specific marker by its ID.

-   **`insertMark.removeAllMarkers()`**

    Removes all markers created by this plugin, typically used for cleanup before re-validating the code.

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
	// Parse successful, remove the old error marker
	insertMark.removeMarker("json-syntax-error");
} catch (e) {
	// Parse failed, find the error position
	const pos = parseErrorPosition(e.message, code); // parseErrorPosition is your own parsing function

	// Add a marker at the error position
	insertMark.addMarker("json-syntax-error", {
		line: pos.line,
		column: pos.column,
		message: e.message,
		markerClass: "error-marker",
	});
}
```
