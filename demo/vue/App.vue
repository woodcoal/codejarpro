<!--
author:        木炭 <woodcoal@qq.com>
date:          2025-09-08 09:36:23
component:     App
Copyright © 木炭 (WOODCOAL) All rights reserved
-->

<template>
	<main>
		<div class="dl-code-header">
			<span>{{ xCode?.status.language }}</span>
			<select :value="xCode?.status.language" @change="xCode?.changeLanguage(($event.target as any).value)">
				<option value="markup">HTML</option>
				<option value="markdown">Markdown</option>
				<option value="javascript">JavaScript</option>
				<option value="typescript">TypeScript</option>
				<option value="json">JSON</option>
				<option value="css">CSS</option>
				<option value="basic">Basic</option>
				<option value="vbnet">VB.NET</option>
				<option value="csharp">C#</option>
				<option value="sql">SQL</option>
				<option value="python">Python</option>
			</select>
			<select :value="xCode?.status.theme" @change="xCode?.changeTheme(($event.target as any).value)">
				<option value="default">默认</option>
				<option value="dark">暗黑</option>
				<option value="light">明亮</option>
				<option value="auto">自动</option>
				<option value="custom">自定义</option>
			</select>

			<label>
				<input
					type="checkbox"
					:checked="xCode?.status.lineNumbers"
					@change="xCode?.changeLineNumbers(($event.target as any).checked)"
				/>
				<i>显示行号</i>
			</label>

			<label>
				<input
					type="checkbox"
					:checked="xCode?.status.wrap"
					@change="xCode?.changeWrap(($event.target as any).checked)"
				/>
				<i>自动换行</i>
			</label>

			<label>
				<input
					type="checkbox"
					:checked="xCode?.status.readonly"
					@change="xCode?.changeReadonly(($event.target as any).checked)"
				/>
				<i>只读</i>
			</label>

			<label>
				<input type="checkbox" checked disabled />
				<i>Json 校验</i>
			</label>
		</div>

		<Code
			:value="json"
			@change="onChange"
			@init="onInit"
			:readonly="false"
			:lineNumbers="true"
			language="json"
			ref="xCode"
		/>

		<p style="margin-top: 50px">只读展示模式，自动换行、显示行号</p>
		<Code
			:value="json"
			:readonly="true"
			:lineNumbers="true"
			:language="xCode?.status.language"
			:theme="xCode?.status.theme"
		/>
	</main>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { Code } from './src';

import type { CodeJarProInstance } from 'codejarpro';
import { JsonValidate } from 'codejarpro/plugins';

const xCode = ref<typeof Code>();

const data = {
	name: '张三',
	age: 18,
	sex: '男',
	email: 'san@zhang.com',
	phone: '13800000000'
};

const json = ref(JSON.stringify(data, null, '\t'));

const onInit = (_: string, CJP: CodeJarProInstance) => {
	CJP.addPlugin(JsonValidate, {
		enabled: () => {
			return xCode.value!.status.language === 'json';
		}
	});
};

const onChange = (code: string) => {
	json.value = code;
};
</script>
<style lang="less">
.dl-code-wrapper {
	border-radius: 6px;
	box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2);
	font-size: 14px;
	font-weight: 400;
	// width: 100%;
	max-height: 480px;
	letter-spacing: normal;
	line-height: 25px;
	// padding: 10px;
	tab-size: 4;
}

.dl-code-header {
	display: flex;
	align-items: center;
	gap: 10px;
}

main {
	padding: 20px;
	margin: 0 auto;
	max-width: 1200px;
}
</style>
