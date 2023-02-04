import { useState, ChangeEvent } from "react";
import axios from "axios";
import Router from "next/router";

function SetName({ setExamName, createExamFolder }: any) {
  return (
    <>
      <div className="flex flex-col items-center justify-center w-full h-screen">
        <div className="m-8 flex flex-col items-center">
          <h1 className="text-2xl text-center mt-6 tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block xl:inline">Enter </span> <br />
            <span className="block  text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-400 xl:inline">
              Exam Name
            </span>
          </h1>
          <input
            type="text"
            onChange={(e) => setExamName(e.target.value)}
            className="w-full m-8 px-5 py-1 text-gray-700 bg-gray-200 rounded"
          />
          <button
            onClick={() => {
              createExamFolder();
            }}
            className="group relative h-12 w-48 overflow-hidden rounded-lg bg-white text-lg shadow border-cyan-400 border-2"
          >
            Create
          </button>
        </div>
      </div>
    </>
  );
}

export default function CreateExam() {
  const [examName, setExamName] = useState("");
  const [showExamName, setShowExamName] = useState(true);
  const [showUploadFile, setShowUploadFile] = useState(false);
  const [showSolutionFile, setShowSolutionFile] = useState(false);
  const [solutionFile, setSolutionFile] = useState<File | null>(null);
  const [imagesFiles, setImagesFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);


  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSolutionFile(file);
    }
  };

  const handleMultipleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setImagesFiles(Array.from(files));
    }
  };

  const handleUpload = async () => {
    const url = showSolutionFile
      ? "http://localhost:8000/upload_solution"
      : "http://localhost:8000/upload_multiple_images";
    if (solutionFile || imagesFiles.length > 0) {
      setUploading(true);

      const formData = new FormData();
      if (solutionFile) {
        console.log(examName)
        formData.append("exam_name", examName);
        formData.append("file", solutionFile);
      } else {
        formData.append("exam_name", examName);
        imagesFiles.forEach((file) => {
          formData.append("files", file);
        });
      }

      try {
        const res = await axios.post(url, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        console.log(res);
        setUploading(false);
        setSolutionFile(null);
        setImagesFiles([]);
        if (showSolutionFile) {
          setShowSolutionFile(false);
          setShowUploadFile(true);
        } else if (showUploadFile) {
          setShowUploadFile(false);
          Router.push("/");
        }
      } catch (err) {
        console.log(err);
        setUploading(false);
      }
    }
  };

  function createExamFolder() {
    axios
      .post("http://localhost:8000/create_exam", {
        exam_name: examName,
      })
      .then((res) => {
        console.log(res);
        setShowExamName(false);
        setShowSolutionFile(true);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <>
      {showExamName && (
        <SetName
          setExamName={setExamName}
          createExamFolder={createExamFolder}
        />
      )}
      {showSolutionFile && (
        <>
          <div className="flex flex-col items-center justify-center w-full h-screen">
            <div className="m-8 flex flex-col items-center">
              <h1 className="text-2xl text-center mt-6 tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block xl:inline">Upload </span> <br />
                <span className="block  text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-400 xl:inline">
                  Exam Solution
                </span>
              </h1>
              <label
                htmlFor="dropzone-file"
                className="flex flex-col max-w-4xl m-8 items-center 
            justify-center w-full h-40 border-2 border-gray-300 border-dashed 
            rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700
             hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    aria-hidden="true"
                    className="w-10 h-10 mb-3 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    ></path>
                  </svg>

                  <p className="text-sm text-gray-400">
                    Drag and drop your file here
                  </p>
                  <p className="text-sm text-gray-400">or</p>
                  <p className="text-sm text-gray-400">
                    <span className="font-medium text-gray-600 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-400">
                      browse
                    </span>{" "}
                    to upload
                  </p>
                </div>
                <input
                  id="dropzone-file"
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  multiple={false}
                />
              </label>
              <button
                onClick={handleUpload}
                className="group relative h-12 w-48 overflow-hidden rounded-lg bg-white text-lg shadow border-cyan-400 border-2"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </>
      )}
      {showUploadFile && (
        <>
          <div className="flex flex-col items-center justify-center w-full h-screen">
            <div className="m-8 flex flex-col items-center">
              <h1 className="text-2xl text-center mt-6 tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block xl:inline">Upload </span> <br />
                <span className="block  text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-400 xl:inline">
                  Exam Images
                </span>
              </h1>
              <label
                htmlFor="dropzone-file"
                className="flex flex-col max-w-4xl m-8 items-center 
            justify-center w-full h-40 border-2 border-gray-300 border-dashed 
            rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700
             hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    aria-hidden="true"
                    className="w-10 h-10 mb-3 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    ></path>
                  </svg>

                  <p className="text-sm text-gray-400">
                    Drag and drop your file here
                  </p>
                  <p className="text-sm text-gray-400">or</p>
                  <p className="text-sm text-gray-400">
                    <span className="font-medium text-gray-600 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-400">
                      browse
                    </span>{" "}
                    to upload
                  </p>
                </div>
                <input
                  id="dropzone-file"
                  type="file"
                  onChange={handleMultipleFileChange}
                  className="hidden"
                  multiple={true}
                />
              </label>
              <button
                onClick={handleUpload}
                className="group relative h-12 w-48 overflow-hidden rounded-lg bg-white text-lg shadow border-cyan-400 border-2"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
