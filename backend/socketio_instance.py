from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv(".env")

app = Flask(__name__)
CORS(app, origins=['*'])
socketio = SocketIO(app, cors_allowed_origins="*", ping_timeout=10, ping_interval=5)

# Export the app and socketio instances
__all__ = ['app', 'socketio']