/*
 * ------------------------------------------------------------
 *
 * 	Copyright © 2025 湖南大沥网络科技有限公司.
 *
 * 	  author: 木炭
 * 	   email: woodcoal@qq.com
 * 	homepage: http://www.hunandali.com/
 *
 * ------------------------------------------------------------
 *
 * 	打包配置
 *
 * 	file: tsup.config.ts
 * 	time: 2025-08-13 10:34:09
 *
 * ------------------------------------------------------------
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
	createOptions('src/plugins/lineNumbers.ts', 'plugins/lineNumbers', 'Plugin.LineNumbers')
]);
