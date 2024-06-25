import dotenv
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

from app.utils import escape_braces, MODEL

dotenv.load_dotenv()

demonstration = """```xml
<?xml version="1.0" encoding="GB2312"?>
<adga jobCount="4" version="1.0">
<job id="1" name="add two numbers">
</job>
<job id="2" name="input a">
</job>
<job id="3" name="input b">
</job>
<job id="4" name="output result">
</job>
<child ref="1">
<parent ref="2"/>
<parent ref="3"/>
</child>
<child ref="4">
<parent ref="1"/>
</child>
</adga>```"""

WRITE_XML_PROMPT = """You're a scientific workflow expert, and your role involves: 
1. Analyzing the following workflow dag description, but you don't need to return them to me.
2. Outputting the workflow xml in the following xml markdown format.
Demonstration: {demonstration}

Don't output anything for step 1, only the answer in step 2. Let's work this out in a step by step way to be sure we have the right answer.

dag description: {{dag}}
Answer:
"""

init_prompt = WRITE_XML_PROMPT.format(demonstration=escape_braces(demonstration)).replace("{}", "{{}}")

write_xml_chain = ChatPromptTemplate.from_template(init_prompt) | MODEL | StrOutputParser()