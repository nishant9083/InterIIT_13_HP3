from typing import List
from flask import Flask, request  # 1
from flask_socketio import SocketIO  # 2
from gemini import run_workflow


app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

def gemini_response(query):
    response = run_workflow(query)
    response = response.split("FINAL ANSWER:")[1].strip()    
    socketio.emit("response", {"message": response})


@socketio.on("message")
def handle_query(message):
    print(message)
    
    gemini_response(message)
    
    socketio.emit("end", {"message": "STOP"})
    # return 'Query received and processing.'


@socketio.on("connect")
def handle_connect():
    print("Client connected")


if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", allow_unsafe_werkzeug=True)  # 3
