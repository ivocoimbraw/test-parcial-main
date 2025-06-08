import { useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { useDesignerStore } from "@/lib/store";
import stompService from "@/lib/StompService";
import { ACTION_TYPES } from "@/lib/constants";
import { ActionType } from "@/lib/types";
import { assertNever } from "@/lib/utils";

export function useStompSync(roomId: string) {
	const clientIdRef = useRef(uuidv4());

	useEffect(() => {
		if (!roomId) return;

		stompService.init(roomId, clientIdRef.current);

		const handleRemoteMessage = (message: {
			senderId: string;
			type: ActionType;
			payload: any;
		}) => {
			const store = useDesignerStore.getState();
			
			switch (message.type) {
				case ACTION_TYPES.ADD_COMPONENT:
					store.addComponentRemote(
						message.payload.newComponent, 
						message.payload.pageId, 
						message.payload.parentId
					);
					break;

				case ACTION_TYPES.ADD_PAGE:
					store.addPageRemote(message.payload);
					break;

				case ACTION_TYPES.DELETE_COMPONENT:
					store.deleteComponentRemote(
						message.payload.componentId, 
						message.payload.pageId
					);
					break;

				case ACTION_TYPES.DELETE_PAGE:
					store.deletePageRemote(message.payload.pageId);
					break;

				case ACTION_TYPES.MOVE_COMPONENT:
					store.moveComponentRemote(
						message.payload.componentId,
						message.payload.x,
						message.payload.y,
						message.payload.pageId
					);
					break;

				case ACTION_TYPES.UPDATE_COMPONENT:
					store.updateComponentRemote(message.payload);
					break;
				case ACTION_TYPES.UPDATE_COMPONENT_PROPERTY:
					store.updateComponentPropertyRemote(message.payload.id, message.payload.property, message.payload.value);
					break;

				default:
					assertNever(message.type); // Forzará error si falta un case
			}
		};

		stompService.subscribe(handleRemoteMessage);

		return () => {
			stompService.unsubscribe(handleRemoteMessage);
			stompService.disconnect();
		};
	}, [roomId]);
}