from typing import Generic, Optional, Dict, Any
from typing import List, TypeVar

from langchain_core.documents import Document
from langserve.pydantic_v1 import BaseModel
from pydantic.generics import GenericModel

T = TypeVar('T')


class RestfulModel(GenericModel, Generic[T]):
    code: int = 200
    msg: Optional[str] = "OK"
    data: Optional[T]


class PromptInfo(BaseModel):
    create_game_prompt: str
    rewrite_query_prompt: str
    write_dag_prompt: str
    write_xml_prompt: str


class TaskInfo(BaseModel):
    text: str
    k: int


class QueryData(BaseModel):
    queries: List[str]


class RelevantDocs(BaseModel):
    total: int
    docs: List[Document]


class CollectionList(BaseModel):
    collections: List[str]


class CollectionData(BaseModel):
    collection_name: str
    collection_describe: Optional[str] = None


class UpdateWorkflow(BaseModel):
    id: int
    session_id: Optional[str]
    describe: Optional[str]
    extracted_task: Optional[str]
    rewrite_queries: Optional[list[str]]
    api_list: Optional[list]
    dag: Optional[str]
    xml: Optional[str]
