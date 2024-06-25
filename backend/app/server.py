import json
import tempfile
from typing import Optional

from fastapi import Body, FastAPI, Request, HTTPException, Form, File, Depends, Query, Path
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from langserve import add_routes

from app.create_game import CREATE_GAME_PROMPT, create_game_chain_with_history
from app.custom_api import custom_api_chain
from app.db import Database
from app.rag import rewrite_query_chain, REWRITE_QUERY_PROMPT, RAG
from app.schema import RestfulModel, TaskInfo, PromptInfo, UpdateWorkflow, CollectionData, QueryData
from app.utils import VECTOR_BASE_PATH
from app.vectorStore import VectorStore
from app.write_dag import WRITE_DAG_PROMPT, write_dag_chain
from app.write_xml import write_xml_chain, WRITE_XML_PROMPT

app = FastAPI(
    title="Workflow Generator Server",
    version="1.0",
    description="A api server using Langchain's Runnable interfaces for generating workflows",
)
# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

db = Database()


@app.on_event("startup")
async def startup():
    db_config = {
        "dbname": "postgres",
        "user": "postgres",
        "password": "123456",
        "host": "localhost",
        "port": 5432
    }
    db.connect(**db_config)


@app.on_event("shutdown")
async def shutdown():
    db.close()


@app.middleware("http")
async def add_uid_to_state(request: Request, call_next):
    request.state.uid = 1
    response = await call_next(request)
    return response


def get_uid(request: Request):
    return request.state.uid


@app.get("/")
async def redirect_root_to_docs():
    return RedirectResponse("/docs")


add_routes(
    app,
    create_game_chain_with_history,
    path="/workflow/create_game",
)

add_routes(
    app,
    rewrite_query_chain,
    path="/workflow/rewrite_query",
)

add_routes(
    app,
    custom_api_chain,
    path="/workflow/api/custom",
)

add_routes(
    app,
    write_dag_chain,
    path="/workflow/write_dag",
)

add_routes(
    app,
    write_xml_chain,
    path="/workflow/write_xml",
)


@app.get("/workflow/list")
async def list_workflow(uid: int = Depends(get_uid)):
    try:
        query = """
            SELECT id  FROM workflow w WHERE uid = %s ORDER BY id DESC;
        """
        workflow_records = db.fetch_query(query, (uid,))
        converted_data = [{
            "id": item['id']
        } for item in workflow_records]
        return RestfulModel(data=converted_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@app.get("/workflow/add")
async def add_workflow(uid: int = Depends(get_uid),
                       session_id: str = Query(..., description="Session ID for create workflow message store")):
    try:
        query = """
              INSERT INTO workflow (uid, create_game_session_id)
              VALUES (%s, %s)
              """
        params = (uid, session_id,)
        db.execute_query(query, params)
        res = db.fetch_query("""
            SELECT id from workflow where uid = %s and create_game_session_id = %s ORDER BY id DESC LIMIT 1""",
                             (uid, session_id,))
        if res:
            return RestfulModel(data={"id": res[0]['id']}, msg="Workflow created successfully")
        else:
            return RestfulModel(code=-1, msg="No workflow found")
    except Exception as e:
        return RestfulModel(code=-1, msg=f"An error occurred: {str(e)}")


@app.post("/workflow/update")
async def update_workflow(update_data: UpdateWorkflow = Body(...)):
    # TODO: validate params
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")
    update_fields = update_data.dict(exclude_unset=True)
    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")

    if 'api_list' in update_fields:
        update_fields['api_list'] = json.dumps((update_fields['api_list']))

    set_clause = ", ".join([f"{field} = %({field})s" for field in update_fields])
    query = f"UPDATE workflow SET {set_clause} WHERE id = %(id)s"

    db.execute_query(query, update_fields)
    return {"msg": "Workflow updated successfully"}


@app.get("/workflow/info/{workflow_id}")
async def get_workflow_info(workflow_id: int = Path(..., title="The ID of the workflow")):
    try:
        query = """
               SELECT * FROM workflow w WHERE id = %s;
           """
        record = db.fetch_query(query, (workflow_id,))
        if record[0]:
            data = {
                'id': record[0]['id'],
                'session_id': record[0]['create_game_session_id'],
                'describe': record[0]['describe'],
                'extracted_task': record[0]['extracted_task'],
                'rewrite_queries': record[0]['rewrite_queries'],
                'api_list': record[0]['api_list'],
                'dag': record[0]['dag'],
                'xml': record[0]['xml']
            }
            return RestfulModel(data=data)
        else:
            return RestfulModel(code=-1, msg="No workflow found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@app.get("/workflow/retrieve/params/{workflow_id}")
async def get_workflow_describe(workflow_id: int = Path(..., title="The ID of the workflow")):
    try:
        query = """
        SELECT extracted_task, rewrite_queries from workflow where id=%s
        """
        res = db.fetch_query(query, (workflow_id,))
        text = res[0]['extracted_task']
        if res[0]['rewrite_queries']:
            k = len(res[0]['rewrite_queries'])
        else:
            k = len(text.split('\n'))
        if text:
            return RestfulModel[TaskInfo](data={'text': text, 'k': k})
        else:
            return RestfulModel(code=-1, msg="No workflow found")
    except Exception as e:
        return RestfulModel(code=-1, msg=f"An error occurred: {str(e)}")


@app.post("/workflow/retrieve/docs")
async def get_relevant_docs(uid: int = Depends(get_uid), requestData: QueryData = Body()):
    try:
        query = """ SELECT collection_name FROM collection WHERE uid=%s and is_selected=true"""
        current_collection = db.fetch_query(query, (uid,))
        if len(current_collection) == 0:
            return RestfulModel(code=-1, msg="select collection first")
        rag = RAG(db_directory=VECTOR_BASE_PATH, collection_name=current_collection[0][0])
        docs = rag.mq_retrieve_documents(requestData.queries)
        return RestfulModel(data=docs)
    except Exception as e:
        return RestfulModel(code=-1, msg=f"An error occurred: {str(e)}")


@app.get("/workflow/prompt/info")
async def get_prompts_info():
    return RestfulModel[PromptInfo](data={
        'create_game_prompt': CREATE_GAME_PROMPT,
        'rewrite_query_prompt': REWRITE_QUERY_PROMPT,
        'write_dag_prompt': WRITE_DAG_PROMPT,
        'write_xml_prompt': WRITE_XML_PROMPT,
    })


async def get_vector_store(user_namespace: str = '') -> VectorStore:
    """Get the vector store for the current user."""
    return VectorStore(f'{VECTOR_BASE_PATH}/{user_namespace}')


@app.get("/collection/list")
async def list_collections():
    try:
        query = """
            SELECT collection_name,  collection_describe, create_time, is_selected FROM collection ORDER BY create_time DESC
        """
        collections = db.fetch_query(query)
        return RestfulModel(data=[{
            "collection_name": item['collection_name'],
            "collection_describe": item['collection_describe'],
            "create_time": item['create_time'],
            "is_selected": item['is_selected']
        } for item in collections])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


def json_file_2_documents(file: bytes):
    import os
    try:
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            temp_file.write(file)
            temp_file_path = temp_file.name
        rag = RAG(doc_path=temp_file_path, db_directory=VECTOR_BASE_PATH)
        documents = rag.doc_loader()
        return documents
    except Exception as e:
        return RestfulModel(code=-1, msg=f"An error occurred: {str(e)}")
    finally:
        os.remove(temp_file_path)


@app.post("/collection/create")
async def add_collection_docs(uid: int = Depends(get_uid), file: bytes = File(...), collection_name: str = Form(...),
                              collection_describe: Optional[str] = Form(None), create_time: str = Form(...)):
    try:
        vectorStore = VectorStore(path=VECTOR_BASE_PATH)
        documents = json_file_2_documents(file)
        vectorStore.add_docs(collection_name=collection_name, docs=documents)
        query = """
        INSERT INTO collection (uid, collection_name, collection_describe, create_time, is_selected, file)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        params = (uid, collection_name, collection_describe or '', create_time, False, file)
        db.execute_query(query, params)
        return RestfulModel(code=200, msg="Collection created successfully")
    except Exception as e:
        return RestfulModel(code=-1, msg=f"An error occurred: {str(e)}")


@app.post("/collection/select")
async def select_collection(uid: int = Depends(get_uid), collection_data: CollectionData = Body()):
    try:
        query = """ SELECT collection_name FROM collection WHERE uid=%s and is_selected=true"""
        current_collection = db.fetch_query(query, (uid,))
        if len(current_collection) != 0:
            db.execute_query(""" UPDATE collection set is_selected = false WHERE uid=%s and collection_name=%s""",
                             (uid, current_collection[0][0]))
        db.execute_query(""" UPDATE collection set is_selected = true WHERE uid=%s and collection_name=%s""",
                         (uid, collection_data.collection_name))
        return RestfulModel(code=200, msg="Collection selected successfully")
    except Exception as e:
        return RestfulModel(code=-1, msg=f"An error occurred: {str(e)}")


@app.delete("/collection/delete")
async def delete_collection(uid: int = Depends(get_uid), collection_name: str = None):
    try:
        vectorStore = VectorStore(path=VECTOR_BASE_PATH)
        vectorStore.delete_collection(collection_name)
        query = """
               DELETE FROM collection WHERE uid=%s and collection_name = %s
               """
        params = (uid, collection_name)
        db.execute_query(query, params)
        return RestfulModel(code=200, msg="Collection deleted successfully")
    except Exception as e:
        return RestfulModel(code=-1, msg=f"An error occurred: {str(e)}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
