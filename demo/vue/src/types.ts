/**
 * @author        木炭 <woodcoal@qq.com>
 * @date          2025-09-01 01:02:16
 * Copyright © 木炭 (WOODCOAL) All rights reserved
 */

import type { CodeJarProInstance, Options } from 'codejarpro';

/** 主题枚举 */
export type ThemeEnums = 'default' | 'dark' | 'light' | 'auto' | 'custom';

/** 属性 */
export interface ICode {
	/** 代码内容 */
	value?: string;

	/** 代码内容，同 value */
	modelValue?: string;

	/** 主题 */
	theme?: ThemeEnums;

	/** 代码语言 */
	language?: string;

	/** 代码行数 */
	lineNumbers?: boolean;

	/** 代码只读 */
	readonly?: boolean;

	/** 自动换行 */
	wrap?: boolean;

	/** CodeJarPro 选项，参考：https://github.com/woodcoal/codejarpro?tab=readme-ov-file#core-api-details */
	options?: Partial<Options>;

	/**
	 * 初始化操作
	 * @param code 代码内容
	 * @param editor CodeJarPro 实例
	 * @param editorElement 代码容器
	 */
	onInit?: (code: string, editor: CodeJarProInstance, editorElement: HTMLElement) => void;

	/**
	 * 代码更新操作
	 * @param value 代码内容
	 * @param editor CodeJarPro 实例
	 */
	onChange?: (value: string, editor: CodeJarProInstance) => void;

	/**
	 * 代码格式化之前操作
	 * @param code 代码内容
	 * @returns 格式化后的代码内容
	 */
	onBeforeFormat?: (code: string) => string;

	/**
	 * 代码格式化之后操作。
	 * @param code 代码内容
	 * @param target 代码容器
	 */
	onAfterFormat?: (code: string, target: HTMLElement) => void;
}
