# Use the official Ubuntu base image
FROM ubuntu:latest

# Update the package list and install prerequisites
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    gnupg2 \
    software-properties-common

# Install Python 10
RUN add-apt-repository ppa:deadsnakes/ppa && \
    apt update && \
    apt install -y python3.10 python3.10-distutils && \
    apt install python3-pip

# Install Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt install -y nodejs

# Set the working directory
WORKDIR /app

# Copy your backend and frontend folders
COPY backend/ backend/
COPY frontend/ frontend/

# Expose ports 3000 and 5000
EXPOSE 3000 5000

# Specify the command to run your application (example)
# CMD ["python3", "app.py"]
