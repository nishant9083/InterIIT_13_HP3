from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI
import os
from langchain_anthropic import ChatAnthropic
from huggingface_hub import InferenceClient

from dotenv import load_dotenv
load_dotenv(".env")

# llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash")
llm = ChatOpenAI()
# llm = ChatGroq(
#     model="mixtral-8x7b-32768",
#     temperature=0.7,
#     max_tokens=None,
#     timeout=None,
#     max_retries=2,
#     # other params...
# )
# llm = InferenceClient("meta-llama/Meta-Llama-3-8B-Instruct")
# llm = ChatAnthropic(model="claude-3-5-sonnet-20241022")