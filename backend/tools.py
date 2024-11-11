from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.tools import tool
from langchain_experimental.utilities import PythonREPL
import operator
from typing import Annotated, Sequence
from typing_extensions import TypedDict
from langgraph.prebuilt import ToolNode
import os
import datetime
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
"""
Define tools
We will also define some tools that our agents will use in the future
"""

os.environ["TAVILY_API_KEY"] = "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"
tavily_tool = TavilySearchResults(max_results=5)
repl = (
    PythonREPL()
)  # Warning: This executes code locally, which can be unsafe when not sandboxed


@tool
def python_repl(
    code: Annotated[str, "The python code to execute to generate your chart."],
):
    """Use this to execute python code. If you want to see the output of a value,
    you should print it out with `print(...)`. This is visible to the user."""
    try:
        result = repl.run(code)
    except BaseException as e:
        return f"Failed to execute. Error: {repr(e)}"
    result_str = f"Successfully executed:\n```python\n{code}\n```\nStdout: {result}"
    return (
        result_str + "\n\nIf you have completed all tasks, respond with FINAL ANSWER."
    )

@tool
def retrieve_documents(query: str ):
    """Searches for documents related to a given query."""
    db = FAISS.load_local("./vector_db", OpenAIEmbeddings(), allow_dangerous_deserialization=True)
    retriever = db.as_retriever()
    print('retriever', 'faiss-cpu')
    if retriever is None:
        return "Retriever is not initialized."
    try:
        docs = retriever.invoke(query)
        return [doc.page_content for doc in docs]
    except Exception as e:
        return f"Failed to retrieve documents. Error: {repr(e)}"
    
@tool
def user_file_retriever_tool(query: str ):
    """Searches for documents related to a given query on a user file."""
    db = FAISS.load_local("./vector_db", OpenAIEmbeddings())
    retriever = db.as_retriever()
    print('retriever', 'faiss')
    if retriever is None:
        return "Retriever is not initialized."
    try:
        docs = retriever.invoke(query)
        return [doc.page_content for doc in docs]
    except Exception as e:
        return f"Failed to retrieve documents. Error: {repr(e)}"

@tool
def date_tool():
    """This tool will return the current date and time."""

    return f"The current date and time is {datetime.datetime.now()}"

tools = [tavily_tool, python_repl, retrieve_documents, date_tool, user_file_retriever_tool]
tool_node = ToolNode(tools)