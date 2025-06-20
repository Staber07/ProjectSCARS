FROM python:3.13-slim

WORKDIR /app

COPY --from=ghcr.io/astral-sh/uv@sha256:6c1e19020ec221986a210027040044a5df8de762eb36d5240e382bc41d7a9043 /uv /uvx /bin/

COPY ./centralserver ./
COPY ./templates ./
COPY ./pyproject.toml ./
COPY ./uv.lock ./
RUN uv sync --no-dev --locked

EXPOSE 8081

# Start the server
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8081"]
