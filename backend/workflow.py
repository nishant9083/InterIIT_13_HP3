# Multi Agent
import threading
import os
from langchain_core.messages import (
    BaseMessage,
    HumanMessage,
)
from socketio_instance import socketio  # Import the socketio instance
from langgraph.graph import END, StateGraph, START
import operator
from typing import Annotated, Sequence
from typing_extensions import TypedDict
from langchain_core.messages import AIMessage
from langgraph.prebuilt import ToolNode

from tools import tool_node
from agents import researcher_node, document_processor_node, synthesizer_node, router_agent
from socketio_instance import socketio
from langchain_core.messages import AIMessageChunk, ToolMessage
retriever = None


class AgentState(TypedDict):
    """
    This defines the object that is passed between each node
    in the graph. We will create different nodes for each agent and tool
    """

    messages: Annotated[Sequence[BaseMessage], operator.add]
    sender: str
    route: bool
    final_answer: str


""" Define Edge Logic

We can define some of the edge logic that is needed to decide what to do based on results of the agents
"""


def router(state):
    # print("\n\nRouter state\n\n", state, end="\n\n")

    messages = state["messages"]
    route = state["route"]
    name = state["sender"]

    # print(f"\n\n Sender: {state.keys()}\n\n")
    if route and name == "Router":
        return "route"
    elif not route and name == "Router":
        return "research"
    if name=="Synthesizer":# and 'final_answer' in list(state.keys()):
        return END
    last_message = messages[-1]
    if last_message.tool_calls:
        return "call_tool"
    if "FINAL ANSWER" in last_message.content:
        return END
    return "continue"


"""
Define the Graph
We can now put it all together and define the graph!
"""

workflow = StateGraph(AgentState)
workflow.add_node("Router", router_agent)
workflow.add_node("Researcher", researcher_node)
workflow.add_node("DocumentProcessor", document_processor_node)
workflow.add_node("Synthesizer", synthesizer_node)
workflow.add_node("call_tool", tool_node)

# Update conditional edges
workflow.add_conditional_edges(
    "Router",
    router,
    {
        "route": "DocumentProcessor",
        "research": "Researcher",        
    },
)

workflow.add_edge(
    "Researcher",
    END
)

workflow.add_conditional_edges(
    "DocumentProcessor",
    router,
    {
        "continue": "Synthesizer",
        "call_tool": "call_tool",  # Add routing to tool_node        
    },
)

workflow.add_conditional_edges(
    "Synthesizer",
    router,
    {
        "continue": "DocumentProcessor",
        "call_tool": "call_tool",  # Add routing to tool_node
        END: END,
    },
)

# Route back to the original agent after tool execution
workflow.add_conditional_edges(
    "call_tool",
    lambda x: x["sender"],
    {        
        "DocumentProcessor": "DocumentProcessor",     
    },
)

workflow.add_edge(START, "Router")
graph = workflow.compile()


chat_history = []  # Store the conversation history


def run_workflow(query, data_retriever):
    global chat_history  # Access the global chat history
    isFileUploaded = False
    if data_retriever:
        isFileUploaded = True
        print("Retriever is initialized")

    # Append user message to chat history
    chat_history.append(
        HumanMessage(
            content=query,
            isFileUploaded=isFileUploaded,
            retriever=data_retriever,
        )
    )
    try:
        events = graph.stream(
            {
                "messages": chat_history,
            },            
            {"recursion_limit": 10},
            stream_mode="messages"
        )
        for msg, attr in events:
            if msg.content and not isinstance(msg, HumanMessage) and not isinstance(msg, ToolMessage) and attr['langgraph_node'] != 'Router':            
                print(msg.content, end="", flush=True)
                yield f"{msg.content}"
                # socketio.emit("response", {"message": msg.content})  # Emit the message as it is generated
        # yield "[DONE]"


    except Exception as e:
        print(f"error occured: {e}")
        # socketio.emit('response', {'message': "Sorry, I'm having trouble connecting to the server. Please try again later."})
        yield "Sorry, I am unable to process your request at the moment. Please try again later."
        # yield "[DONE]"
        # return str(
        #     "Sorry, I am unable to process your request at the moment. Please try again later."
        # )
    
async def process_messages(message):
    first = True
    inputs = [HumanMessage(content=message)]
    async for msg, metadata in graph.astream({"messages": inputs}, stream_mode="messages"):
        # print('working')
        if msg.content and not isinstance(msg, HumanMessage) and not isinstance(msg, ToolMessage):
            # print(msg.content, end="", flush=True)
            socketio.emit("response", {"message": msg.content})  # Emit the message as it is generated

        if isinstance(msg, AIMessageChunk):
            if first:
                gathered = msg
                first = False
            else:
                gathered = gathered + msg

            # if msg.tool_call_chunks:
            #     print(gathered.tool_calls)

# To run the async function
# import asyncio
# asyncio.run(process_messages())
# run_workflow("What is closing price of sensex?", None)