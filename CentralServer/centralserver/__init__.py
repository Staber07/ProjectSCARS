from fastapi import FastAPI

app: FastAPI = FastAPI()


@app.get("/healthcheck")
async def root():
    return {"message": "Healthy"}
