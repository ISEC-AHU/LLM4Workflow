/*
 * @Author: Weilin Du
 * @Date: 2024-05-09 16:28:01
 * @LastEditors: Weilin Du
 * @LastEditTime: 2024-06-18 17:02:43
 * @FilePath: \workflow-frontend\src\view\workflow\RewriteQuery.tsx
 * @Description:
 */

import './workflow.css';

import { Button } from 'antd';
import { PromptParamsResponse } from '@/api/schema';
import { RemoteRunnable } from '@langchain/core/runnables/remote';
import RewriteFormModal from './RewriteModal';
import { Runnable } from '@langchain/core/runnables';
import { apiBaseUrl } from '@/utils/constants';
import { getPromptParams } from '@/api/api';
import { useParams } from 'react-router-dom';
import { useRequest } from 'ahooks';
import { useState } from 'react';

const runnableConfigs = {
  options: {
    timeout: 60000,
  },
};

const rewrite_query_chain: Runnable = new RemoteRunnable({
  url: `${apiBaseUrl}/workflow/rewrite_query`,
  ...runnableConfigs,
});

export interface SetValueParams {
  extracted_task: string;
  rewrite_queries: string[];
}

interface RwriteQueryProps {
  prompt?: string;
  setValue: (params: SetValueParams) => void;
}

const RewriteQuery: React.FC<RwriteQueryProps> = (props) => {
  const [open, setOpen] = useState(false);
  const { workflowId } = useParams();
  const [confirmLoading, setConfirmLoading] = useState(false);

  const { run, data: ParamsData } = useRequest(getPromptParams, {
    manual: true,
  });

  const onOpenModal = () => {
    setOpen(true);
    run(workflowId as string);
  };

  const handleRewrite = async (values: PromptParamsResponse) => {
    try {
      setConfirmLoading(true);
      const res = await rewrite_query_chain.invoke({ ...values });
      if (res?.length !== values.k) {
        throw new Error('Rewrite query failed');
      } else {
        props.setValue({ extracted_task: values.text, rewrite_queries: res });
        setOpen(false);
      }
    } catch (e) {
      console.log('queryRewrite error:', e);
      throw new Error('Rewrite query failed');
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    // Rewrite query
    <div className="my-4">
      <p className="text-xl py-2">Step 3. Task Rewriting</p>
      <div className="bg-gray-100 mb-4 p-4 flex">
        <span className="bg-gray-400 mr-2 prompt-card-user rounded-full font-bold">
          You
        </span>
        <div className="w-full break-word">
          {props?.prompt?.split('\n').map((line, index) => (
            <div className="mb-2" key={index}>
              {line}
            </div>
          ))}
        </div>
      </div>

      <Button
        className="font-bold"
        type="primary"
        size="large"
        onClick={onOpenModal}
      >
        Set Params
      </Button>
      <RewriteFormModal
        initialValues={{
          text: ParamsData?.data.text,
          k: ParamsData?.data.k,
        }}
        confirmLoading={confirmLoading}
        open={open}
        onRewrite={handleRewrite}
        onCancel={() => setOpen(false)}
      />
    </div>
  );
};

export default RewriteQuery;
