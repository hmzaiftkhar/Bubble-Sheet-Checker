from typing import Union
import cv2
import os
import json

from omr import OMR, getScores

from fastapi import FastAPI, File, UploadFile, Request, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

app = FastAPI()


origins = [
    "http://localhost:3000",
    "localhost:3000"
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)


def generateReport(exam_name):
    base_path = f"exams/{exam_name}"
    images = os.listdir(f"{base_path}/images")
    solutionFile = os.listdir(f"{base_path}/solution")
    soultionPath = f"{base_path}/solution/{solutionFile[0]}"
    if os.path.exists(soultionPath):
        print("Solution file found")
    answer = OMR(soultionPath)
    report = {}
    csvReport = "Name,Score,Choices"
    csvReport += f"\nSolution,,{answer}"
    for img in images:
        choices = OMR(f'./{base_path}/images/{img}')
        score = getScores(answer, choices)
        report[img] = {
            "score": score,
            "choices": choices
        }
        csvReport += f"\n{img},{score},{choices}"

    with open(f"{base_path}/report.json", "w") as f:
        json.dump(report, f, indent=4)

    with open(f"{base_path}/report.csv", "w") as f:
        f.write(csvReport)



@app.post("/upload_multiple_images")
async def upload_multiple_images(exam_name: str = Form(...), files: list = File(...)):
    for file in files:
        contents = await file.read()
        with open(f"exams/{exam_name}/images/{file.filename}", "wb") as f:
            f.write(contents)
    return {"success": "Images uploaded"}



@app.post("/upload_solution")
async def upload_solution(exam_name: str = Form(...), file: UploadFile = File(...)):
    # delete existing solution
    solutionFile = os.listdir(f"exams/{exam_name}/solution")
    if len(solutionFile) > 0:
        os.remove(f"exams/{exam_name}/solution/{solutionFile[0]}")

    contents = await file.read()
    with open(f"exams/{exam_name}/solution/{file.filename}", "wb") as f:
        f.write(contents)
    return {"success": "Solution uploaded"}


@app.post("/create_exam")
async def create_exam(exam_name: Request):
    exam_name = await exam_name.json()
    exam_name = exam_name["exam_name"]
    if not os.path.exists("exams"):
        os.mkdir("exams")

    if not os.path.exists(f"exams/{exam_name}"):
        os.mkdir(f"exams/{exam_name}") 
        os.mkdir(f"exams/{exam_name}/images")
        os.mkdir(f"exams/{exam_name}/solution")
    else:
        return {"error": "Exam already exists"}

    return {"success": "Exam created"}

@app.get("/get_exams")
async def get_exam():
    if not os.path.exists("exams"):
        os.mkdir("exams")
    return {"exams": os.listdir("exams")}

@app.post("/get_exam")
async def get_exam(exam_name: str = Form(...)):
    if not os.path.exists(f"exams/{exam_name}"):
        return {"error": "Exam does not exist"}
    else:
        images = os.listdir(f"exams/{exam_name}/images")
        solution = os.listdir(f"exams/{exam_name}/solution")
    
        return {"images": images, "solution": solution}


@app.post("/generate_report")
async def generate_report(exam_name: str = Form(...)):
    if not os.path.exists(f"exams/{exam_name}"):
        return {"error": "Exam does not exist"}
    else:
        generateReport(exam_name)
        return {"success": "Report generated"}

@app.post("/get_report")
async def get_report(exam_name: str = Form(...)):
    if not os.path.exists(f"exams/{exam_name}"):
        return {"error": "Exam does not exist"}
    else:
        with open(f"exams/{exam_name}/report.json", "r") as f:
            report = json.load(f)
        return {"report": report}

@app.get("/exam/{exam_name}/{image_name}")
async def get_exam_image(exam_name: str, image_name: str):
    return FileResponse(f"exams/{exam_name}/images/{image_name}")

@app.post("/download_report")
async def download_report(exam_name: str = Form(...)):
    if not os.path.exists(f"exams/{exam_name}"):
        return {"error": "Exam does not exist"}
    else:
        return FileResponse(f"exams/{exam_name}/report.csv")