from typing import Sequence, List

import chromadb
import dotenv
from chromadb.api.models.Collection import Collection
from langchain_community.vectorstores.chroma import Chroma
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings

from app.utils import VECTOR_BASE_PATH

dotenv.load_dotenv()


class VectorStore:
    def __init__(self, path: str = None):
        if path is None:
            raise ValueError("path must be provided when initializing VectorStore")
        self.client_path = path
        self.client = chromadb.PersistentClient(path=self.client_path)
        # self.client.reset()

    def list_collections(self) -> Sequence[Collection]:
        return self.client.list_collections()

    def create_collection(self, collection_name: str):
        return self.client.create_collection(collection_name)

    def delete_collection(self, collection_name: str):
        self.client.delete_collection(collection_name)

    def add_docs(self, collection_name: str, docs: List[Document]):
        embeddings = OpenAIEmbeddings(disallowed_special=())
        Chroma.from_documents(docs, embeddings, collection_name=collection_name, persist_directory=self.client_path)


'''
if __name__ == '__main__':
    vectorStore = VectorStore(VECTOR_BASE_PATH)
    collections = vectorStore.list_collections()
    print(collections)
'''
