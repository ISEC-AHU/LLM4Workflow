import {
  CollectionType,
  PromptInfo,
  PromptParamsResponse,
  RequestData,
  RetrievedDocs,
  WorkflowInfoPayload,
  WorkflowType,
} from './schema';

import ApiService from './apiService';
import { RemoteRunnable } from '@langchain/core/runnables/remote';
import { Runnable } from '@langchain/core/runnables';
import { apiBaseUrl } from '@/utils/constants';

const apiService = new ApiService({
  baseURL: apiBaseUrl,
});

const runnableConfigs = {
  options: {
    timeout: 60000,
  },
};

export const create_game_chain = new RemoteRunnable({
  url: `${apiBaseUrl}/workflow/create_game`,
  ...runnableConfigs,
});

export const modify_extraction_chain: Runnable = new RemoteRunnable({
  url: `${apiBaseUrl}/workflow/modify_extraction`,
  ...runnableConfigs,
});

export const custom_api_chain: Runnable = new RemoteRunnable({
  url: `${apiBaseUrl}/workflow/api/custom`,
  ...runnableConfigs,
});

export const write_dag_chain: Runnable = new RemoteRunnable({
  url: `${apiBaseUrl}/workflow/write_dag`,
  ...runnableConfigs,
});

export const write_xml_chain: Runnable = new RemoteRunnable({
  url: `${apiBaseUrl}/workflow/write_xml`,
  ...runnableConfigs,
});

// ========================================== workflow ==========================================
export const addWorkflow = async (
  session_id: string
): Promise<RequestData<{ id: number }>> => {
  return apiService.get(`/workflow/add`, { params: { session_id } });
};

export const updateWorkflow = async (
  data: WorkflowInfoPayload
): Promise<RequestData<WorkflowInfoPayload>> => {
  return apiService.post(`/workflow/update`, data);
};

export const getWorkflowList = async (): Promise<
  RequestData<WorkflowType[]>
> => {
  return apiService.get(`/workflow/list`);
};

export const getWorkflowInfoById = async (
  id: string
): Promise<RequestData<WorkflowInfoPayload>> => {
  return apiService.get(`/workflow/info/${id}`);
};

export const getRetrieveDocs = async (data: {
  queries: string[];
  collection_name: string;
}): Promise<RequestData<RetrievedDocs>> => {
  return apiService.post(`/workflow/retrieve/docs`, data);
};

// ========================================== prompt ==========================================
export const getPromptInfo = async (): Promise<RequestData<PromptInfo>> => {
  return apiService.get(`/workflow/prompt/info`);
};

export const getPromptParams = async (
  id: string
): Promise<RequestData<PromptParamsResponse>> => {
  return apiService.get(`/workflow/retrieve/params/${id}`);
};

// ========================================== collection ==========================================
export const getCollectionList = async (): Promise<
  RequestData<CollectionType[]>
> => {
  return apiService.get(`/collection/list`);
};

export const createCollection = async (
  data: CollectionType
): Promise<RequestData<CollectionType>> => {
  return apiService.post(`/collection/create`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const selectCollection = async (data: {
  collection_name: string;
}): Promise<RequestData<unknown>> => {
  return apiService.post(`/collection/select`, data);
};

export const deleteCollection = async (
  collection_name: string
): Promise<RequestData<unknown>> => {
  return apiService.delete(`/collection/delete`, {
    params: { collection_name },
  });
};
