import { Sidebar } from "../components";
import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

async function getData() {
  const res = await axios.get("http://localhost:8000/get_exams");
  return res.data;
}

export default function Home() {
  const [exams, setExams] = useState([]);
  useEffect(() => {
    getData().then((data) => {
      setExams(data.exams);
      console.log(data);
    });
  }, []);

  return (
    <>
      <Sidebar />
      <div className="flex flex-col items-center w-full h-screen">
        <div className="m-8 flex flex-col items-center">
          <h1 className="text-2xl text-center mt-6 tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block  text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-400 xl:inline">
              All Exams
            </span>
          </h1>

          <div className="flex flex-col items-center justify-center w-full">
            <div className="m-12 grid grid-cols-2 gap-6">
              {exams.map((exam, key) => (
                <Link key={key} href={`/exam/${exam}`}>
                  <button
                    className="group relative h-12 w-48 overflow-hidden rounded-lg bg-white text-lg shadow border-cyan-400 border-2"
                  >
                    {exam}
                  </button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
