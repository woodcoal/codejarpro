/**
 * @author        木炭 <woodcoal@qq.com>
 * @date          2025-09-04 13:02:34
 * Copyright © 木炭 (WOODCOAL) All rights reserved
 */

import { Options } from 'tsup';
import { defineConfig } from 'tsup';

const createOptions = (path: string, fileName: string, name: string): Options => {
	return {
		entry: {
			[fileName]: path
		},
		format: path.endsWith('index.ts') ? ['esm', 'cjs'] : ['esm', 'cjs', 'iife'],
		globalName: 'obj',
		legacyOutput: false,
		dts: true,
		splitting: false,
		clean: true,
		minify: true,
		sourcemap: false,
		footer: ({ format }) => {
			if (format === 'iife') {
				return {
					js: `(globalThis.CJP ||= {}).Plugin ||= {};globalThis.CJP.${name} = obj.default;`
				};
			}
			return {};
		},
		outExtension: ({ format }) => {
			if (format === 'iife') {
				return {
					js: '.min.js'
				};
			}
			return {};
		}
	};
};

export default defineConfig([
	createOptions('src/index.ts', 'index', 'CodeJarPro'),
	createOptions('src/codejarpro.ts', 'codejarpro', 'CodeJarPro'),
	createOptions('src/plugins/index.ts', 'plugins/index', 'Plugin'),
	createOptions('src/plugins/insertMark.ts', 'plugins/insertMark', 'Plugin.InsertMark'),
	createOptions('src/plugins/lineNumbers.ts', 'plugins/lineNumbers', 'Plugin.LineNumbers'),
	createOptions('src/plugins/jsonValidate.ts', 'plugins/jsonValidate', 'Plugin.JsonValidate'),
	createOptions('src/plugins/wordCounter.ts', 'plugins/wordCounter', 'Plugin.WordCounter')
]);
