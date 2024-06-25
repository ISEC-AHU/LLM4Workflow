/*
 * @Author: Weilin Du
 * @Date: 2024-05-10 09:44:31
 * @LastEditors: Weilin Du
 * @LastEditTime: 2024-06-20 11:28:09
 * @FilePath: \workflow-frontend\src\view\workflow\Retrieve.tsx
 * @Description:
 */

import './workflow.css';

import { Button, Checkbox, Input, Modal, Space } from 'antd';
import { custom_api_chain, getRetrieveDocs } from '@/api/api';
import { useEffect, useState } from 'react';

import type { GetProp } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { useRequest } from 'ahooks';

const RetrieveApi: React.FC<{
  query_list?: string[];
  api_list?: any[];
  update: (value: any) => void;
}> = (props) => {
  const { workflowId } = useParams();
  const [describe, setDescribe] = useState('');
  const [customApi, setCustomAPI] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { loading, run: runRetrieveDocs } = useRequest(getRetrieveDocs, {
    manual: true,
    onSuccess: (res) => {
      if (res.code === 200) {
        props.update({
          id: workflowId as string,
          api_list: res?.data,
        });
      }
    },
  });

  const onChange: GetProp<typeof Checkbox.Group, 'onChange'> = (
    checkedValues
  ) => {
    console.log('checkedValues', checkedValues);
    const values = props?.api_list?.map((item) => {
      const name = JSON.parse(item.doc.page_content).name;
      return {
        ...item,
        status: checkedValues.includes(name) ? 1 : 0,
      };
    });
    props.update({
      id: workflowId as string,
      api_list: values,
    });
  };

  const addCustomApi = async () => {
    const res = await custom_api_chain.invoke({
      description: describe,
    });
    setCustomAPI(res);
  };

  const handleCustomAPISubmit = () => {
    const api = {
      doc: {
        metadata: {
          source: `workflowId:${workflowId}`,
        },
        page_content: customApi,
        type: 'Custom',
      },
      status: 1,
    };
    props.update({
      id: workflowId as string,
      api_list: [...props.api_list, api],
    });
    setIsModalVisible(false);
  };

  useEffect(() => {
    if (!isModalVisible) {
      setDescribe('');
      setCustomAPI('');
    }
  }, [isModalVisible]);

  return (
    /* Retrieve task apis */
    <div className="my-4">
      <p className="text-xl py-2">Step 4. API Retrieval</p>
      <div className="bg-gray-100 mb-4 p-4">
        <div className="flex">
          <span className="bg-gray-400 mr-2 prompt-card-user rounded-full font-bold">
            You
          </span>
          <div className="break-word">
            {props?.query_list?.map((line, index) => (
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
          <div className="flex items-center">
            <Checkbox.Group
              value={props?.api_list
                ?.filter((item) => item.status == 1)
                ?.map((item) => JSON.parse(item.doc.page_content).name)}
              options={props?.api_list?.map((item) => {
                const content = JSON.parse(item.doc.page_content);
                return {
                  label: content.name,
                  value: content.name,
                };
              })}
              onChange={onChange}
            ></Checkbox.Group>
            {props?.query_list && (
              <Button
                size="small"
                icon={<PlusOutlined />}
                onClick={() => setIsModalVisible(true)}
              >
                Custom Api
              </Button>
            )}
          </div>
          <Modal
            title="Custom API"
            open={isModalVisible}
            onOk={handleCustomAPISubmit}
            onCancel={() => setIsModalVisible(false)}
          >
            <Space.Compact style={{ width: '100%' }}>
              <Input
                placeholder="api describe"
                value={describe}
                onChange={(e) => setDescribe(e.target.value)}
              />
              <Button onClick={addCustomApi}>Prompt</Button>
            </Space.Compact>
            <div>{customApi}</div>
          </Modal>
        </div>
      </div>

      <Button
        className="font-bold"
        type="primary"
        size="large"
        loading={loading}
        onClick={() => {
          runRetrieveDocs({ queries: props.query_list as string[] });
        }}
      >
        Retrieve
      </Button>
    </div>
  );
};

export default RetrieveApi;
