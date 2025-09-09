/**
 * @author        木炭 <woodcoal@qq.com>
 * @date          2025-09-07 05:51:36
 * Copyright © 木炭 (WOODCOAL) All rights reserved
 */

import { createPlugin, isFn, isObj, parseErrorPosition } from '../libs';
import type { ActionName, CodeJarProInstance } from '../types';
import { insertMarkerNode, rowColToIndex } from './insertMark';

/** 配置 */
export type PluginOptions = {
	/** 是否启用(默认：false) */
	enabled: boolean | ((code: string) => boolean);

	/** 是否忽略空值 */
	ignoreEmpty?: boolean;

	/** 错误提示类名 */
	markerClass?: string;

	/** 错误提示样式 */
	markerStyle?: string;

	/** 存在错误回调操作 */
	onError?: (
		error: Error | false,
		code: string,
		pos?: { line?: number; column?: number; index: number }
	) => void;
};

/** 默认错误标记效果 */
const defaultStyle = `
background-color: rgba(255, 215, 0, 0.3); padding: 0 5px; border-radius: 2px;
text-decoration: wavy underline red; text-underline-offset: 3px; text-decoration-thickness: 2px;
`;

/**
 * 自定义标签
 * @param editor 编辑器实例
 * @param show 是否显示行号
 */
function create(cjp: CodeJarProInstance, config?: PluginOptions) {
	const { editor } = cjp;

	config = {
		enabled: false,
		ignoreEmpty: true,
		...config
	};

	const validate = (code: string) => {
		// 忽略空值
		if (config.ignoreEmpty && !code.trim()) return;

		// 检查是否允许操作
		const enabled = isFn(config.enabled) ? config.enabled(code) : config.enabled;
		if (!enabled) return;

		try {
			JSON.parse(code);

			// 存在错误回调操作
			isFn(config.onError) && config.onError(false, code);
		} catch (e: any) {
			// 校验失败，找出错误位置
			const err = parseErrorPosition(e.message, code);
			cjp.warn('JSON 格式错误', e.message, err);

			const pos = cjp.save();

			// 获取错误位置
			let index = rowColToIndex(code, err.line || 0, err.column || 0);

			// 插入标记
			insertMarkerNode({
				markerId: 'cjp_json_validate',
				editor,
				start: index,
				class: config.markerClass || 'codeError',
				style: config.markerStyle || defaultStyle,
				message: e.message
			});

			cjp.restore(pos);

			// 存在错误回调操作
			isFn(config.onError) &&
				config.onError(e, code, {
					...err,
					index: index
				});

			return true;
		}
	};

	/** 返回插件 */
	return {
		name: 'JsonValidate',
		onAction: (params: { name: ActionName; code: string; event?: Event }) => {
			const { name, code } = params;

			// 仅在更新前执行
			if (name === 'beforeUpdate') return validate(code);
		},
		updateConfig: (opts: PluginOptions) => {
			if (!isObj(opts)) return;
			(isFn(opts.enabled) || opts.enabled === true || opts.enabled === false) &&
				(config.enabled = opts.enabled);
			opts.ignoreEmpty !== undefined && (config.ignoreEmpty = !!opts.ignoreEmpty);
			opts.markerClass && (config.markerClass = opts.markerClass);
			opts.markerStyle && (config.markerStyle = opts.markerStyle);
		},
		validate
	};
}

export const JsonValidate = createPlugin(create);
export default JsonValidate;

/** 插件类型 */
export type JsonValidatePlugin = ReturnType<typeof JsonValidate>;
