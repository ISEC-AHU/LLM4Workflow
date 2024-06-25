import {
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Table,
  Upload,
  message,
} from 'antd';
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import type { FormInstance, UploadFile, UploadProps } from 'antd';
import React, { useEffect, useState } from 'react';
import {
  createCollection,
  deleteCollection,
  getCollectionList,
  selectCollection,
} from '@/api/api';

import type { TableProps } from 'antd';
import { useRequest } from 'ahooks';

export interface UploadParam<T = UploadFile> {
  file: T;
  fileList: T[];
}

export interface CollectionValues {
  name: string;
  description?: string;
  file: UploadParam;
}

interface CollectionCreateFormProps {
  initialValues: CollectionValues;
  loading: boolean;
  onCreate: (values: CollectionValues) => void;
  onCancel: () => void;
}

const CollectionCreateForm: React.FC<CollectionCreateFormProps> = ({
  initialValues,
  loading,
  onCreate,
}) => {
  const [form] = Form.useForm();

  const onFinish = async (values: CollectionValues) => {
    try {
      await onCreate(values);
      form?.resetFields();
    } catch (e) {
      message.error('Failed to create collection!');
    }
  };

  return (
    <Form
      layout="inline"
      form={form}
      name="form_in_modal"
      initialValues={initialValues}
      onFinish={onFinish}
      autoComplete="off"
    >
      <div className="mb-2 grid grid-cols-3 gap-1">
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Describe">
          <Input />
        </Form.Item>
        <Form.Item
          name="file"
          label="File"
          valuePropName="fileList"
          getValueFromEvent={(e) => e.fileList}
          rules={[{ required: true }]}
        >
          <Upload
            name="file"
            accept=".json,.csv,application/json,text/csv"
            multiple={false}
            maxCount={1}
            beforeUpload={() => false}
          >
            <Button icon={<UploadOutlined />}>Select File</Button>
          </Upload>
        </Form.Item>
      </div>

      <Button
        className="mb-2"
        type="primary"
        htmlType="submit"
        loading={loading}
      >
        Create
      </Button>
    </Form>
  );
};

interface CollectionFormModalProps {
  open: boolean;
  onCancel: () => void;
  initialValues?: CollectionValues;
}

const CollectionModal: React.FC<CollectionFormModalProps> = ({
  open,
  initialValues,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = React.useState<CollectionType[]>([]);
  const { loading: tableLoading, run } = useRequest(getCollectionList, {
    onSuccess: (res) => {
      setData(
        res.data.map((item) => ({ ...item, key: `${item.collection_name}` }))
      );
    },
  });

  // 处理删除操作
  const handleDelete = async (collectionName: string) => {
    try {
      const { code, msg } = await deleteCollection(collectionName);
      if (code === 200) {
        message.success('Collection deleted successfully');
        run(); // 重新加载数据
      } else {
        message.error(msg);
      }
    } catch (error) {
      console.error('Delete failed:', error);
      message.error('Delete failed');
    }
  };

  const onCreate = async (values) => {
    const formData = new FormData();
    formData.append('file', values.file[0].originFileObj);
    formData.append('collection_name', values.name);
    formData.append('collection_describe', values?.description || '');
    formData.append('create_time', Date.now().toString());
    try {
      setLoading(true);
      const { code, msg } = await createCollection(formData);
      if (code === 200) {
        run(); // 重新加载数据
        message.success(msg);
      } else {
        throw new Error('Failed to create collection');
      }
    } catch (e) {
      throw new Error('Failed to create collection');
    } finally {
      setLoading(false);
    }
  };

  const columns: TableProps<CollectionType>['columns'] = [
    {
      title: 'collection name',
      dataIndex: 'collection_name',
      key: 'collection_name',
    },
    {
      title: 'collection describe',
      dataIndex: 'collection_describe',
      key: 'collection_describe',
    },
    {
      title: 'create time',
      dataIndex: 'create_time',
      key: 'create_time',
      render: (_, record) => {
        const date = new Date(Number(record.create_time));
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      },
    },
    {
      title: 'action',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        // 使用 Popconfirm 组件确认删除操作
        <Popconfirm
          title="Are you sure delete this collection?"
          onConfirm={() => handleDelete(record.collection_name)}
          okText="Yes"
          cancelText="No"
        >
          <DeleteOutlined style={{ color: 'red' }} />
        </Popconfirm>
      ),
    },
  ];

  const rowSelection = {
    onChange: async (selectedRowKeys: React.Key[]) => {
      try {
        const { code } = await selectCollection({
          collection_name: selectedRowKeys[0],
        });
        if (code === 200) {
          run(); // 重新加载数据
        }
      } catch (error) {}
    },
  };

  return (
    <Modal
      width={800}
      destroyOnClose
      title="Create a new Collection"
      okText="Save"
      cancelText="Cancel"
      okButtonProps={{ autoFocus: true }}
      onCancel={onCancel}
      maskClosable={false}
      open={open}
      footer={null}
    >
      <CollectionCreateForm
        initialValues={initialValues || {}}
        loading={loading}
        onCreate={onCreate}
        onCancel={onCancel}
      />

      <Table
        size="small"
        rowSelection={{
          type: 'radio',
          ...rowSelection,
          selectedRowKeys: data
            .filter((item) => item.is_selected === true)
            .map((item) => item.collection_name),
        }}
        pagination={false}
        loading={tableLoading}
        columns={columns}
        dataSource={data}
      />
    </Modal>
  );
};

export default CollectionModal;
