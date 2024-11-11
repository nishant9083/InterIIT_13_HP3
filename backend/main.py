from typing import List
from flask import Flask, request  
from flask_socketio import SocketIO 
from gemini import run_workflow
import base64
import os
from online_data_process import create_retriever_from_pdf
from dotenv import load_dotenv

load_dotenv("./.env")

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

retriever = None

def gemini_response(query):
    # retriever
    while retriever is None:
        continue

    print(retriever, "hi nishant")
    response = run_workflow(query, retriever)
    print("Response:", response)
    response = response.split("FINAL ANSWER:")[1].strip()
    socketio.emit("response", {"message": response})


# Track uploaded files in memory for simplicity
file_chunks = {}

@socketio.on('file_start')
def handle_file_start(data):
    file_name = data['fileName']
    text = data['text']
    file_chunks[file_name] = {
        'text': text,
        'chunks': [],
        'total_chunks': None
    }
    print(f"Receiving file: {file_name} with initial text: {text}")

@socketio.on('file_chunk')
def handle_file_chunk(data):
    file_name = data['fileName']
    chunk_number = data['chunkNumber']
    total_chunks = data['totalChunks']
    chunk_data = base64.b64decode(data['chunk'])

    if file_name in file_chunks:
        file_chunks[file_name]['chunks'].append((chunk_number, chunk_data))
        if file_chunks[file_name]['total_chunks'] is None:
            file_chunks[file_name]['total_chunks'] = total_chunks

    print(f"Received chunk {chunk_number + 1}/{total_chunks} for file: {file_name}")

@socketio.on('file_complete')
def handle_file_complete(data):
    global retriever
    file_name = data['fileName']
    if file_name in file_chunks:
        # Sort chunks by chunk number and write to file
        sorted_chunks = sorted(file_chunks[file_name]['chunks'], key=lambda x: x[0])
        file_path = os.path.join("uploads", file_name)
        
        with open(file_path, "wb") as f:
            for _, chunk in sorted_chunks:
                f.write(chunk)
        
        print(f"File {file_name} assembled and saved.")
        # Clean up file_chunks dictionary
        del file_chunks[file_name]
        retriever = create_retriever_from_pdf(file_path)        

    socketio.emit('file-status', {'status': f'File {file_name} received and saved successfully.'})


@socketio.on("message")
def handle_query(data):
    message = data
    gemini_response(message)

    socketio.emit("end", {"message": "STOP"})
    # return 'Query received and processing.'


@socketio.on("connect")
def handle_connect():
    print("Client connected")


@socketio.on("disconnect")
def handle_disconnect():
    print("Client disconnected")
    os.system("rm -rf uploads/*")



if __name__ == "__main__":    
    socketio.run(app, host="0.0.0.0", allow_unsafe_werkzeug=True)
