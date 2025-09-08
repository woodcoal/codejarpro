/**
 * @author        木炭 <woodcoal@qq.com>
 * @date          2025-09-08 09:36:23
 * Copyright © 木炭 (WOODCOAL) All rights reserved
 */
import { defineConfig } from 'vite';

/** vue */
import Vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
	server: {
		port: 8000 //启动端口
	},

	plugins: [Vue()]
});
