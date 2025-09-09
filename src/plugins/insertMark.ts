/**
 * @author        木炭 <woodcoal@qq.com>
 * @date          2025-09-01 06:30:46
 * Copyright © 木炭 (WOODCOAL) All rights reserved
 */

import { createPlugin, visit } from '../libs';
import type { CodeJarProInstance } from '../types';

/** 将行列号转换为字符索引 */
export function rowColToIndex(code: string, line: number, col: number): number {
	let index = 0;
	const lines = code.split('\n');
	for (let i = 0; i < line - 1; i++) {
		index += (lines[i] || '').length + 1;
	}
	index += col - 1;
	return index;
}

/** 在指定位置插入一个独立的标记节点（我们的“小旗子”） */
export function insertMarkerNode(options: {
	/** 标记 ID，做过标记的地方不再处理 */
	markerId: string;
	editor: HTMLElement;
	start: number;
	class?: string;
	message?: string;
	style?: string;
}): HTMLElement | null {
	const { editor, start, class: className, message, style, markerId } = options;

	let current = 0;
	let startNode: Node | undefined;

	visit(editor, (el) => {
		if (el.nodeType !== Node.TEXT_NODE || !el.parentNode) return;
		if (!el.nodeValue) return;

		const len = el.nodeValue.length;
		if (current + len > start) {
			if (!startNode) {
				startNode = el;
				return 'stop';
			}
		}
		current += len;
	});

	if (!startNode && editor.firstChild === null) {
		startNode = editor;
	}

	if (startNode) {
		const id = markerId || 'codejarpro_marker';
		const parent = startNode.parentNode!;

		// 如果父节点本身就是我们创建的标记，说明这个词已经被标记了，
		if (parent instanceof HTMLElement && parent.classList.contains(id)) {
			parent.className = `${className} ${id}`;
			parent.style = style || '';
			parent.title = message || '';

			return parent; // 返回现有的标记元素
		}

		const content = startNode.textContent || '';

		// 1. 使用正则表达式分解字符串
		const fragments = content.match(/\S+|\s+/g);

		// 如果没有匹配到任何内容，直接返回
		if (!fragments) return null;

		// 2. 遍历分解后的片段，进行重组
		fragments.forEach((fragment) => {
			// 3. 判断是“非空白字符块”还是“空白字符块”
			if (/\S/.test(fragment)) {
				// 这是非空白块，创建 <span> 来包裹
				const span = document.createElement('span');

				className && (span.className = className);
				span.classList.add(id);

				style && (span.style = style);
				message && (span.title = message);
				span.textContent = fragment;
				// 在原始 textNode 之前插入新创建的 span
				parent.insertBefore(span, startNode!);
			} else {
				// 这是空白块，创建新的文本节点
				const newTextNode = document.createTextNode(fragment);
				// 在原始 textNode 之前插入新创建的文本节点
				parent.insertBefore(newTextNode, startNode!);
			}
		});

		// 4. 所有新节点都已插入完毕，删除原始的、未分割的 textNode
		parent.removeChild(startNode);
	}
	return null;
}

/**
 * 自定义标签
 * @param editor 编辑器实例
 * @param show 是否显示行号
 */
function create(cjp: CodeJarProInstance) {
	// 一个内部变量，用于存储行号元素的引用
	const { editor, save, restore, toString } = cjp;

	// 用于存放所有标记元素
	const markers = new Map<string, HTMLElement[]>();

	/**
	 * 在指定位置添加一个文本标记
	 * @param markerId 标记的唯一ID
	 * @param info 标记信息
	 * @param className 应用于标记的 CSS 类名
	 */
	function addMarker(info: {
		/** 标记的唯一ID */
		markerId: string;

		/** 字符位置，优先级高于 `line` `column`；两者只需设置一个 */
		index?: number;

		/** 行号 (从 1 开始) 优先级低于 `index`；两者只需设置一个 */
		line?: number;

		/** 列号 (从 1 开始) 优先级低于 `index`；两者只需设置一个 */
		column?: number;

		/** 标记信息 */
		message?: string;

		/** 标记类型样式 */
		markerClass?: string;

		/** 标记样式 */
		markerStyle?: string;
	}) {
		const { markerId = '', line = 0, column = 0, message, markerClass, markerStyle } = info;

		if (markers.has(markerId)) removeMarker(markerId);

		const code = toString();
		const startIndex = info.index || rowColToIndex(code, line, column);
		const pos = save();
		const element = insertMarkerNode({
			markerId,
			editor,
			start: startIndex,
			class: markerClass,
			style: markerStyle,
			message
		});
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
			if (!el.parentNode) return;
			el.parentNode.insertBefore(el.firstChild!, el!);
			el.parentNode.removeChild(el);
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

	/** 返回插件 */
	return {
		name: 'InsertMark',
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
	};
}

export const InsertMark = createPlugin(create);
export default InsertMark;

/** 插件类型 */
export type InsertMarkPlugin = ReturnType<typeof InsertMark>;
