/**
 * @author        木炭 <woodcoal@qq.com>
 * @date          2025-09-01 06:30:46
 * Copyright © 木炭 (WOODCOAL) All rights reserved
 */

import { visit } from '../libs.js';
import { CodeJarPro, IPlugin } from '../types.js';

/**
 * 自定义标签
 * @param editor 编辑器实例
 * @param show 是否显示行号
 */
function creteaPlugin(cjp: CodeJarPro) {
	// 一个内部变量，用于存储行号元素的引用
	const { editor, save, restore, toString } = cjp;

	// 用于存放所有标记元素
	const markers = new Map<string, HTMLElement[]>();

	/** 将行列号转换为字符索引 */
	function rowColToIndex(code: string, line: number, col: number): number {
		let index = 0;
		const lines = code.split('\n');
		for (let i = 0; i < line - 1; i++) {
			index += (lines[i] || '').length + 1;
		}
		index += col - 1;
		return index;
	}

	/** 在指定位置插入一个独立的标记节点（我们的“小旗子”） */
	function insertMarkerNode(
		start: number,
		className: string,
		message?: string
	): HTMLElement | null {
		const range = document.createRange();
		let current = 0;
		let startNode: Node | undefined;
		let startOffset = 0;

		visit(editor, (el) => {
			if (el.nodeType !== Node.TEXT_NODE) return;
			const len = (el.nodeValue || '').length;
			if (current + len >= start) {
				if (!startNode) {
					startNode = el;
					startOffset = start - current;
					return 'stop';
				}
			}
			current += len;
		});

		if (!startNode && editor.firstChild === null) {
			startNode = editor;
			startOffset = 0;
		}

		if (startNode) {
			range.setStart(startNode, startOffset);
			const span = document.createElement('span');
			span.className = className;
			message && (span.title = message);
			range.insertNode(span);
			return span;
		}
		return null;
	}

	/**
	 * 在指定位置添加一个文本标记
	 * @param markerId 标记的唯一ID
	 * @param info 标记信息
	 * @param className 应用于标记的 CSS 类名
	 */
	function addMarker(
		markerId: string,
		info: {
			/** 行号 (从 1 开始) */
			line: number;

			/** 列号 (从 1 开始) */
			column: number;

			/** 标记信息 */
			message?: string;

			/** 标记类型样式 */
			markerClass: string;
		}
	) {
		if (markers.has(markerId)) removeMarker(markerId);

		const code = toString();
		const { line, column, message, markerClass } = info;
		const startIndex = rowColToIndex(code, line, column);
		const pos = save();
		const element = insertMarkerNode(startIndex, markerClass, message);
		restore(pos);
		element && markers.set(markerId, [element]);
	}

	/**
	 * 根据 ID 移除一个文本标记
	 * @param markerId 要移除的标记的ID
	 */
	function removeMarker(markerId: string) {
		const elements = markers.get(markerId);
		if (!elements) return;

		elements.forEach((el) => {
			el.parentNode?.removeChild(el);
		});
		markers.delete(markerId);
	}

	/** 移除全部标记 */
	function removeAllMarkers() {
		markers.forEach((elements) => {
			elements.forEach((el) => {
				el.parentNode?.removeChild(el);
			});
		});

		markers.clear();
	}

	/** 监听事件 */
	return {
		name: 'insertMark',
		addMarker,
		removeMarker,
		removeAllMarkers,
		onAction: () => {},
		destroy() {
			removeAllMarkers();

			// 清空所有操作
			/** @ts-ignore */
			this.addMarker =
				/** @ts-ignore */
				this.removeMarker =
				/** @ts-ignore */
				this.removeAllMarkers =
					() => {};
		}
	} as IPlugin;
}

export function InsertMark(cjp: CodeJarPro) {
	const { id = '' } = cjp;

	/** 操作列表 */
	const plugins = new Map<string, IPlugin>();

	/** 返回指定操作 */
	if (plugins.has(id)) return plugins.get(id)!;

	/** 创建操作 */
	const plugin = creteaPlugin(cjp);
	plugins.set(id, plugin);

	return plugin;
}

export default InsertMark;
