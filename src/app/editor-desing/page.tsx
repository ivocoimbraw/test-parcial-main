import type { Metadata } from "next";
import AppLayout from "@/components/app-layout";
import Navbar from "@/components/navbar";

export const metadata: Metadata = {
  title: "Flutter UI Designer",
  description: "Visually design and export Flutter UI components",
};

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <AppLayout />
      </main>
    </div>
  );
}
