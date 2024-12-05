from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from tools import (
    tavily_tool,
    python_repl,
    retrieve_documents,
    date_tool,
    user_file_retriever_tool,
    duckduckgo_search,
)
from langchain_core.messages import (
    ToolMessage,
    AIMessage,
)
import functools
from llm import llm


def create_agent(llm, tools, system_message: str):
    """Create an agent."""
    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "You are a Financial Agent in a multi-agent system, responsible for assisting with complex financial analysis, reporting, and strategic decision-making."
                " Use the provided tools for market analysis, financial modeling, data visualization, and trend forecasting to provide accurate, data-driven insights."
                " If you are unable to fully answer, another agent with different tools will assist where you left off."
                " Execute what you can to make progress and provide tailored financial advice and actionable solutions."
                " If you or any of the other agents have the final answer or deliverable, prefix your response with 'FINAL ANSWER:' so the team knows to stop."
                " You have access to the following tools: {tool_names}.\n{system_message}",
            ),
            MessagesPlaceholder(variable_name="messages"),
        ]
    )
    prompt = prompt.partial(system_message=system_message)
    prompt = prompt.partial(tool_names=", ".join([tool.name for tool in tools]))
    return prompt | llm.bind_tools(tools)


def agent_node(state, agent, name):
    """
    Define Agent Nodes
    """
    if name == "Synthesizer":
        # print("-------------------------\n\n")
        # print(f"Agent State: {state}")
        # print("-------------------------\n\n")
        result = agent.invoke(state)
        # print(f"Agent Result: {result}")
        if "FINAL ANSWER" in result.content:
            return {"messages": [result], "final_answer": result.content.split("FINAL ANSWER:")[1].strip(), "sender": name}
        else:
            return {"messages": [result], "sender": name}
        

    result = agent.invoke(state)
    if name == "Researcher":
        return {"messages": [result], "sender": name, "final_answer": result.content}
    # print("-------------------------\n\n")
    # print("-------------------------\n\n")
    # We convert the agent output into a format that is suitable to append to the global state
    if isinstance(result, ToolMessage):
        pass
    else:
        result = AIMessage(**result.dict(exclude={"type", "name"}), name=name)
    return {
        "messages": [result],
        "sender": name,
    }


router_agents = create_agent(
    llm,
    [user_file_retriever_tool, date_tool],
    system_message="""You are a router agent responsible for directing the conversation flow between different agents and tools. Your primary role is to determine the next step based on the information provided by the agents and tools.

    You have access to the following tools:
    - `user_file_retriever_tool`: This tool searches for documents related to a given query on a user-uploaded file.
    - `date_tool`: This tool provides the current date and time. Use it to provide context or additional information to the user if required.

    Here's your workflow:
    - Your Input: Your input will look as shown below:
    ```
    {
        "messages": [
            {
                "content": "User query or agent response",
                "userFileUploaded": True/False,                
            }
        ]
    }
    ```
    If the user has uploaded a file, `userFileUploaded` will be `True` than you can call `user_file_retriever_tool` to search for documents related to the query.

    If the user has not uploaded a file, you can proceed with the next agent based on the current state.
    Prefix your response with "continue" to proceed to the next agent or tool if userFileUploaded is False. Otherwise, prefix your response with "DocumentProcessor" to call the document processor agent.

    Important Considerations:
    - **Workflow Management:** Ensure the conversation progresses smoothly by directing it to the appropriate agent or tool.
    - **User File Handling:** If the user uploads a file, call the `user_file_retriever_tool` to search for relevant documents.
    - **State Tracking:** Keep track of the conversation state and the sender to determine the next step accurately.    
    """,
)


def router_agent(state):

    user_question = state["messages"][-1].content   
    SYSTEM_PROMT = """
                You are a smart routing agent in a multi-agent system. Your job is to decide 
                whether a given query requires external document/information retrieval or if it can be answered
                directly by reasoning. \n\n
                For queries requiring retrieval, respond with [YES]. For queries answerable without retrieval, respond with [NO].
                Don't provide any additional information. \n\n
        """
    prompt_template = ChatPromptTemplate.from_messages(
        [("system", SYSTEM_PROMT), ("user", "{user_question}")]
    )

    model = prompt_template | llm

    invoke_inputs = {"user_question": user_question}
    response = model.invoke(invoke_inputs)
    if response.content == "[YES]":
        return {"route": True, "sender": "Router"}
    else:
        return {"route": False, "sender": "Router"}


researcher_agent = create_agent(
    llm,
    [date_tool],
    system_message="""You are a financial researcher agent responsible for answering user queries by conducting in-depth research and analysis. If you encounter complex queries that require some clarification or additional information, you can respond as needed.

    Note: Always respond in Markdown format.

""",
)

document_processor_agent = create_agent(
    llm,
    [tavily_tool, duckduckgo_search, date_tool, python_repl],
    system_message="""You are a document processor agent designed to analyze retrieved documents and answer user queries based on their content. 

Here's your workflow:

1. **Document Analysis:**
    - Carefully examine the documents retrieved by the researcher agent. 
    - Extract relevant information from these documents to answer the user's query.

2. **Tavily Search or DuckDuck Search:**
    - If the retrieved documents do not provide sufficient information to answer the query, use the `tavily_tool` or `duckduckgo_search` to perform a web search.
    - Analyze the search results and synthesize an answer based on the information you find.
    - If one tool does not provide satisfactory results, you can try the other tool to gather more information.
    - Cite the source of the information in your response (e.g., "According to [source name]...").


4. **Date and Time:**
    - Use this tool to modify the query to retrieve latest information while using search tool.
    - If the user asks for the current date and time, use the `date_tool` to provide this information.
    - This tool can be used to provide context or additional information to the user or to modify query to get latest information from search tool.

5 **Python REPL:**
    - If you need to execute Python code to gather information or perform specific tasks, use the `python_repl` tool.
    - Provide the code snippet as input to the tool and use the output to enhance your response.
    - If your Python code generates a plot, it will be saved and the file path will be provided in the output.
    - If saved file path is provided, and you have completed all tasks, respond as
     ``` FINAL ANSWER:
        file_path: <file_path>,
        answer: <your answer>.
     ```
Important Considerations:

* **Accuracy:** Prioritize accuracy. Ensure your answer is supported by the information in the retrieved documents or the Tavily search results.
* **Conciseness:** Provide clear and concise answers, avoiding unnecessary details.
* **Source Citation:** When using information from external sources (Tavily search), cite the source in your response.
* **Document Focus:** Your primary focus is on using the provided documents.

Example:

**Input:** (Retrieved documents about climate change)
**Agent:** (Analyzes documents) (provides answer based on documents).

**Input:** (Retrieved documents do not contain information about a specific topic)
**Agent:** (Uses `tavily_tool` to search for information)
""",
)

synthesizer_agent = create_agent(
    llm,
    [date_tool],
    system_message="""You are a synthesizer agent, the final step in an information gathering and answering process. Your task is to carefully consider user_query and all previous information and synthesize a comprehensive final answer to the user's original query. 
    Provide proper reponse with citing sources such as links or documents. 

    Note: Always respond in Markdown format.                  
    """,
)

researcher_node = functools.partial(
    agent_node, agent=researcher_agent, name="Researcher"
)
document_processor_node = functools.partial(
    agent_node, agent=document_processor_agent, name="DocumentProcessor"
)
synthesizer_node = functools.partial(
    agent_node, agent=synthesizer_agent, name="Synthesizer"
)
