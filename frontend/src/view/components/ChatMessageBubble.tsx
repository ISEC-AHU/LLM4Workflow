/*
 * @Author: dwlinnn
 * @Date: 2024-05-07 12:49:56
 * @LastEditors: dwlinnn
 * @LastEditTime: 2024-05-21 15:39:04
 * @FilePath: \workflow-frontend\src\view\components\ChatMessageBubble.tsx
 * @Description: 
 */
import { Message } from "@/hooks/useChatLog";
import DOMPurify from "dompurify";
import "./index.css";

const createAnswerElements = (content: string) => {
  const matches = Array.from(content.matchAll(/\[\^?\$?{?(\d+)}?\^?\]/g));
  const elements: JSX.Element[] = [];
  let prevIndex = 0;
  matches.forEach((match) => {
    if (match.index !== null) {
      elements.push(
        <div
          className="prose w-full break-words"
          key={`content:${prevIndex}`}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(content.slice(prevIndex, match.index)),
          }}
        ></div>
      );
      prevIndex = (match?.index ?? 0) + match[0].length;
    }
  });
  elements.push(
    <div
      className="prose w-full break-words"
      key={`content:${prevIndex}`}
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(content.slice(prevIndex)),
      }}
    ></div>
  );
  return elements;
};

export function ChatMessageBubble(props: {
  message: Message;
  aiEmoji?: string;
  isMostRecent: boolean;
  messageCompleted: boolean;
}) {
  const { role, content } = props.message;
  const isUser = role === "user";

  const answerElements =
    role === "assistant" ? createAnswerElements(content) : [];

  return (
    <div className="py-2 flex flex-row-reverse">
      {isUser ? (
        <div className="p-4 w-2/3 bg-indigo-400 text-white rounded-md rounded-tr-none">
          {content}
        </div>
      ) : (
        <div className="flex w-full">
          <span className="bg-gray-400 mr-2 prompt-card-user rounded-md font-bold">
            Bot
          </span>
          <div className="p-4 w-full bg-white rounded-md rounded-tl-none">
            {answerElements}
          </div>
        </div>
      )}
    </div>
  );
}
