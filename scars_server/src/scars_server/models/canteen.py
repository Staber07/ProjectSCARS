from pydantic import BaseModel


class Canteen(BaseModel):
    id: int
    name: str
