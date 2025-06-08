"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AppLayout from "@/components/app-layout";
import Navbar from "@/components/navbar";
import { useAuthStore } from "@/lib/useAuthStore";
import { API_ROUTES } from "@/routes/api.routes";
import { useDesignerStore } from "@/lib/store";
import { useStompSync } from "@/hooks/useStompSync";
import { Page } from "@/lib/types";

interface RoomData {
  id: number;
  name: string;
  datosJson: string;
  createdAt: string;
  // Agrega otros campos según tu backend
}

function RoomPage() {
  const params = useParams();
  const roomId = params?.roomId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roomData, setRoomData] = useState<RoomData | null>(null);

  const {
    setComponentTree,
    pages,
    addPageInterface,
    setCurrentPage,
    initializePages,
    // Limpiar el estado actual
  } = useDesignerStore();

  useStompSync(roomId);
  
  useEffect(() => {
    const fetchRoomData = async () => {
      console.log(roomId);
      if (!roomId) {
        setError("ID de sala o usuario no válido");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");

        if (!token) {
          setError("Token de autenticación no encontrado");
          setLoading(false);
          return;
        }

        // Hacer la petición al backend para obtener los datos de la sala
        const response = await fetch(`${API_ROUTES.GET_ROOM_BY_ID.url}/${roomId}`, {
          method: API_ROUTES.GET_ROOM_BY_ID.method || "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: No se pudo obtener la sala`);
        }

        const roomData: RoomData = await response.json();
        setRoomData(roomData);

        // Parsear y cargar los datos JSON
        if (roomData.datosJson && roomData.datosJson !== "string") {
          try {
            const parsedData = JSON.parse(roomData.datosJson);

            // Verificar si parsedData tiene la estructura esperada
            if (parsedData && typeof parsedData === "object") {
              // Si tiene páginas, cargarlas
              if (parsedData.pages && Array.isArray(parsedData.pages)) {
                const pages = parsedData.pages as Page[];
                initializePages(pages);
              } else if (parsedData.componentTree) {
                // Si solo tiene componentTree, cargarlo directamente
                console.log("Entro al este if", pages);
                setComponentTree(parsedData.componentTree);
              } else {
                console.warn("Estructura de datos no reconocida en dataJson");
              }
            }
          } catch (parseError) {
            console.error("Error al parsear dataJson:", parseError);
            setError("Error al cargar los datos de la sala");
          }
        }
      } catch (err) {
        console.error("Error fetching room data:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchRoomData();
  }, [roomId, setComponentTree, addPageInterface, setCurrentPage]);

  // Función para guardar cambios automáticamente (opcional)
  const saveRoomData = async () => {
    if (!roomId || !roomData) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const dataToSave = {
        pages: pages,
        // Puedes agregar más datos aquí si necesitas
      };

      const response = await fetch(`${API_ROUTES.UPDATE_ROOM.url}/${roomId}`, {
        method: API_ROUTES.UPDATE_ROOM.method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: roomId,
          datosJson: JSON.stringify(dataToSave),
        }),
      });

      if (!response.ok) {
        throw new Error("Error al guardar los datos");
      }

      console.log("Datos guardados correctamente");
    } catch (error) {
      console.error("Error saving room data:", error);
    }
  };

  // Auto-guardar cada 30 segundos (opcional)
  useEffect(() => {
   /*  if (!loading && roomData) {
      const interval = setInterval(saveRoomData, 30000);
      return () => clearInterval(interval);
    } */
  }, [loading, roomData, pages]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando sala...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">⚠️ Error</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Reintentar
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <AppLayout />
      </main>

      {/* Botón para guardar manualmente (opcional) */}
      <div className="fixed top-4 right-4 z-10">
        <button
          onClick={saveRoomData}
          className="relative group px-4 py-2 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-400/30 rounded-xl text-red-300 hover:text-white transition-all duration-300 backdrop-blur-sm"
          title="Guardar cambios"
        >
          Guardar
        </button>
      </div>
    </div>
  );
}

export default RoomPage;
