FROM python:3.9-slim
RUN apt-get update
RUN apt-get install ffmpeg libsm6 libxext6  -y
WORKDIR /app
COPY ./req.txt /app/req.txt
RUN pip install -r req.txt
COPY . /app
EXPOSE 8000
CMD ["uvicorn", "server:app", "--reload"]