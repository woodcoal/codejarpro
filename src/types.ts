/**
 * @author        木炭 <woodcoal@qq.com>
 * @date          2025-09-01 02:01:02
 * Copyright © 木炭 (WOODCOAL) All rights reserved
 */

import CJP from './codejarpro.js';

/** 代码编辑器示例类型 */
export type CodeJarProEditor = ReturnType<typeof CJP>;
export type CodeJarPro = CodeJarProEditor;

/** 定义编辑器的所有可配置选项的类型 */
export type Options = {
	/** 防抖操作参数，单位：毫秒 */
	debounce: {
		/**
		 * 高亮防抖操作延时时长。
		 * 默认：`300`
		 */
		highlight: number;

		/**
		 * 代码更新回调操作防抖操作延时时长。
		 * 默认：`300`
		 */
		update: number;
	};

	/**
	 * 使用 `tab` 键时，插入的字符串。
	 * 例如：使用 `'  '` 或 `'\t'`。
	 * 注意：如果需要使用 `'\t'`，可以使用 `css` 规则 `tab-size` 来自定义大小
	 */
	tab: string;

	/**
	 * 匹配到哪些字符结尾的行，在换行时需要自动缩进。
	 * 默认：`/[({\[]$/`
	 */
	indentOn: RegExp;

	/**
	 * 匹配到哪些字符开头的行，在满足 indentOn 条件换行时，需要将这些字符也移动到新行。
	 * 默认：`/^[)}\]]/`
	 */
	moveToNewLine: RegExp;

	/**
	 * 是否开启拼写检查。
	 * 默认：`false`
	 */
	spellcheck: boolean;

	/**
	 * 是否捕获 Tab 键的按下事件（用于插入缩进）。
	 * 默认：`true`
	 */
	catchTab: boolean;

	/**
	 * 换行时是否保留当前行的缩进。
	 * 默认：`true`
	 */
	preserveIdent: boolean;

	/**
	 * 是否自动添加闭合的括号、引号等。
	 * 默认：`true`
	 */
	addClosing: boolean;

	/**
	 * 是否开启撤销/重做历史记录功能。
	 * 默认：`true`
	 */
	history: boolean;

	/**
	 * 窗口对象，用于访问 document 等。
	 * 默认：`window`
	 */
	window: typeof window;

	/** 自动闭合功能的详细配置 */
	autoclose: {
		/**
		 * 触发自动闭合的起始字符。
		 * 例如：`([{'"`
		 */
		open: string;
		/**
		 * 与起始字符对应的闭合字符。
		 * 例如：`)]}'"`
		 */
		close: string;
	};

	/** 是否禁用调试信息 */
	disableDebug: boolean;
};

/** 定义一条历史记录的结构 */
export type HistoryRecord = {
	/** 当时的编辑器内部 HTML 内容 */
	html: string;

	/** 当时的光标位置信息 */
	pos: Position;
};

/** 定义光标位置的类型 */
export type Position = {
	/** 选区的起始位置（从 0 开始的字符索引） */
	start: number;

	/** 选区的结束位置 */
	end: number;

	/** 选区的方向，'->' 表示从左到右，'<-' 表示从右到左 */
	dir?: '->' | '<-';
};

/** 定义所有可能的操作名称 */
export type ActionName =
	| 'beforeUpdate'
	| 'afterUpdate'
	| 'keydown'
	| 'keyup'
	| 'focus'
	| 'blur'
	| 'paste'
	| 'cut'
	| 'scroll'
	| 'resize'
	| 'highlight';

/** 插件接口基类 */
export interface IPlugin<T extends object = any> {
	/**
	 * 操作事件
	 * @param name 事件名称
	 * @param code 编辑器当前代码
	 * @param event 事件对象
	 * @returns 对于按键操作等事件返回 true 可以阻止默认行为
	 */
	onAction: (parmas: {
		/** 操作名称 */
		name: ActionName;

		/** 编辑器当前代码 */
		code: string;

		/** 事件对象 */
		event?: Event;
	}) => boolean | void;

	/**
	 * 更新配置
	 * @param config 新的配置选项
	 */
	updateConfig?: (config: T) => void;

	/** 插件销毁时调用 */
	destroy?: () => void;
}

/**
 * 函数类初始化插件
 * @param cjp 编辑器实例
 * @param config 插件配置选项
 * @returns 插件实例
 */
export type FunctionPlugin<T extends object = any> = (cjp: CodeJarPro, config?: T) => IPlugin<T>;

/** 对象类插件，自带初始化函数 */
export interface DictionaryPlugin<T extends object = any> extends IPlugin<T> {
	/**
	 * 初始化函数
	 * @param cjp 编辑器实例
	 * @param config 插件配置选项
	 */
	init: (cjp: CodeJarPro, config?: T) => void;
}

export type Plugin<T extends object = any> = FunctionPlugin<T> | DictionaryPlugin<T>;
