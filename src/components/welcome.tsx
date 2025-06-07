"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/useAuthStore";
import { set } from "react-hook-form";
import { API_ROUTES } from "@/routes/api.routes";
import { useDesignerStore } from "@/lib/store";

interface Room {
  id: number;
  name: string;
  createdAt: string;
}

export default function Welcome({ rooms = [] }) {
  const router = useRouter();

  const [userRooms, setUserRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  // Estado para controlar el modal de crear sala
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const { user, error } = useAuthStore.getState();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const { pages } = useDesignerStore();

  useEffect(() => {
    const fetchUserRooms = async () => {
      try {
        setLoading(true);
        let token = null;
        if (typeof window !== "undefined") {
          token = localStorage.getItem("token");
        }
        if (user && !error && token) {
          const response = await fetch(API_ROUTES.GET_ROOMS_USER.url, {
            method: API_ROUTES.GET_ROOMS_USER.method,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error("Error al obtener las salas");
          }

          const data = await response.json();
          console.log(data);
          setUserRooms(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchUserRooms();
    } else {
      setUserRooms([]);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleCreateRoom = () => {
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setNewRoomName("");
  };

  const handleConfirmCreate = async () => {
    if (!newRoomName.trim()) return;

    setIsCreating(true);

    try {
      let token = null;
      if (typeof window !== "undefined") {
        token = localStorage.getItem("token");
      }

      const body = {
        name: newRoomName.trim(),
        datosJson: JSON.stringify(pages),
      };
      const response = await fetch(API_ROUTES.CREATE_ROOM_USER.url, {
        method: API_ROUTES.CREATE_ROOM_USER.method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        throw new Error("Error al crear la sala");
      }
      const newRoom = await response.json();
      setUserRooms([...userRooms, newRoom]);
      setShowCreateModal(false);
      setNewRoomName("");
      setIsCreating(false);
      router.push(`/editor-desing/${newRoom.id}`);
    } catch (error) {
      console.error(error);
      setIsCreating(false);
    }
  };

  const handleEnterRoom = (roomId) => {
    router.push(`/editor-desing/${roomId}`);
  };

  const handleLogout = () => {
    // Lógica de cerrar sesión
    console.log("Cerrando sesión...");
    useAuthStore.getState().logout();
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-cyan-900/20"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>

      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(rgba(59, 130, 246, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.5) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      ></div>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl sm:text-6xl font-black mb-2 bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
            WELCOME
          </h1>
          <p className="mt-4 text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
            {user?.name ?? "Usuario"}
          </p>
          <div className="mt-8 flex justify-center">
            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full"></div>
          </div>
        </div>

        <div className="flex justify-center mb-16">
          <button
            onClick={handleCreateRoom}
            className="group relative overflow-hidden bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 p-1 rounded-2xl transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
          >
            <div className="relative bg-black rounded-xl px-10 py-4 transition-all duration-300 group-hover:bg-gray-900/50">
              <div className="flex items-center justify-center space-x-3 text-white">
                <div className="relative">
                  <svg
                    className="w-6 h-6 transition-transform duration-300 group-hover:rotate-90"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <div className="absolute inset-0 bg-cyan-400/50 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-cyan-200 to-purple-200 bg-clip-text text-transparent">
                  CREATE ROOM
                </span>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-cyan-500/20 group-hover:via-purple-500/20 group-hover:to-pink-500/20 rounded-2xl transition-all duration-500"></div>
          </button>
        </div>

        <div className="mb-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
              YOUR ACTIVE ROOMS
            </h2>
            <div className="mt-4 flex justify-center">
              <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full"></div>
            </div>
          </div>

          {userRooms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userRooms.map((room, index) => (
                <div
                  key={room.id}
                  className="group relative overflow-hidden bg-gradient-to-br from-gray-900/80 via-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl border border-purple-500/20 hover:border-cyan-400/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/10"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="relative p-8">
                    {/* Información de la sala */}
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-200 transition-colors duration-300">
                        {room.name}
                      </h3>
                      <div className="flex items-center space-x-2 text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        {/* <Link
                          href={`/editor-desing/${room.id}`}
                          className="text-sm font-medium text-cyan-300 hover:underline"
                        >
                          View room {room.id}
                        </Link> */}
                        <p className="text-gray-400 text-sm">Creado el {room.createdAt}</p>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEnterRoom(room.id)}
                        className="flex-1 relative overflow-hidden bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 text-cyan-300 py-3 px-4 rounded-xl font-semibold transition-all duration-300 hover:from-cyan-500/30 hover:to-blue-500/30 hover:text-white hover:shadow-lg hover:shadow-cyan-500/20"
                      >
                        <span className="relative z-10">CONNECT</span>
                      </button>
                      <button className="relative overflow-hidden bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 text-purple-300 py-3 px-4 rounded-xl font-semibold transition-all duration-300 hover:from-purple-500/30 hover:to-pink-500/30 hover:text-white hover:shadow-lg hover:shadow-purple-500/20">
                        <span className="relative z-10">CONFIG</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Mensaje cuando no hay salas */
            <div className="text-center py-20">
              <div className="relative inline-block mb-8">
                <div className="w-32 h-32 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-full border border-gray-600/50 flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-gray-400/10 to-gray-600/10 rounded-full blur-xl"></div>
              </div>
              <p className="text-gray-400 text-xl mb-4 font-medium">EMPTY SPACE DETECTED</p>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                Start your first connection by creating a collaboration room.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Modal futurista para crear sala */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/50 via-purple-500/50 to-pink-500/50 rounded-3xl blur opacity-60 animate-pulse"></div>

            <div className="relative bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-xl rounded-2xl p-12 w-full max-w-4xl border border-purple-500/30 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
                    NUEVA CONEXIÓN
                  </h3>
                  <div className="w-16 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 mt-2 rounded-full"></div>
                </div>
                <button
                  onClick={handleCloseModal}
                  disabled={isCreating}
                  className="text-gray-400 hover:text-red-400 transition-all duration-300 disabled:opacity-50 p-2 rounded-xl hover:bg-red-500/10"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-8">
                <label
                  htmlFor="roomName"
                  className="block text-sm font-bold text-cyan-300 mb-4 uppercase tracking-wider"
                >
                  Identificador de Sala
                </label>
                <div className="relative">
                  <input
                    id="roomName"
                    type="text"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && !isCreating && handleConfirmCreate()}
                    placeholder="Ej: Núcleo de Innovación"
                    disabled={isCreating}
                    className="w-full px-6 py-4 bg-black/50 border border-cyan-400/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 disabled:opacity-50 backdrop-blur-sm"
                    autoFocus
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 rounded-xl pointer-events-none opacity-0 focus-within:opacity-100 transition-opacity duration-300"></div>
                </div>
                {newRoomName.length > 50 && (
                  <p className="text-red-400 text-sm mt-3 flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Límite de caracteres excedido (50 max)</span>
                  </p>
                )}
              </div>

              <div className="flex space-x-6">
                <button
                  onClick={handleCloseModal}
                  disabled={isCreating}
                  className="flex-1 px-6 py-2 bg-gradient-to-r from-gray-600/20 to-gray-700/20 border border-gray-500/30 text-gray-300 rounded-xl font-semibold transition-all duration-300 hover:from-gray-500/30 hover:to-gray-600/30 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                >
                  CANCELAR
                </button>
                <button
                  onClick={handleConfirmCreate}
                  disabled={!newRoomName.trim() || newRoomName.length > 50 || isCreating}
                  className="flex-1 relative overflow-hidden bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 p-0.5 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/25"
                >
                  <div className="bg-black rounded-lg px-6 py-1.5 font-semibold flex items-center justify-center">
                    {isCreating ? (
                      <div className="flex items-center justify-center text-white space-x-3">
                        <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                        <span className="bg-gradient-to-r from-cyan-200 to-purple-200 bg-clip-text text-transparent">
                          INICIALIZANDO...
                        </span>
                      </div>
                    ) : (
                      <span className="bg-gradient-to-r from-cyan-200 to-purple-200 bg-clip-text text-transparent">
                        CREAR SALA
                      </span>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
