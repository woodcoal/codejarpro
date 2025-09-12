<!--
author:        木炭 <woodcoal@qq.com>
date:          2025-09-01 01:13:55
component:     index
Copyright © 木炭 (WOODCOAL) All rights reserved
-->

<template>
	<div class="dl-code" :class="[THEME && `theme-${THEME}`]">
		<span v-if="ErrorMessage">{{ ErrorMessage }}</span>
		<pre ref="xEditor" class="dl-code-wrapper"></pre>
	</div>
</template>

<script lang="ts" setup>
import type { ICode as IProps, ThemeEnums } from './types';
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue';

// import { CodeJarPro, type CodeJarProInstance } from 'codejarpro';
// import { LineNumbers, InsertMark, type LineNumbersPlugin, type InsertMarkPlugin } from 'codejarpro/plugins';
import { CodeJarPro, type CodeJarProInstance } from '../../../src';
import { LineNumbers, InsertMark, type LineNumbersPlugin, type InsertMarkPlugin } from '../../../src/plugins';

import Prism from 'prismjs';

// 主题
import './index.less';

// 语言高亮模块
import 'prismjs/components/prism-markup'; // HTML, XML, etc.
import 'prismjs/components/prism-markdown'; // markdown
import 'prismjs/components/prism-javascript'; // javascript
import 'prismjs/components/prism-typescript'; // typescript
import 'prismjs/components/prism-json'; // json
import 'prismjs/components/prism-css'; // css
import 'prismjs/components/prism-basic'; // basic
import 'prismjs/components/prism-vbnet'; // vb.net
import 'prismjs/components/prism-csharp'; // c#
import 'prismjs/components/prism-sql'; // sql
import 'prismjs/components/prism-python'; // python
import { isFn, isObj } from 'codejarpro';

// 行号
// import 'prismjs/plugins/line-numbers/prism-line-numbers';
// import 'prismjs/plugins/line-numbers/prism-line-numbers.css';

const props = withDefaults(defineProps<IProps>(), {
	readonly: false,
	theme: 'default',
	lineNumbers: true,
	wrap: true,
	language: 'markup',
	options: () => ({})
});

const emits = defineEmits<{
	init: [code: string, editor: CodeJarProInstance, editorElement: HTMLElement];
	change: [code: string, editor: CodeJarProInstance];
	'update:value': [code: string];
	'update:modelValue': [code: string];
}>();

/** 代码编辑实例 */
let CJP: CodeJarProInstance;
let CJP_LINE_NUMBERS: LineNumbersPlugin | undefined;
let CJP_MARK: InsertMarkPlugin | undefined;

/* ******** ******** 基础状态 ******** ******** */

/** 代码 */
const CODE = ref(props.value || props.modelValue || '');

/** 换行 */
const WRAP = ref(props.wrap);

/** 主题 */
const THEME = ref(props.theme);

/** 语言 */
const LANGUAGE = ref(props.language);

/** 只读 */
const READONLY = ref(props.readonly);

/** 行号 */
const LINE_NUMBERS = ref(props.lineNumbers);

/** 错误提示 */
const ErrorMessage = ref('');

/** 值监控 */
watch([() => props.value, () => props.modelValue], (n, o) => {
	const nValue = n[0] || n[1] || '';
	const oValue = o[0] || o[1] || '';
	if (nValue !== oValue && nValue !== CODE.value) {
		CODE.value = nValue;

		// 高亮操作
		if (!props.readonly || !CJP) return;
		CJP.updateCode(CODE.value);

		// Prism.highlightAll();
	}
});

/** 状态监控 */
watch(
	[() => props.theme, () => props.language, () => props.readonly, () => props.lineNumbers, () => props.wrap],
	(n, o) => {
		if (n[0] !== o[0]) changeTheme(n[0]);
		if (n[1] !== o[1]) changeLanguage(n[1]);
		if (n[2] !== o[2]) changeReadonly(n[2]);
		if (n[3] !== o[3]) changeLineNumbers(n[3]);
		if (n[4] !== o[4]) changeWrap(n[4]);
	}
);

/** 调整语言 */
const changeLanguage = async (language: string) => {
	if (language !== LANGUAGE.value && xEditor.value) {
		LANGUAGE.value = language || 'markup';
		CJP.refresh();
	}
};

/** 调整主题 */
const changeTheme = (theme: ThemeEnums) => {
	if (theme !== THEME.value) {
		THEME.value = theme || 'default';
		CJP.refresh();
	}
};

/** 调整自动换行 */
const changeWrap = (wrap: boolean) => {
	if (wrap !== WRAP.value) {
		WRAP.value = wrap;

		// 编辑模式需要提交参数调整
		CJP.updateOptions({
			wrap: WRAP.value
		});
		CJP.refresh();
	}
};

/** 调整行号 */
const changeLineNumbers = async (lineNumbers: boolean) => {
	if (lineNumbers !== LINE_NUMBERS.value) {
		LINE_NUMBERS.value = lineNumbers;

		CJP_LINE_NUMBERS?.updateConfig({
			show: LINE_NUMBERS.value
		});
	}
};

/** 调整只读 */
const changeReadonly = async (readonly: boolean) => {
	if (readonly !== READONLY.value && xEditor.value) {
		READONLY.value = readonly;

		CJP?.updateOptions({
			readonly: READONLY.value
		});
	}
};

/* ******** ******** 编辑器 ******** ******** */

/** 代码高亮格式化 */
const editorCode = (e?: HTMLElement, code?: string) => {
	!e && (e = xEditor.value);
	if (!window || !e) return;

	code = code || e.textContent || '';

	// 格式化函数
	props.onBeforeFormat && isFn(props.onBeforeFormat) && (code = props.onBeforeFormat(code) || code);

	// 格式化
	const codeEl = document.createElement('code');
	codeEl.className = `language-${LANGUAGE.value}`;
	codeEl.textContent = code;
	// e.innerHTML = `<code class="language-${LANGUAGE.value}">${code}</code>`;

	// 清理旧内容
	e.innerHTML = '';
	e.appendChild(codeEl);

	// 处理 code 代码并高亮
	Prism.highlightElement(codeEl);

	// 格式化之后操作
	props.onAfterFormat && isFn(props.onAfterFormat) && props.onAfterFormat(code, e);
};

/** 编辑器 */
const xEditor = ref<HTMLElement>();

/** 初始化操作 */
const init = () => {
	if (!xEditor.value) return;

	// 初始化编辑器时不指定代码高亮算法，只能手工处理，否则无法正常防抖。
	CJP = CodeJarPro(xEditor.value, (e) => editorCode(e), {
		...props.options,
		wrap: WRAP.value,
		readonly: READONLY.value
	});

	// 行号插件
	CJP_LINE_NUMBERS = CJP.addPlugin(LineNumbers, {
		show: LINE_NUMBERS.value
	});

	// 标记插件
	CJP_MARK = CJP.addPlugin(InsertMark);

	// 初始化完成
	emits('init', CODE.value, CJP, xEditor.value);

	// 初始赋值
	CJP.updateCode(CODE.value);

	// 代码改变时更新操作
	CJP.onUpdate((code: string) => {
		// 代码改变则提交一次更新
		if (code !== CODE.value) {
			ErrorMessage.value = '';

			// 校验
			if (isFn(props.onValidate)) {
				const res = props.onValidate(code, LANGUAGE.value);

				console.log(res);
				// 定位
				if (isObj(res)) {
					ErrorMessage.value = res.message || '当前代码存在异常，请检查。';

					CJP_MARK?.addMarker({
						...res,
						markerId: 'error',
						markerStyle:
							'background-color: rgba(255, 215, 0, 0.3); padding: 0px 5px; border-radius: 2px; text-decoration: underline 2px wavy red; text-underline-offset: 3px;background-color: rgba(255, 215, 0, 0.3); padding: 0px 5px; border-radius: 2px; text-decoration: underline 2px wavy red; text-underline-offset: 3px;'
					});
					return;
				}

				if (res !== true) {
					ErrorMessage.value = res || '当前代码存在异常，请检查。';
					return;
				}
			}

			CODE.value = code;

			emits('change', code, CJP);
			emits('update:value', code);
			emits('update:modelValue', code);
		}
	});
};

/** 销毁编辑器 */
const destroy = () => {
	if (!xEditor.value) return;

	// 销毁编辑器内的内容
	xEditor.value.innerHTML = '';

	// 移除全部属性
	const attrs = xEditor.value.attributes;
	for (let i = attrs.length - 1; i >= 0; i--) {
		xEditor.value.removeAttribute(attrs[i].name);
	}

	// 只读模式销毁编辑器，否则重建
	CJP?.destroy();
};

onMounted(init);
onBeforeUnmount(destroy);

defineExpose({
	changeLanguage,
	changeTheme,
	changeReadonly,
	changeLineNumbers,
	changeWrap,
	status: computed(() => ({
		language: LANGUAGE.value,
		theme: THEME.value,
		readonly: READONLY.value,
		lineNumbers: LINE_NUMBERS.value,
		wrap: WRAP.value
	}))
});
</script>

<style lang="less">
.dl-code {
	--at-apply: full overflow-y-auto;
	tab-size: 4;
	-moz-tab-size: 4;

	&.is-wrap {
		.is-readonly {
			code {
				white-space: pre-wrap !important;
				word-break: break-all !important;
				overflow-wrap: break-word !important;
			}
		}
	}

	pre[class*='language-'] {
		--at-apply: m-0;

		&.line-numbers {
			padding-left: 3.8em !important;
		}

		/** 代码默认字体 */
		code {
			font-family: Cascadia Code, Monaco, Liberation Mono !important;
		}
	}
}
</style>
