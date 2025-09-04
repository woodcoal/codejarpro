/**
 * @author        木炭 <woodcoal@qq.com>
 * @date          2025-09-01 07:49:58
 * Copyright © 木炭 (WOODCOAL) All rights reserved
 */

/**
 * 检查是否为函数
 * @param fn 要检查的变量
 * @returns 如果是函数则返回 true，否则返回 false
 */
export const isFn = (fn: any): fn is Function => fn && typeof fn === 'function';

/**
 * 检查是否为对象
 * @param obj 要检查的变量
 * @returns 如果是对象则返回 true，否则返回 false
 */
export const isObj = (obj: any): obj is object => obj && typeof obj === 'object';

/**
 * 防抖函数
 * @param cb 要执行的回调函数
 * @param wait 延迟时间（毫秒）
 */
export function debounce(cb: any, wait: number) {
	let timeout = 0;
	return (...args: any) => {
		clearTimeout(timeout);
		timeout = window.setTimeout(() => cb(...args), wait);
	};
}

/**
 * 遍历一个元素下的所有子孙节点
 * @param editor 要遍历的根元素
 * @param visitor 访问者函数，对每个节点执行。如果返回 'stop'，则停止遍历。
 */
export function visit(editor: HTMLElement, visitor: (el: Node) => 'stop' | undefined) {
	const queue: Node[] = []; // 使用队列实现深度优先遍历
	if (editor.firstChild) queue.push(editor.firstChild);
	let el = queue.pop();
	while (el) {
		if (visitor(el) === 'stop') break;
		// 注意这里的顺序，先 nextSibling 后 firstChild，实现深度优先
		if (el.nextSibling) queue.push(el.nextSibling);
		if (el.firstChild) queue.push(el.firstChild);
		el = queue.pop();
	}
}
