import dotenv
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

from app.utils import MODEL

dotenv.load_dotenv()


WRITE_DAG_PROMPT = """You're a scientific workflow expert, and your role involves: 
1. Analyzing the following workflow task descriptions and the associated API list for task execution, but you don't need to return them to me.
2. Choosing the suitable API from the following api list for each task execution and assessing the interdependencies among task executions, but you don't need to return them to me.
3. Ultimately, presenting the workflow task list and their dependencies in the following json markdown format:
```json {{
"task_list": [{{id: task id, task name: task name, task description: task description, api: api name}}]
"task_dependencies": {{id: [task ids required to execute before the current task]}}
}}```

Don't output anything for step 1 and 2, only the answer in step 3. Let's work this out in a step by step way to be sure we have the right answer.

workflow task descriptions: {task_list}
api list: {api_list}
Answer:
"""

write_dag_chain = ChatPromptTemplate.from_template(WRITE_DAG_PROMPT) | MODEL | StrOutputParser()
