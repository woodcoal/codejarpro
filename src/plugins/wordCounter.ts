/**
 * @author        木炭 <woodcoal@qq.com>
 * @date          2025-09-08 01:15:48
 * Copyright © 木炭 (WOODCOAL) All rights reserved
 */

import { createPlugin, debounce, isFn, isObj } from '../libs';
import type { ActionName, CodeJarProInstance } from '../types';

/**
 * 根据字符串索引获取行列号
 * @param source - 原始字符串
 * @param index - 目标字符的索引位置
 * @returns 包含行号(line)和列号(column)的对象
 */
export function getLineColumn(source: string, index: number) {
	// 检查输入参数是否有效
	if (!source || !index || index < 0) return;

	// 截取从字符串开始到目标索引的子字符串
	const substring = source.substring(0, index);

	// 计算换行符的数量，行号 = 换行符数量 + 1
	const line = (substring.match(/\n/g) || []).length + 1;

	// 计算当前行的起始位置，列号 = 当前索引 - 当前行起始位置
	const lastNewLineIndex = substring.lastIndexOf('\n');
	const column = lastNewLineIndex === -1 ? index + 1 : index - lastNewLineIndex;

	return { line, column };
}

/** 配置 */
export type PluginOptions = {
	/** 是否显示 */
	show?: boolean | ((code: string) => boolean);

	/** 统计信息输出的组件 */
	target?: HTMLElement;

	/** 格式化统计信息 */
	format?: (info: {
		/** 单词数量 */
		words: number;

		/** 字符数量 */
		chars: number;

		/** 当前行号 */
		row: number;

		/** 当前列号 */
		col: number;
	}) => string;
};

/**
 * 自定义标签
 * @param editor 编辑器实例
 * @param show 是否显示行号
 */
function create(cjp: CodeJarProInstance, config?: PluginOptions) {
	config = {
		show: true,
		...config
	};

	const { editor, save } = cjp;
	let { target } = config || {};
	if (!target) {
		target = document.createElement('div');
		editor.parentElement?.appendChild(target);
	}

	const math = debounce((code: string) => {
		const show = isFn(config.show) ? config.show(cjp.toString()) : config.show;
		if (!show) {
			target.textContent = '';
			return;
		}

		// 仅在更新前执行
		const cursor = save();
		const pos = getLineColumn(code, cursor.start);

		const words = code.split(/\s+/).filter((item) => !!item);
		const info = {
			words: words.length,
			chars: code.length,
			row: pos?.line || 1,
			col: pos?.column || 1
		};

		const format = isFn(config.format)
			? config.format
			: () => {
					return `共 ${info.chars} 个字符；${info.words} 个单词；当前位置：${info.row} 行 ${info.col}列`;
			  };

		target.textContent = format(info);
	}, cjp.options.debounce.update || 150);

	// 安装时尝试执行一次
	math(cjp.toString());

	/** 返回插件 */
	return {
		name: 'WordCounter',
		onAction: (params: { name: ActionName; code: string; event?: Event }) => {
			if (['click', 'keyup', 'highlight'].includes(params.name)) math(params.code);
		},
		updateConfig: (opts: PluginOptions) => {
			if (!isObj(opts)) return;
			isObj(opts.target) && (config.target = opts.target);
			isFn(opts.format) && (config.format = opts.format);
			(isFn(opts.show) || opts.show === false || opts.show === true) &&
				(config.show = opts.show);
		}
	};
}

export const WordCounter = createPlugin(create);
export default WordCounter;

/** 插件类型 */
export type WordCounterPlugin = ReturnType<typeof WordCounter>;
