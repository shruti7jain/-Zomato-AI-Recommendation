# Use the official lightweight Python image
FROM python:3.11-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file from the backend folder
COPY backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy all the backend code into the container
COPY backend/ .

# Start the FastAPI application using the PORT environment variable provided by Railway
CMD sh -c "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"
