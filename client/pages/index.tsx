import Head from "next/head";
import Image from "next/image";
import { Sidebar, Dashboard } from "../components";

export default function Home() {
  return (
    <>
      <Sidebar />
      <Dashboard />
    </>
  );
}
