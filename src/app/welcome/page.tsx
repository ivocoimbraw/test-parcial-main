import React from "react";
import Navbar from "@/components/navbar";
import Welcome from "@/components/welcome";

function WelcomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Welcome />
      </main>
    </div>
  );
}

export default WelcomePage;
