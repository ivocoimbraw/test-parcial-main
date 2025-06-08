"use client";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { TabsGenerator } from "./tobs-generator";
import { useAuthStore } from "@/lib/useAuthStore";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isSharing, setIsSharing] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);

  const handleLogout = () => {
    // Lógica de cerrar sesión
    console.log("Cerrando sesión...");
    useAuthStore.getState().logout();
    router.push("/");
  };

  const handleShare = async () => {
    setIsSharing(true);

    try {
      // Obtener la URL actual desde el pathname
      const urlShare = typeof window !== "undefined" ? `${window.location.origin}${pathname}` : "";

      // Simular guardado del proyecto en servidor
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setShareLink(urlShare);
      setShowShareModal(true);
    } catch (error) {
      console.error("Error al generar enlace:", error);
    } finally {
      setIsSharing(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      // Aquí podrías mostrar una notificación de éxito
      console.log("Enlace copiado al portapapeles");
    } catch (error) {
      console.error("Error al copiar:", error);
    }
  };

  const showTabsGenerator = pathname?.includes("/editor-desing");

  return (
    <>
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
              {/* Botón de Compartir */}
              {showTabsGenerator && (
                <button
                  onClick={handleShare}
                  disabled={isSharing}
                  className="relative group px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 rounded-xl text-blue-300 hover:text-white transition-all duration-300 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 flex items-center space-x-2">
                    {isSharing ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                        />
                      </svg>
                    )}
                    <span>{isSharing ? "Generando..." : "Compartir"}</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/20 group-hover:to-cyan-500/20 rounded-xl transition-all duration-300"></div>
                </button>
              )}

              {/* Botón de Logout */}
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

      {/* Modal de Compartir */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-gray-900/90 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Compartir Proyecto
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-gray-300 text-sm">Cualquier persona con este enlace podrá ver tu proyecto:</p>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 bg-black/50 border border-purple-500/30 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-purple-400"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-3 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-lg text-purple-300 hover:text-white transition-all duration-300 text-sm"
                >
                  Copiar
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>✓ Enlace válido por 7 días</span>
                <span>✓ Solo lectura</span>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => {
                    // Compartir en redes sociales o apps
                    if (navigator.share) {
                      navigator.share({
                        title: "Mi proyecto ASOCIAL",
                        text: "Mira mi proyecto creado en ASOCIAL",
                        url: shareLink,
                      });
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-lg text-green-300 hover:text-white transition-all duration-300 text-sm"
                >
                  Compartir
                </button>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-gray-500/20 to-gray-600/20 border border-gray-400/30 rounded-lg text-gray-300 hover:text-white transition-all duration-300 text-sm"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
const App = () => {
  return (
    <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <Navbar />
    </div>
  );
};

export default App;
