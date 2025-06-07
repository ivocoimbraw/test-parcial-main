"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { TabsGenerator } from "./tobs-generator";
import { useAuthStore } from "@/lib/useAuthStore";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    // Lógica de cerrar sesión
    console.log("Cerrando sesión...");
    useAuthStore.getState().logout();
    router.push("/");
  };

  const showTabsGenerator = pathname?.includes("/editor-desing");

  return (
    <nav className="relative z-10 backdrop-blur-xl bg-black/30 border-b border-purple-500/30 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center ">
            <div className="relative">
              <div className="text-2xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                ◉ ASOCIAL
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-lg blur opacity-60"></div>
            </div>
          </div>

          {showTabsGenerator && (
            <div className="flex justify-between items-center relative z-20">
              <div className="flex items-center gap-3">
                <TabsGenerator />
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <button
              onClick={handleLogout}
              className="relative group px-4 py-2 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-400/30 rounded-xl text-red-300 hover:text-white transition-all duration-300 backdrop-blur-sm"
            >
              <span className="relative z-10 flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Logout</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 to-pink-500/0 group-hover:from-red-500/20 group-hover:to-pink-500/20 rounded-xl transition-all duration-300"></div>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Componente de demostración con fondo simple
const App = () => {
  return (
    <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <Navbar />
    </div>
  );
};

export default App;
