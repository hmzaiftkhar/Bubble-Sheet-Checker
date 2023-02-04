import Head from "next/head";
import Image from "next/image";
import { Sidebar, CreateExam } from "../components";

export default function Home() {
  return (
    <>
      <Sidebar />
      <CreateExam />
    </>
  );
}
