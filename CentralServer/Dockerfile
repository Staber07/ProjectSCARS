FROM python:3.13-slim

WORKDIR /app

# Install uv
RUN pip install uv

# Copy project files
COPY . .

# Install dependencies
RUN uv sync --no-dev

EXPOSE 8081

# Start the server
CMD ["uv", "run", "fastapi", "dev", "centralserver", "--host", "0.0.0.0", "--port", "8081"]