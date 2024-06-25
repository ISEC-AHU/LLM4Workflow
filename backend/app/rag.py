import json
from collections import defaultdict
from pathlib import Path
from typing import List, Union

from langchain.retrievers import EnsembleRetriever
from langchain_community.retrievers import BM25Retriever
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document
from langchain_core.messages import AIMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.vectorstores import VectorStoreRetriever
from langchain_openai import OpenAIEmbeddings

from app.json_loader import JSONLoader
from app.utils import MODEL


REWRITE_QUERY_PROMPT = """You are an AI language model assistant. Your task is to generate {k} alternative queries to retrieve relevant 
APIs (to execute tasks in scientific workflows) from a vector database. 
By generating better queries based on the user's task list, your goal is to help the user overcome some of the limitations of distance-based similarity search. 
Provide these alternative queries separated by newlines. 
Original user task list: {text}
"""


def unique_union_documents(docs: List[Document]) -> List[Document]:
    """Deduplicate documents."""
    unique_documents_dict = {
        (doc.page_content, json.dumps(doc.metadata, sort_keys=True)): doc
        for doc in docs
    }

    unique_documents = list(unique_documents_dict.values())
    print(f"**Retrieved {len(unique_documents)} relevant documents**")
    return unique_documents


def create_rewrite_chain():
    def parse(ai_message: AIMessage) -> List[str]:
        """Split the AI message into a list of queries"""
        return ai_message.content.strip().split("\n")

    rewrite_chain = ChatPromptTemplate.from_template(REWRITE_QUERY_PROMPT) | MODEL | parse
    return rewrite_chain


rewrite_query_chain = create_rewrite_chain()


class RAG:
    def __init__(self, db_directory, collection_name='default', doc_path=None):
        self.persist_directory = db_directory
        self.model = MODEL
        self.collection_name = collection_name
        self.documents = None
        self.retriever = self.create_retriever()
        if doc_path:
            self.doc_path = Path(doc_path)
            self.documents = self.doc_loader()

    def doc_loader(self):
        loader = JSONLoader(
            file_path=self.doc_path,
            text_content=False, json_lines=False)
        data = loader.load()
        return data

    def create_retriever(self) -> Union[EnsembleRetriever, VectorStoreRetriever]:
        embeddings = OpenAIEmbeddings(disallowed_special=())
        chroma_vectorstore = Chroma(persist_directory=self.persist_directory, collection_name=self.collection_name,
                                    embedding_function=embeddings)
        chroma_retriever = chroma_vectorstore.as_retriever(search_type="mmr", search_kwargs={"k": 3})

        if self.documents:
            bm25_retriever = BM25Retriever.from_documents(self.documents)
            bm25_retriever.k = 2
            chroma_retriever = chroma_vectorstore.as_retriever(search_kwargs={"k": 2})
            # chroma_vectorstore = Chroma.from_documents(self.documents, embeddings, collection_name=self.collection_name,
            #                                            persist_directory=self.persist_directory)
            ensemble_retriever = EnsembleRetriever(
                retrievers=[bm25_retriever, chroma_retriever], weights=[0.4, 0.6]
            )
            return ensemble_retriever

        return chroma_retriever

    def mq_retrieve_documents(self, queries):
        relevant_docs = []
        for query in queries:
            docs_with_score = self.retriever.invoke(query)
            for doc in docs_with_score:
                relevant_docs.append(doc)
        unique_union_docs = unique_union_documents(relevant_docs)
        return [{'doc': doc, 'status': 1} for doc in unique_union_docs]

    def db_retrieve_documents(self, queries: List[str]):
        relevant_docs_with_query = defaultdict(list)
        for idx, query in enumerate(queries):
            docs = self.retriever.invoke(query)
            relevant_docs_with_query[idx + 1].extend(docs)
        return dict(relevant_docs_with_query)

