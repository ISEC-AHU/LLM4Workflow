from langchain_community.chat_message_histories import PostgresChatMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory

from app.utils import InputChat, escape_braces, MODEL


def get_session_history(session_id: str) -> BaseChatMessageHistory:
    return PostgresChatMessageHistory(
        session_id, connection_string="postgresql://postgres:123456@localhost:5432/postgres",
        table_name="chat_message_store"
    )


demonstration = """Human: The Lotka-Volterra workflow solves the classic Lotka-Volterra predator prey dynamics model, which describes the relative populations of a predator and its prey over time using two coupled differential equations: one that describes how predator population changes (dn2/dt = -d*n2 + b*n1*n2); and one that describes how prey population changes (dn1/dt = r*n1 - a*n1*n2). The results are plotted as they are calculated, showing the two populations versus time (using the TimedPlotter) and versus each other (using the XYPlotter).
AI:
Define the differential equation describing the change in predator population: (dn2/dt = -d*n2 + b*n1*n2)
Define the differential equation describing the change in prey population: (dn1/dt = r*n1 - a*n1*n2)
Calculate the solution for equation 1.
Calculate the solution for equation 2.
Present the results showing the evolution of both populations over time.
Present the results illustrating the relationship between the two populations.
"""

# Task Set: {1, 2, 3, 4, 5}
# Task Relationships: {1:{3}, 2:{3}, 3:{4,5}}

CREATE_GAME_PROMPT = """We're going to play a game called 'workflow'. In this game, I will give you a text description, and you need to provide the task extraction separated by newlines.
Ensure that extracted tasks are only one level deep, without nesting and ensure that tasks are broken down into atomic tasks, with each task containing only a single action.
Here is a example for your reference: {Demonstration}  
When I say 'workflow: {{}}', we'll start the game. Do you know how to play this game? If you do, please reply with 'OK' only.
"""

init_prompt = CREATE_GAME_PROMPT.format(Demonstration=escape_braces(demonstration)).replace("{}", "{{}}")

prompt = ChatPromptTemplate.from_messages(
    [
        ("human", init_prompt),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{input}")
    ]
)

chain = prompt | MODEL | StrOutputParser()

create_game_chain_with_history = RunnableWithMessageHistory(
    chain,
    get_session_history,
    input_messages_key="input",
    history_messages_key="history"
).with_types(input_type=InputChat)
