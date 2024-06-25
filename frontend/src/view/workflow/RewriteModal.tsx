import { Form, Input, InputNumber, Modal } from 'antd';
import React, { useEffect, useState } from 'react';

import type { FormInstance } from 'antd';

export interface PromptParamsResponse {
  k?: number;
  text?: string;
}

interface RewriteFormProps {
  initialValues?: PromptParamsResponse;
  onFormInstanceReady: (instance: FormInstance<PromptParamsResponse>) => void;
}

const RewriteForm: React.FC<RewriteFormProps> = ({
  initialValues,
  onFormInstanceReady,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    onFormInstanceReady(form);
  }, []);

  const onValuesChange = (changedValues: any) => {
    if (changedValues.text) {
      form.setFieldsValue({
        k: changedValues.text.split('\n').length,
      });
    }
  };

  return (
    <Form
      layout="vertical"
      form={form}
      name="form_in_modal"
      initialValues={initialValues}
      onValuesChange={onValuesChange}
    >
      <Form.Item
        name="text"
        label="Task Sequence"
        rules={[
          {
            required: true,
            message: 'Please input the task of workflow!',
          },
        ]}
      >
        <Input.TextArea
          styles={{
            textarea: {
              fontSize: 16,
            },
          }}
          autoSize={{ minRows: 3, maxRows: 8 }}
        />
      </Form.Item>
      <Form.Item
        name="k"
        label="Query Numbers"
        dependencies={['text']}
        rules={[
          { required: true, message: 'Please input the numbers of query!' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('text').split('\n').length <= value) {
                return Promise.resolve();
              }
              return Promise.reject(
                new Error(
                  'The number of query should be greater than the number of task!'
                )
              );
            },
          }),
        ]}
      >
        <InputNumber min={1} max={20} />
      </Form.Item>
    </Form>
  );
};

interface RewriteFormModalProps {
  confirmLoading: boolean;
  open: boolean;
  form: FormInstance<any>;
  initialValues: PromptParamsResponse;
  onRewrite: (values: PromptParamsResponse) => Promise<void>;
  onCancel: () => void;
}

const RewriteFormModal: React.FC<RewriteFormModalProps> = ({
  confirmLoading,
  open,
  initialValues,
  onRewrite,
  onCancel,
}) => {
  const [formInstance, setFormInstance] = useState<FormInstance>();

  useEffect(() => {
    if (formInstance && open) {
      formInstance.setFieldsValue(initialValues);
    }
  }, [open, formInstance, initialValues]);

  return (
    <Modal
      width={750}
      confirmLoading={confirmLoading}
      open={open}
      title="Set the params of prompt"
      okText="Prompt"
      cancelText="Cancel"
      okButtonProps={{ autoFocus: true }}
      onCancel={onCancel}
      destroyOnClose
      onOk={async () => {
        const values = await formInstance?.validateFields();
        await onRewrite(values);
        formInstance?.resetFields();
      }}
    >
      <RewriteForm
        initialValues={initialValues}
        onFormInstanceReady={(instance) => {
          setFormInstance(instance);
        }}
      />
    </Modal>
  );
};

export default RewriteFormModal;
