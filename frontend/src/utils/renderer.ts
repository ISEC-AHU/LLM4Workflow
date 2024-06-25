/*
 * @Author: dwlinnn
 * @Date: 2024-05-07 12:49:56
 * @LastEditors: error: git config user.name & please set dead value or install git
 * @LastEditTime: 2024-05-31 22:05:29
 * @FilePath: \workflow-frontend\src\utils\renderer.ts
 * @Description:
 */

import 'highlight.js/styles/atom-one-light.css';

import { Renderer } from 'marked';
import hljs from 'highlight.js';

const renderer = new Renderer();

renderer.paragraph = (text) => {
  return `<p>${text}</p>`;
};

renderer.list = (text) => {
  return `${text}\n\n`;
};

renderer.listitem = (text) => {
  return `\n• ${text}`;
};

renderer.code = (code, language) => {
  const validLanguage = hljs.getLanguage(language || '')
    ? language
    : 'plaintext';

  const highlightedCode = hljs.highlight(code, {
    language: validLanguage || 'plaintext',
  }).value;

  const uniqueId = `code-${Math.random().toString(36).substr(2, 9)}`;

  return `<pre class="highlight bg-gray-700 rounded-md border-[0.5px] highlight overflow-x-auto overflow-y-auto h-[400px]"><div class="bg-gray-600 flex items-center relative px-4 py-2 text-xs font-sans justify-between rounded-t-md text-gray-200">${
    language && `<span>${validLanguage}</span>`
  }<div class="flex items-center"><button class="flex gap-1 items-center copy-code-btn" data-target="${uniqueId}">Copy code</button></div></div><div class="p-4 overflow-y-auto"><code id="${uniqueId}" class="hljs-${validLanguage}" style="color: #d6e2ef; font-size: 16px;">${highlightedCode}</code></div></div></pre>`;
};

export default renderer;
