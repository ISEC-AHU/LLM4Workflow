/*
 * @Author: dwlinnn
 * @Date: 2024-05-07 12:49:56
 * @LastEditors: dwlinnn
 * @LastEditTime: 2024-05-21 15:39:11
 * @FilePath: \workflow-frontend\src\hooks\useChatLog.ts
 * @Description:
 */

import { Runnable } from '@langchain/core/runnables';
import { applyPatch } from '@langchain/core/utils/json_patch';
import { marked } from 'marked';
import renderer from '@/utils/renderer';
import { useState } from 'react';

export type Message = {
  id: string;
  createdAt?: Date;
  content: string;
  role: 'system' | 'user' | 'assistant' | 'function';
  runId?: string;
};

export const useChatLog = (runnable: Runnable, session_id: string) => {
  const [messages, setMessages] = useState<Array<Message>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleMessageSubmit = async (message: string) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { id: Math.random().toString(), content: message, role: 'user' },
    ]);
    setIsLoading(true);

    // const log = {
    //   ops: [
    //     {
    //       op: "add",
    //       path: "/logs/RunnableSequence/final_output",
    //       value: {
    //         output:
    //           "<final answer>Task Extraction: 1. Invoke a genomics data web service to access and query a remote genomics database. 2. Pass the name of the sequence (gene accession number) to the web service. 3. Retrieve the gene sequence returned by the web service. 4. Display the gene sequence in XML format (default format). 5. Extract a sequence of elements from the XML. 6. Generate an HTML document suitable for web display. 7. Display any errors returned by the remote server. Task Set: {1, 2, 3, 4, 5, 6, 7} Task Relationships: {2 -> 1, 2 -> 3, 3 -> 4, 3 -> 5, 3 -> 6, 1 -> 7}</final answer>",
    //       },
    //     },
    //     {
    //       op: "add",
    //       path: "/logs/RunnableSequence/end_time",
    //       value: "2024-04-26T02:55:37.388+00:00",
    //     },
    //   ],
    // };
    let accumulatedMessage = '';
    let runId: string | undefined = undefined;
    let messageIndex: number | null = null;
    try {
      let streamedResponse: Record<string, any> = {};
      const streamLog = await runnable.streamLog(
        { input: message },
        { configurable: { session_id } }
      );
      for await (const chunk of streamLog) {
        streamedResponse = applyPatch(streamedResponse, chunk.ops).newDocument;

        if (streamedResponse.id !== undefined) {
          runId = streamedResponse.id;
        }
        if (Array.isArray(streamedResponse?.streamed_output)) {
          accumulatedMessage = streamedResponse.streamed_output.join('');
        }
        const parsedResult = marked(accumulatedMessage, { renderer });
        setMessages((prevMessages) => {
          let newMessages = [...prevMessages];
          if (
            messageIndex === null ||
            newMessages[messageIndex] === undefined
          ) {
            messageIndex = newMessages.length;
            newMessages.push({
              id: Math.random().toString(),
              content: parsedResult.trim(),
              runId: runId,
              role: 'assistant',
            });
          } else if (newMessages[messageIndex] !== undefined) {
            newMessages[messageIndex].content = parsedResult.trim();
            newMessages[messageIndex].runId = runId;
          }
          return newMessages;
        });
      }
      setIsLoading(false);
    } catch (e) {
      setMessages((prevMessages) => prevMessages.slice(0, -1));
      setIsLoading(false);
      throw e;
    }
  };

  return { isLoading, messages, handleMessageSubmit };
};
