'''
Author: Weilin Du
Date: 2024-06-21 11:05:26
LastEditors: Weilin Du
LastEditTime: 2024-06-21 13:44:16
FilePath: \LLM4Workflow\backend\app\utils.py
Description: 
'''
import re
from pathlib import Path
from typing import Callable, Union

from fastapi import HTTPException
from langchain.memory import FileChatMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_openai import ChatOpenAI
from langserve.pydantic_v1 import BaseModel, Field

VECTOR_BASE_PATH = "YOUR VECTOR DATABASE PATH"
MODEL = ChatOpenAI(model='gpt-4-turbo', temperature=0, streaming=True)


class InputChat(BaseModel):
    """Input for the chat endpoint."""
    
    input: str = Field(
        ...,
        description="The human input to the chat system.",
        extra={"widget": {"type": "chat", "input": "input"}},
    )


def _is_valid_identifier(value: str) -> bool:
    """Check if the session ID is in a valid format."""
    # Use a regular expression to match the allowed characters
    valid_characters = re.compile(r"^[a-zA-Z0-9-_]+$")
    return bool(valid_characters.match(value))


def create_session_factory(
        base_dir: Union[str, Path],
) -> Callable[[str], BaseChatMessageHistory]:
    """Create a session ID factory that creates session IDs from a base dir.

    Args:
        base_dir: Base directory to use for storing the chat histories.

    Returns:
        A session ID factory that creates session IDs from a base path.
    """
    base_dir_ = Path(base_dir) if isinstance(base_dir, str) else base_dir
    if not base_dir_.exists():
        base_dir_.mkdir(parents=True)

    def get_chat_history(session_id: str) -> FileChatMessageHistory:
        """Get a chat history from a session ID."""
        if not _is_valid_identifier(session_id):
            raise HTTPException(
                status_code=400,
                detail=f"Session ID `{session_id}` is not in a valid format. "
                       "Session ID must only contain alphanumeric characters, "
                       "hyphens, and underscores.",
            )
        file_path = base_dir_ / f"{session_id}.json"
        return FileChatMessageHistory(str(file_path))

    return get_chat_history


def get_message_history(session_id: str):
    return


def escape_braces(prompt: str) -> str:
    """Format the prompt to be compatible with the LLM."""
    return prompt.replace("{", "{{").replace("}", "}}")


def get_json_data(file_path):
    import json
    with open(file_path, 'r') as file:
        data = json.load(file)
    return data
