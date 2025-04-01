from fastapi import FastAPI

from centralserver import info
from centralserver.routers import reports, users

app = FastAPI(debug=info.Program.debug, title=info.Program.name)


app.include_router(users.router)
app.include_router(reports.router)


@app.get("/healthcheck")
async def root():
    return {"message": "Healthy"}
