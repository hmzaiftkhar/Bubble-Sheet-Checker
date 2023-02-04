import Link from "next/link";

export default function Dashboard() {
  return (
    <>
      <div className="flex flex-col items-center justify-center w-full h-screen">
        <div className="m-8">
          <button className="group relative h-12 w-48 overflow-hidden rounded-lg bg-white text-lg shadow">
            <div className="absolute inset-0 w-3 bg-gradient-to-r from-sky-600 to-cyan-400 transition-all duration-[250ms] ease-out group-hover:w-full"></div>
            <span className="relative text-black group-hover:text-white">
              <Link href="/create">Create New Exam</Link>
            </span>
          </button>
        </div>
        <div className="m-8">
          <button className="group relative h-12 w-48 overflow-hidden rounded-lg bg-white text-lg shadow">
            <div className="absolute inset-0 w-3 bg-gradient-to-r from-sky-600 to-cyan-400 transition-all duration-[250ms] ease-out group-hover:w-full"></div>
            <span className="relative text-black group-hover:text-white">
              <Link href="/exams">Check All Exams</Link>
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
