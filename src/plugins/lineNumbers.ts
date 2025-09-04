/**
 * @author        木炭 <woodcoal@qq.com>
 * @date          2025-09-01 06:28:18
 * Copyright © 木炭 (WOODCOAL) All rights reserved
 */

import { debounce, isObj } from '../libs.js';
import { ActionName, CodeJarPro, IPlugin } from '../types.js';

/**
 * 行号插件
 * @param editor 编辑器实例
 * @param show 是否显示行号
 */
function creteaPlugin(cjp: CodeJarPro, config: LineNumbersOptions) {
	// 一个内部变量，用于存储行号元素的引用
	const { editor, options } = cjp;

	let lineNumbersEl: HTMLElement | null = null;

	const NAME_CONTAINER = 'codejarpro-container';
	const NAME_LINENUMBER = 'line-numbers';

	// 初始化操作
	const init = () => {
		if (!config.show) {
			if (lineNumbersEl) lineNumbersEl.style.display = 'none';
			return;
		}

		// 行号项目已经存在则无需再初始化，直接显示
		if (lineNumbersEl) {
			lineNumbersEl.style.display = 'block';
			return;
		}

		// 检查是否已经设置过
		const editorParent = editor.parentNode as HTMLElement;
		if (editorParent?.classList.contains(NAME_CONTAINER)) return;

		// 编辑器默认样式
		const css = getComputedStyle(editor);

		// 创建编辑器外部容器
		const container = document.createElement('div');
		container.className = NAME_CONTAINER;
		container.style.display = 'flex';
		container.style.resize = 'both';
		container.style.background = css.background;
		container.style.marginTop = css.borderTopWidth;
		container.style.marginBottom = css.borderBottomWidth;
		container.style.marginLeft = css.borderLeftWidth;
		container.style.borderTopLeftRadius = css.borderTopLeftRadius;
		container.style.borderBottomLeftRadius = css.borderBottomLeftRadius;

		// 修改编辑器样式
		editor.style.flexGrow = '1';

		// 创建行号元素
		lineNumbersEl = document.createElement('div');
		lineNumbersEl.style.display = 'block';
		// lineNumbersEl.style.width = '48px';
		lineNumbersEl.style.textAlign = 'right';
		lineNumbersEl.style.userSelect = 'none';
		lineNumbersEl.style.backgroundColor = 'rgba(128, 128, 128, 0.15)';
		lineNumbersEl.style.color = css.color;
		lineNumbersEl.style.borderRight = '1px solid #ddd';
		lineNumbersEl.style.fontFamily = css.fontFamily;
		lineNumbersEl.style.fontSize = css.fontSize;
		lineNumbersEl.style.lineHeight = css.lineHeight;
		lineNumbersEl.style.paddingTop = css.paddingTop;
		lineNumbersEl.style.paddingBottom = css.paddingBottom;
		lineNumbersEl.style.paddingLeft = '0.5rem';
		lineNumbersEl.style.paddingRight = '0.5rem';

		lineNumbersEl.className = NAME_LINENUMBER;
		lineNumbersEl.innerHTML = '<div>1</div>';

		// 替换掉原来的 editor，并将 editor 放入 container 里
		editorParent!.insertBefore(container, editor);
		container.appendChild(lineNumbersEl);
		container.appendChild(editor);
	};

	/** 更新行号 */
	const update = (code: string) => {
		init();
		if (!lineNumbersEl) return;

		const lines = code.split('\n');

		// 1. 创建一个看不见的 mirror 元素
		const mirror = document.createElement('div');
		const mirrorContent = document.createElement('div');
		mirror.appendChild(mirrorContent);

		// 2. 复制关键样式
		const style = window.getComputedStyle(editor);
		mirror.style.fontFamily = style.fontFamily;
		mirror.style.fontSize = style.fontSize;
		mirror.style.lineHeight = style.lineHeight;
		mirror.style.width = style.width;
		mirror.style.padding = style.padding;
		mirror.style.whiteSpace = style.whiteSpace;
		mirror.style.overflowWrap = style.overflowWrap;
		mirror.style.wordBreak = style.wordBreak;

		// 把它藏到屏幕外
		mirror.style.position = 'absolute';
		mirror.style.left = '-9999px';

		// 3. 把每一行代码用 div 包裹后放入 mirror
		mirrorContent.innerHTML = lines.map((line) => `<div>${line || ' '}</div>`).join('');

		// 4. 把 mirror 添加到 DOM 中，让浏览器计算它的高度
		document.body.appendChild(mirror);

		// 5. 测量并收集每一行的高度
		const lineHeights: number[] = [];
		const children = Array.from(mirrorContent.children) as HTMLElement[];
		children.forEach((child) => {
			lineHeights.push(child.offsetHeight);
		});

		// 6. 测量完毕，销毁 mirror
		document.body.removeChild(mirror);

		// 7. 生成新的行号 HTML，并应用我们测量到的精确高度
		let lineNumbersContent = '';
		for (let i = 0; i < lines.length; i++) {
			// 如果高度为 0 (可能是空行)，给一个默认的行高
			const height = lineHeights[i] || 20;
			lineNumbersContent += `<div style="height: ${height}px"><div>${i + 1}</div></div>`;
		}

		// 更新行号
		lineNumbersEl.innerHTML = lineNumbersContent;
	};

	/** 销毁 */
	const destroy = () => {
		if (lineNumbersEl) {
			// 如果开启了行号，就把 DOM 结构恢复回去
			const container = editor.parentNode!;
			const originalParent = container.parentNode!;
			originalParent.insertBefore(editor, container);
			originalParent.removeChild(container);
		}
	};

	// 创建一个防抖版的行号更新函数，防止在快速拖拽时频繁触发
	const debounceUpdate = debounce(update, options.debounce.highlight || 300);

	/** 监听事件 */
	const onAction = (params: {
		/** 操作名称 */
		name: ActionName;

		/** 编辑器当前代码 */
		code: string;

		/** 事件对象 */
		event?: Event;
	}) => {
		const { name = '', code = '' } = params;

		// 更新行号
		if (['highlight', 'resize'].includes(name)) return debounceUpdate(code);

		// 添加滚动监控事件
		if (name === 'scroll') {
			if (config.show && lineNumbersEl) {
				lineNumbersEl.scrollTop = editor.scrollTop;
			}
			return;
		}
	};

	return {
		name: 'LineNumbers',
		onAction,
		updateConfig: (opts: LineNumbersOptions) => {
			if (!isObj(opts)) return;
			config.show = !!opts.show;
		},
		destroy
	} as IPlugin<LineNumbersOptions>;
}

/** 配置 */
export type LineNumbersOptions = {
	show: boolean;
};

export function LineNumbers(cjp: CodeJarPro, config: LineNumbersOptions) {
	const { id = '' } = cjp;

	/** 操作列表 */
	const plugins = new Map<string, IPlugin<LineNumbersOptions>>();

	/** 返回指定操作 */
	if (plugins.has(id)) return plugins.get(id);

	/** 创建操作 */
	const plugin = creteaPlugin(cjp, config);
	plugins.set(id, plugin);

	return plugin;
}

export default LineNumbers;
