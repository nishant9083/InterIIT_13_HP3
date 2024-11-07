# Multi Agent

import getpass
import os


def _set_if_undefined(var: str):
    if not os.environ.get(var):
        os.environ[var] = getpass.getpass(f"Please provide your {var}")


# _set_if_undefined("OPENAI_API_KEY")
# _set_if_undefined("TAVILY_API_KEY")
os.environ["TAVILY_API_KEY"] ="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"


from langchain_core.messages import (
    BaseMessage,
    HumanMessage,
    ToolMessage,
)
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

from langgraph.graph import END, StateGraph, START


def create_agent(llm, tools, system_message: str):
    """Create an agent."""
    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "You are a helpful AI assistant, collaborating with other assistants."
                " Use the provided tools to progress towards answering the question."
                " If you are unable to fully answer, that's OK, another assistant with different tools "
                " will help where you left off. Execute what you can to make progress."
                " If you or any of the other assistants have the final answer or deliverable,"
                " prefix your response with FINAL ANSWER so the team knows to stop."
                " You have access to the following tools: {tool_names}.\n{system_message}",
            ),
            MessagesPlaceholder(variable_name="messages"),
        ]
    )
    prompt = prompt.partial(system_message=system_message)
    prompt = prompt.partial(tool_names=", ".join([tool.name for tool in tools]))
    return prompt | llm.bind_tools(tools)

"""## Define tools

We will also define some tools that our agents will use in the future
"""

from typing import Annotated

from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.tools import tool
from langchain_experimental.utilities import PythonREPL

tavily_tool = TavilySearchResults(max_results=5)

# Warning: This executes code locally, which can be unsafe when not sandboxed

repl = PythonREPL()


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

"""## Create graph

Now that we've defined our tools and made some helper functions, will create the individual agents below and tell them how to talk to each other using LangGraph.

### Define State

We first define the state of the graph. This will just a list of messages, along with a key to track the most recent sender
"""

# !pip install langchain_google_genai

import getpass
import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq

os.environ["GOOGLE_API_KEY"] = "AIzaSyB6bdzQZsuElP36rCyVGYQ5NZrgIaMiFOg"
os.environ["GROQ_API_KEY"] = "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"
# llm=model
llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash")
# llm = ChatGroq(
#     model="llama-3.1-70b-versatile",
#     temperature=0,
#     max_tokens=None,
#     timeout=None,
#     max_retries=2,
#     # other params...
# )
# result = llm.invoke("Write a ballad about LangChain")
# print(result.content)

import operator
from typing import Annotated, Sequence
from typing_extensions import TypedDict




# This defines the object that is passed between each node
# in the graph. We will create different nodes for each agent and tool
class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]
    sender: str

"""### Define Agent Nodes

We now need to define the nodes. First, let's define the nodes for the agents.
"""

import functools

from langchain_core.messages import AIMessage


# Helper function to create a node for a given agent
def agent_node(state, agent, name):
    result = agent.invoke(state)
    # We convert the agent output into a format that is suitable to append to the global state
    if isinstance(result, ToolMessage):
        pass
    else:
        result = AIMessage(**result.dict(exclude={"type", "name"}), name=name)
    return {
        "messages": [result],
        # Since we have a strict workflow, we can
        # track the sender so we know who to pass to next.
        "sender": name,
    }




# Research agent and node
research_agent = create_agent(
    llm,
    [tavily_tool],
    system_message="You should provide accurate data for the chart_generator to use.",
)
research_node = functools.partial(agent_node, agent=research_agent, name="Researcher")

# chart_generator
chart_agent = create_agent(
    llm,
    [python_repl],
    system_message="Any charts you display will be visible by the user.",
)
chart_node = functools.partial(agent_node, agent=chart_agent, name="chart_generator")

"""### Define Tool Node

We now define a node to run the tools
"""

from langgraph.prebuilt import ToolNode

tools = [tavily_tool, python_repl]
tool_node = ToolNode(tools)

"""### Define Edge Logic

We can define some of the edge logic that is needed to decide what to do based on results of the agents
"""

# Either agent can decide to end
from typing import Literal


def router(state):
    # This is the router
    messages = state["messages"]
    last_message = messages[-1]
    if last_message.tool_calls:
        # The previous agent is invoking a tool
        return "call_tool"
    if "FINAL ANSWER" in last_message.content:
        # Any agent decided the work is done
        return END
    return "continue"

"""### Define the Graph

We can now put it all together and define the graph!
"""

workflow = StateGraph(AgentState)

workflow.add_node("Researcher", research_node)
workflow.add_node("chart_generator", chart_node)
workflow.add_node("call_tool", tool_node)

workflow.add_conditional_edges(
    "Researcher",
    router,
    {"continue": "chart_generator", "call_tool": "call_tool", END: END},
)
workflow.add_conditional_edges(
    "chart_generator",
    router,
    {"continue": "Researcher", "call_tool": "call_tool", END: END},
)

workflow.add_conditional_edges(
    "call_tool",
    # Each agent node updates the 'sender' field
    # the tool calling node does not, meaning
    # this edge will route back to the original agent
    # who invoked the tool
    lambda x: x["sender"],
    {
        "Researcher": "Researcher",
        "chart_generator": "chart_generator",
    },
)
workflow.add_edge(START, "Researcher")
graph = workflow.compile()

# from IPython.display import Image, display

# try:
#     display(Image(graph.get_graph(xray=True).draw_mermaid_png()))
# except Exception:
#     # This requires some extra dependencies and is optional
#     pass

"""## Invoke

With the graph created, you can invoke it! Let's have it chart some stats for us.
"""

# events = graph.stream(
#     {
#         "messages": [
#             HumanMessage(
#                 content="Todays stock market price of IRCTC"
#             )
#         ],
#     },
#     # Maximum number of steps to take in the graph
#     {"recursion_limit": 100},
# )
# for s in events:
#     print(s)
#     print("----")


chat_history = []  # Store the conversation history

def run_workflow(query):
    global chat_history  # Access the global chat history

    # Append user message to chat history
    chat_history.append(HumanMessage(content=query))
    try:
        events = graph.stream(
            {
                "messages": chat_history,  # Pass history to the workflow
            },
            # Maximum number of steps to take in the graph
            {"recursion_limit": 50},
        )

        final_response = ""  # Store the final response

        for s in events:
            if "FINAL ANSWER" in s[list(s.keys())[0]]['messages'][-1].content:
                final_response = s[list(s.keys())[0]]['messages'][-1].content
                # Append agent's response to chat history
                chat_history.append(s[list(s.keys())[0]]['messages'][-1])
                break  # Exit loop when final answer is found

        return final_response
    except Exception as e:
        print(f"error occured: {e}")
        return str("Sorry, I am unable to process your request at the moment. Please try again later.")
