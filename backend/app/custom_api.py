import dotenv
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

from app.utils import escape_braces, MODEL

dotenv.load_dotenv()

demonstration = """This is a description: Get a absolute value of a number.
The output format is as follows: 
{
    "name": "Absolute Value",
    "describe": "The AbsoluteValue reads a scalar value (e.g., an integer, double, etc) and outputs its absolute value. The output will have the same type as the input, unless the input is a complex number. If the input is a complex number, the output type is a double with the same magnitude as the input number."
}
"""

GENERATE_API_PROMPT = """Your task is to generate a `name` and `describe` based on the following description:
Demonstration: {demonstration}
Description: {{description}}
Answer:
"""

prompt = GENERATE_API_PROMPT.format(demonstration=escape_braces(demonstration)).replace("{}", "{{}}")

custom_api_chain = ChatPromptTemplate.from_template(prompt) | MODEL | StrOutputParser()

