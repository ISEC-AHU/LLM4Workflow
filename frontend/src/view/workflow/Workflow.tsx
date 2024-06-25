/*
 * @Author: dwlinnn
 * @Date: 2024-05-07 12:49:56
 * @LastEditors: Weilin Du
 * @LastEditTime: 2024-06-20 11:51:14
 * @FilePath: \workflow-frontend\src\view\workflow\Workflow.tsx
 * @Description:
 */

import { Button, Input } from 'antd';
import { FC, useEffect, useState } from 'react';
import RewriteQuery, { SetValueParams } from './RewriteQuery';
import {
  addWorkflow,
  create_game_chain,
  getPromptInfo,
  getWorkflowInfoById,
  updateWorkflow,
  write_dag_chain,
  write_xml_chain,
} from '@/api/api';
import { useNavigate, useParams } from 'react-router-dom';

import { EventEmitter } from 'ahooks/lib/useEventEmitter';
import FlowChart from '../components/FlowGraph/FlowChart';
import MarkdownRenderer from '../components/MarkdownRender';
import RetrieveApi from './Retrieve';
import { useRequest } from 'ahooks';
import { v4 as uuidv4 } from 'uuid';

const Workflow: FC<{ refresh$: EventEmitter<void> }> = function (props) {
  const { workflowId } = useParams();
  const navigate = useNavigate();
  const [text, setText] = useState('workflow: ');
  // 'workflow:The web service workflow passes the gene sequence name(i.e., the gene accession number) to invoke a genomics data web service. If the call is successful, the results will be displayed in three different ways: one is to display the gene sequence in XML format (the default return format of the service), another is to display the sequence of elements extracted from XML, and the last one is to display an HTML document converted from XML. If the call fails, the error message returned by the service will be displayed.'

  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [loading5, setLoading5] = useState(false);
  const [loading6, setLoading6] = useState(false);
  // const [isCollapsed, setIsCollapsed] = useState(true);

  const { data: promptData, mutate } = useRequest(getPromptInfo, {
    onSuccess: (res) => {
      if (res.code === 200) {
        mutate((oldData) => {
          return {
            ...oldData,
            data: Object.fromEntries(
              Object.entries(oldData.data).map(([key, value]) => [
                key,
                value.replace(/\{\{/g, '{').replace(/\}\}/g, '}'),
              ])
            ),
          };
        });
      }
    },
  });

  const {
    refresh,
    run,
    data: workflowInfo,
  } = useRequest(getWorkflowInfoById, {
    defaultParams: [workflowId as string],
    manual: true,
    onSuccess: (res) => {
      if (res.code === 200) {
        setText(res.data?.describe || 'workflow:');
      }
    },
  });

  useEffect(() => {
    if (workflowId) {
      run(workflowId);
    }
  }, [workflowId, run]);

  const { run: update } = useRequest(updateWorkflow, {
    defaultParams: [{ id: workflowId as string }],
    manual: true,
    onSuccess: () => refresh(),
  });

  /**
   * @description: create a new workflow and refresh the workflow list
   * @return {*}
   */
  const handleStep1 = async () => {
    try {
      const session_id = uuidv4().toString();
      const { code, data } = await addWorkflow(session_id);
      if (code === 200) {
        navigate(`/workflow/${data.id}`);
        props.refresh$.emit();
        await createGame(session_id);
      }
    } catch (e) {
      console.log('addWorkflow error:', e);
    }
  };

  const createGame = async (session_id: string) => {
    try {
      setLoading1(true);
      await create_game_chain.invoke(
        { input: '' },
        { configurable: { session_id } }
      );
      refresh();
    } catch (e) {
      console.log('createGame error:', e);
    } finally {
      setLoading1(false);
    }
  };

  const handleStep2 = async () => {
    try {
      setLoading2(true);
      const res = await create_game_chain.invoke(
        { input: text },
        { configurable: { session_id: workflowInfo?.data.session_id } }
      );
      setLoading2(false);
      update({
        id: workflowId as string,
        describe: text,
        extracted_task: res as string,
      });
    } catch (e) {
      setLoading2(false);
      console.log('extractTask error:', e);
    }
  };

  const handleStep3 = async ({
    extracted_task,
    rewrite_queries,
  }: SetValueParams) => {
    try {
      update({
        id: workflowId as string,
        extracted_task,
        rewrite_queries,
      });
    } catch (e) {
      console.log('rewrite query error:', e);
    }
  };

  const handleWriteDag = async () => {
    try {
      setLoading5(true);
      const res = await write_dag_chain.invoke(
        {
          text: workflowInfo?.data?.describe,
          task_list: workflowInfo?.data.extracted_task,
          api_list: JSON.stringify(
            workflowInfo?.data.api_list
              ?.filter((item) => item.status == 1)
              .map((item) => ({
                ...item.doc,
              }))
          ),
        },
        { configurable: { session_id: workflowInfo?.data.session_id } }
      );
      update({
        id: workflowId as string,
        dag: res as string,
      });
      setLoading5(false);
    } catch (e) {
      setLoading5(false);
      console.log('writeDag error:', e);
    }
  };

  const handleWriteXML = async () => {
    try {
      setLoading6(true);
      const res = await write_xml_chain.invoke({
        dag: workflowInfo?.data?.dag,
      });
      update({
        id: workflowId as string,
        xml: res as string,
      });
      setLoading6(false);
    } catch (e) {
      setLoading6(false);
      console.log('WriteXML error:', e);
    }
  };

  return (
    <div className="workflow">
      {/* Step 1: Create Game */}
      <div className="my-4">
        <p className="text-xl py-2">Step 1. Create Game</p>
        <div className="bg-gray-100 mb-4 p-4">
          <div className="flex">
            <span className="bg-gray-400 mr-2 prompt-card-user rounded-full font-bold">
              You
            </span>
            <div className="w-full break-word">
              {promptData?.data?.['create_game_prompt']
                .split('\n')
                .map((line, index) => (
                  <div className="mb-2" key={index}>
                    {line}
                  </div>
                ))}
            </div>
          </div>

          <div className="mt-4 flex">
            <span className="bg-gray-400 mr-2 prompt-card-user rounded-md font-bold">
              Bot
            </span>
            <div className="p-2">{workflowInfo && !loading1 ? 'OK' : ''}</div>
          </div>
        </div>
        <Button
          className="font-bold"
          type="primary"
          size="large"
          loading={loading1}
          onClick={handleStep1}
        >
          Prompt
        </Button>
      </div>
      {/* Step 2: Task Extraction */}
      <div className="my-4">
        <p className="text-xl py-2">Step 2. Task Extraction</p>
        <div className="bg-gray-100 mb-4 p-4 flex flex-wrap justify-center">
          <div className="flex w-full">
            <span className="bg-gray-400 mr-2 prompt-card-user rounded-full font-bold">
              You
            </span>
            <Input.TextArea
              styles={{
                textarea: {
                  fontSize: 16,
                },
              }}
              value={text}
              autoSize={{ minRows: 3, maxRows: 6 }}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          {/* TODO: Generate three candidate answers by setting different temperatures */}
          {/* <div className="w-full grid grid-cols-3 gap-4">
              <div className="">1</div>
              <div className="">2</div>
              <div className="">3</div>
            </div> */}

          <div className="mt-4 flex w-full">
            <span className="bg-gray-400 mr-2 prompt-card-user rounded-md font-bold">
              Bot
            </span>
            <div className="p-2 w-full break-word">
              {workflowInfo?.data?.extracted_task
                ?.split('\n')
                ?.map((line, index) => (
                  <div className="mb-2" key={index}>
                    {line}
                  </div>
                ))}
            </div>
          </div>
          {/* This chat panel is used to modify the information extraction in Step 1 using dialog for interaction */}

          {/* <div
            className="py-1 w-full cursor-pointer flex items-center justify-center"
            onClick={() => setIsCollapsed((prevState) => !prevState)}
          >
            <DownOutlined
              className={`transition-all duration-200 transform ${
                isCollapsed ? '' : 'rotate-180'
              }`}
            />
          </div>
          <div
            className={`${
              isCollapsed
                ? 'max-h-0 opacity-0'
                : 'max-h-[600px] opacity-100 my-4'
            }  overflow-hidden transition-all duration-200 ease-in-out`}
          >
            <ChatPanel
              placeholder={
                'Modify Extracted Information in Conversation with Chatbot'
              }
              runnable={modify_extraction_chain}
              // session_id={session_id}
            />
          </div> */}
        </div>

        <Button
          className="font-bold"
          type="primary"
          size="large"
          loading={loading2}
          onClick={handleStep2}
        >
          Prompt
        </Button>
      </div>
      {/* Step 3: Rewrite Task */}
      <RewriteQuery
        prompt={promptData?.data?.['rewrite_query_prompt']}
        setValue={handleStep3}
      />
      {/* Retrieve task apis */}
      <RetrieveApi
        query_list={workflowInfo?.data?.rewrite_queries}
        api_list={workflowInfo?.data?.api_list}
        update={update}
      />
      {/* Write dag */}
      <div className="my-4">
        <p className="text-xl py-2">Step 5. Workflow DAG Generation</p>
        <div className="bg-gray-100 mb-4 p-4">
          <div className="flex">
            <span className="bg-gray-400 mr-2 prompt-card-user rounded-full font-bold">
              You
            </span>
            <div className="break-word">
              {promptData?.data?.['write_dag_prompt']
                .split('\n')
                .map((line, index) => (
                  <div className="mb-2" key={index}>
                    {line}
                  </div>
                ))}
            </div>
          </div>
          <div className="mt-4 flex">
            <span className="bg-gray-400 mr-2 prompt-card-user rounded-md font-bold">
              Bot
            </span>
            <div className="flex-1 overflow-y-auto">
              {workflowInfo?.data?.dag && (
                <MarkdownRenderer markdown={workflowInfo?.data?.dag} />
              )}
            </div>
          </div>
        </div>

        <Button
          className="font-bold"
          type="primary"
          size="large"
          loading={loading5}
          onClick={handleWriteDag}
        >
          Prompt
        </Button>
      </div>
      {/* flow xml */}
      <div className="my-4">
        <p className="text-xl py-2">Step 6. Workflow Model Generation</p>
        <div className="bg-gray-100 mb-4 p-4">
          <div className="flex">
            <span className="bg-gray-400 mr-2 prompt-card-user rounded-full font-bold">
              You
            </span>
            <div className="break-word">
              {promptData?.data?.['write_xml_prompt']
                ?.split('\n')
                ?.map((line, index) => (
                  <div className="mb-2" key={index}>
                    {line}
                  </div>
                ))}
            </div>
          </div>

          {workflowInfo?.data?.xml && (
            <div className="flex ml-[44px] p-4 bg-white rounded-md">
              <FlowChart
                width={'80%'}
                height={150}
                xmlData={workflowInfo?.data?.xml}
              />
            </div>
          )}

          <div className="mt-4 flex">
            <span className="bg-gray-400 mr-2 prompt-card-user rounded-md font-bold">
              Bot
            </span>
            <div className="flex-1">
              {workflowInfo?.data?.xml && (
                <MarkdownRenderer markdown={workflowInfo?.data?.xml} />
              )}
            </div>
          </div>
        </div>

        <Button
          className="font-bold"
          type="primary"
          size="large"
          loading={loading6}
          onClick={handleWriteXML}
        >
          Prompt
        </Button>
      </div>
    </div>
  );
};

export default Workflow;
