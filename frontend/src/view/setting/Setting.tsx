/*
 * @Author: Weilin Du
 * @Date: 2024-05-10 10:13:03
 * @LastEditors: Weilin Du
 * @LastEditTime: 2024-06-18 09:27:52
 * @FilePath: \workflow-frontend\src\view\setting\Setting.tsx
 * @Description:
 */

import {} from 'react-router-dom';

import { Button, List, Popconfirm, Select, Table, message } from 'antd'; // 引入 Popconfirm 组件
import {
  CollectionType,
  createCollection,
  deleteCollection,
  getCollectionList,
  getWorkflowList,
  updateWorkflow,
} from '@/api/api';
import { PlusOutlined, SettingOutlined } from '@ant-design/icons';
import React, { FC, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import CollectionModal from '../collection/CollectionModal';
import { EventEmitter } from 'ahooks/lib/useEventEmitter';
import { useRequest } from 'ahooks';

const Setting: FC<{ refresh$: EventEmitter<void> }> = function (props) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { workflowId } = useParams();

  const { run: runWorkflowList, data: workflowData } =
    useRequest(getWorkflowList);

  props.refresh$.useSubscription(() => {
    runWorkflowList();
  });

  return (
    <div className="p-4">
      <div className="flex justify-between pb-2 border-b-2 items-center">
        <span className="font-bold">API Knowledge Base</span>
        <div className="cursor-pointer" onClick={() => setOpen(true)}>
          <SettingOutlined />
        </div>
      </div>

      <div className="flex w-full items-center truncate font-bold my-2">
        <Button
          type="primary"
          className="rounded-md font-medium hover:opacity-50 flex h-[36px] grow items-center justify-center"
          icon={<PlusOutlined />}
          onClick={() => {
            navigate(`/workflow/add`);
            window.location.reload();
          }}
        >
          New Workflow
        </Button>
      </div>
      <List
        size="small"
        dataSource={workflowData?.data}
        renderItem={(item) => {
          return (
            <div
              key={item.id}
              onClick={() => navigate(`/workflow/${item.id}`)}
              className={`${item.id == workflowId ? 'bg-gray-100' : ''}
              relative overflow-hidden text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 rounded-md py-[6px] px-4 border border-gray-100 mb-2 last:mb-0`}
            >
              Workflow{item.id}
              {/* <div className="absolute bottom-0 right-0 top-0 w-8 transition-all duration-300 ease-in-out bg-gradient-to-r from-transparent to-white"></div> */}
            </div>
          );
        }}
      />
      <CollectionModal open={open} onCancel={() => setOpen(false)} />
    </div>
  );
};

export default Setting;
