import React from "react";
import AppLayout from "@/components/app-layout";
import Navbar from "@/components/navbar";

function RoomPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <AppLayout />
      </main>
    </div>
  );
}

export default RoomPage;
