/*
 * @Author: dwlinnn
 * @Date: 2024-05-21 15:38:36
 * @LastEditors: dwlinnn
 * @LastEditTime: 2024-05-22 09:52:03
 * @FilePath: \workflow-frontend\src\view\components\MarkdownRender.tsx
 * @Description:
 */

import { marked } from 'marked';
import renderer from '@/utils/renderer';
import { useEffect } from 'react';

const MarkdownRenderer = ({ markdown }) => {
  useEffect(() => {
    const buttons = document.querySelectorAll('.copy-code-btn');
    if (!buttons.length) return;
    buttons.forEach((button) => {
      button.removeEventListener('click', handleCopy);
      button.addEventListener('click', handleCopy);
    });

    return () => {
      buttons.forEach((button) => {
        button.removeEventListener('click', handleCopy);
      });
    };
  });

  const handleCopy = (event: Event) => {
    const button = event.currentTarget as HTMLElement;
    const targetId = button.getAttribute('data-target');
    if (targetId) {
      const codeBlock = document.getElementById(targetId)?.innerText;
      if (codeBlock) {
        navigator.clipboard
          .writeText(codeBlock)
          .then(() => {})
          .catch((err) => {});
      }
    }
  };

  return (
    <div
      dangerouslySetInnerHTML={{ __html: marked(markdown, { renderer }) }}
    ></div>
  );
};

export default MarkdownRenderer;
