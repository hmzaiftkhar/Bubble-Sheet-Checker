import { useState, ChangeEvent } from "react";
import axios from "axios";

export default function UploadFile() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("Choose File");
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      setFileName(file.name);
    }
  };

  const handleUpload = async () => {
    if (file) {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await axios.post("http://localhost:8000/save_image", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (e) => {
            setProgress(Math.round((e.loaded * 100) / e.total!));
          },
        });
        console.log(res);
        setUploading(false);
      } catch (err) {
        console.log(err);
        setUploading(false);
      }
      
    }
  };

  return (
    <div>
      {/* center div */}
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <label
          htmlFor="dropzone-file"
          className="flex flex-col max-w-4xl items-center 
          justify-center w-full h-64 border-2 border-gray-300 border-dashed 
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
            {file ? (
              <>
                <p className="text-sm text-gray-400">{fileName} </p>

                {progress > 0 && (
                  <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                    <div
                      className="h-full text-center text-xs text-white bg-blue-500 rounded-full"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                )}
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
          <input
            id="dropzone-file"
            type="file"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
        <button
          className=" bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700
            hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 text-white font-bold my-2 py-2 px-4 rounded"
          onClick={handleUpload}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {/* <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading}>
        Upload
      </button> */}
    </div>
  );
}
