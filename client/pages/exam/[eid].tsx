import { Sidebar } from "../../components";
import { useState, useEffect, ChangeEvent } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Image from "next/image";

interface Choice {
  [key: string]: string;
}

interface Report {
  [key: string]: {
    score: number;
    choices: Choice;
  };
}

interface ReportRes {
  report: Report;
}

const getReport = async (eid: any) => {
  if (eid) {
    const formData = new FormData();
    formData.append("exam_name", eid);
    const res = await axios.post("http://localhost:8000/get_report", formData);
    return res.data;
  }
};

const downloadReport = async (eid: any) => {
  if (eid) {
    const formData = new FormData();
    formData.append("exam_name", eid);
    const res = await axios.post(
      "http://localhost:8000/download_report",
      formData
    );

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${eid}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};

export default function Exam() {
  const [report, setReport] = useState<ReportRes>({ report: {} });
  const router = useRouter();
  const { eid } = router.query;

  const generateReport = async (eid: any) => {
    if (eid) {
      const formData = new FormData();
      formData.append("exam_name", eid);
      const res = await axios.post(
        "http://localhost:8000/generate_report",
        formData
      );
      setReport(await getReport(eid));
    }
  };

  const handleUpload = async (
    e: ChangeEvent<HTMLInputElement>,
    solutionFile: boolean,
    eid: string
  ) => {
    let file;
    let files;
    if (solutionFile) {
      file = e.target.files?.[0];
    } else {
      files = e.target.files;
      if (files) {
        files = Array.from(files);
      }
    }
    const url = solutionFile
      ? "http://localhost:8000/upload_solution"
      : "http://localhost:8000/upload_multiple_images";

    if (file || files) {
      const formData = new FormData();
      if (file) {
        formData.append("exam_name", eid);
        formData.append("file", file);
      } else {
        formData.append("exam_name", eid);
        // @ts-ignore
        files.forEach((file: any) => {
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
      } catch (err) {
        console.log(err);
      }
    }
  };

  useEffect(() => {
    if (eid) {
      getReport(eid).then((data: any) => {
        setReport(data);
      });
    }
  }, [eid]);

  return (
    <>
      <Sidebar />

      <div className="flex flex-col items-center w-full h-screen">
        <div className="m-8 flex flex-col items-center">
          <h1 className="text-2xl text-center mt-6 tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block  text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-400 xl:inline">
              {eid}
            </span>
          </h1>
        </div>
        <div className="flex flex-col items-start">
          <h1 className="text-2xl text-center mt-6 tracking-tight font-extrabold text-gray-900 sm:text-4xl md:text-4xl">
            <span className="block xl:inline">Actions</span>
          </h1>
          <div className="flex flex-row items-center justify-center w-full">
            <button
              onClick={() => generateReport(eid)}
              className="group relative h-8 w-36 m-2 overflow-hidden rounded-lg bg-white text-md shadow border-cyan-400 border-2"
            >
              Generate Report
            </button>
            <button className="group relative h-8 w-36 m-2 overflow-hidden rounded-lg bg-white text-md shadow border-cyan-400 border-2">
              Upload Solution
              <input
                type="file"
                onChange={(e) => {
                  handleUpload(e, true, eid as string);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </button>
            <button
              onClick={() => generateReport(eid)}
              className="group relative h-8 w-36 m-2 overflow-hidden rounded-lg bg-white text-md shadow border-cyan-400 border-2"
            >
              <input
                type="file"
                onChange={(e) => {
                  handleUpload(e, false, eid as string);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              Upload an Image
            </button>
            <button
              onClick={() => downloadReport(eid)}
              className="group relative h-8 w-36 m-2 overflow-hidden rounded-lg bg-white text-md shadow border-cyan-400 border-2"
            >
              Download CSV
            </button>
          </div>

          <h1 className="text-2xl text-center mt-6 tracking-tight font-extrabold text-gray-900 sm:text-4xl md:text-4xl">
            <span className="block xl:inline">Report</span>
          </h1>

          <div className="flex flex-col items-center justify-center w-full">
            <div className="m-4 grid grid-cols-4 gap-6">
              {Object.keys(report.report).map((key, idx) => {
                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center justify-center w-full"
                  >
                    <Image
                      src={`http://localhost:8000/exam/${eid}/${key}`}
                      alt="Picture of the Exam Image"
                      width={200}
                      height={200}
                    />

                    <div className="flex flex-row w-full">
                      <h1 className="text-xl mt-6 tracking-tight  text-gray-900 sm:text-xl md:text-xl">
                        <span className="block xl:inline">
                          Score: {report.report[key].score}
                        </span>
                        <br />
                        <span className="block xl:inline">{key}</span>
                      </h1>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
