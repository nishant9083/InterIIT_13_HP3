from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI
import os

os.environ["OPENAI_API_KEY"] = "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"


# llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash")
llm = ChatOpenAI()
# llm = ChatGroq(
#     model="llama-3.1-70b-versatile",
#     temperature=0,
#     max_tokens=None,
#     timeout=None,
#     max_retries=2,
#     # other params...
# )