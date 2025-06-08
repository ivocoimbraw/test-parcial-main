import { useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { useDesignerStore } from "@/lib/store";
import stompService from "@/lib/StompService";

export function useStompSync(roomId: string) {
  const clientIdRef = useRef(uuidv4());

  useEffect(() => {
    if (!roomId) return;

    stompService.init(roomId, clientIdRef.current);

    const handleRemoteMessage = (message: {
      senderId: string;
      type: string;
      payload: any;
    }) => {
      const store = useDesignerStore.getState();

      switch (message.type) {
        case "UPDATE_COMPONENT":
          store.updateComponentTest(message.payload.component);
          break;
        case "SYNC_PAGES":
          store.setComponentTreeTest(message.payload.componentTree);
          store.setCurrentPageTest(message.payload.currentPageId);
          break;
        default:
          console.warn("[STOMP] Acción desconocida:", message.type);
      }
    };

    stompService.subscribe(handleRemoteMessage);

    return () => {
      stompService.unsubscribe(handleRemoteMessage);
      stompService.disconnect();
    };
  }, [roomId]);
}
