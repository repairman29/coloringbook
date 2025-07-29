from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import cv2
import numpy as np
from io import BytesIO
import requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/convert")
async def convert_image(image: UploadFile = File(None), url: str = Form(None)):
    if image:
        contents = await image.read()
    elif url:
        response = requests.get(url)
        contents = response.content
    else:
        return {"error": "No image or URL provided"}

    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blurred, 50, 150)
    inverted = cv2.bitwise_not(edges)

    _, buffer = cv2.imencode('.png', inverted)
    return StreamingResponse(BytesIO(buffer.tobytes()), media_type="image/png")
