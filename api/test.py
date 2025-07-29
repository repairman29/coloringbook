from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI()

@app.get("/api/test")
async def test():
    return {"message": "Hello World"}

@app.get("/")
async def root():
    return {"message": "API is working"} 