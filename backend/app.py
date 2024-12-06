from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from workflow import run_workflow, process_messages
import os
# from socketio_instance import app, socketio  # Import the socketio instance
import asyncio

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


def async_example():
    # Simulate async task

    socketio.emit("response", {"message": "hello boy!!!"}, namespace="/c")
    return "hello how are you???"
    # return jsonify({'message': 'Async example complete!'})


@app.route("/api/chat", methods=["POST"])
async def chat():
    try:
        message = request.form.get("message", "")
        file = request.files.get("file")

        file_info = ""
        if file:
            filename = file.filename
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            file.save(file_path)
            file_info = f"\n\nReceived file: {filename}"

        user_message = message.lower()
        import time
        def generate():
            for i in range(5):  # Simulate streaming data
                yield f"Chunk {i}\n"
                time.sleep(1)  # Simulate some delay
            yield "[END]"  # Special marker to indicate the end of the stream

        return Response(generate(), content_type='text/plain' ,mimetype='text/event-stream')
        # process_messages(user_message)
        # task.join()
        # run_workflow(user_message, None)
        # return Response(
        #     run_workflow(user_message, None), content_type="text/plain; charset=utf-8"
        # )
    except Exception as e:
        print(e)
    # socketio.emit('end_response', {'message': 'end'})
    # return jsonify({"response": 'ok'})


# @socketio.on("connect")
# def handle_connect():
#     print("Client connected")


# @socketio.on("disconnect")
# def handle_disconnect():
#     print("Client disconnected")


@app.errorhandler(Exception)
def handle_error(e):
    # Handle unexpected errors to avoid crashes
    print(f"An error occurred: {e}")
    return "Error", 500


if __name__ == "__main__":
    try:
        app.run(debug=True, host="127.0.0.1")
        # socketio.run(app,debug=True,host='127.0.0.1', port=5000, allow_unsafe_werkzeug=True)
    except:
        print("Error occured")
