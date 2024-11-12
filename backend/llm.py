from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI
import os

from dotenv import load_dotenv
load_dotenv(".env")

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