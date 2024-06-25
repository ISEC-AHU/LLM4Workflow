/*
 * @Author: Weilin Du
 * @Date: 2024-05-07 12:49:56
 * @LastEditors: Weilin Du
 * @LastEditTime: 2024-06-18 15:24:50
 * @FilePath: \workflow-frontend\src\view\components\chatPanel\index.tsx
 * @Description:
 */

import { Button } from 'antd';
import { ChatMessageBubble } from '../ChatMessageBubble';
import { Runnable } from '@langchain/core/runnables';
import TextArea from 'antd/es/input/TextArea';
import { useChatLog } from '@/hooks/useChatLog';
import { useState } from 'react';

function ChatPanel(props: {
  runnable: Runnable;
  session_id: string;
  placeholder: string;
}) {
  const { runnable, session_id, placeholder } = props;
  const [inputValue, setInputValue] = useState('');
  const { isLoading, messages, handleMessageSubmit } = useChatLog(
    runnable,
    session_id
  );

  const handleSubmit = () => {
    try {
      if (isLoading) return;
      if (inputValue === '') return;
      handleMessageSubmit(inputValue);
      setInputValue('');
    } catch (e) {
      setInputValue(inputValue);
    }
  };

  return (
    <div
      className="p-6 bg-gray-200 rounded-sm"
      style={{
        width: 1000,
      }}
    >
      {!!messages.length ? (
        <div
          className="rounded-md p-4 mb-6 h-[200px] max-h-[200px] overflow-y-auto"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgb(231 229 228) #f0f0f0',
          }}
        >
          {messages.map((m, index) => (
            <ChatMessageBubble
              key={m.id}
              message={{ ...m }}
              isMostRecent={index === 0}
              messageCompleted={!isLoading}
            />
          ))}
        </div>
      ) : (
        <div className="pb-4 text-center">{placeholder}</div>
      )}

      <div className="flex items-center">
        <TextArea
          placeholder="Send Message..."
          autoSize={{ minRows: 1, maxRows: 6 }}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          // onPressEnter={handleSubmit}
          disabled={isLoading}
        />

        <Button
          className="ml-4"
          type="primary"
          size="large"
          loading={isLoading}
          onClick={handleSubmit}
        >
          Send
        </Button>
      </div>
    </div>
  );
}

export default ChatPanel;
