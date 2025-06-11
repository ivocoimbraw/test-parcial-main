// lib/stompService.ts
import { Client, IMessage } from '@stomp/stompjs';
import { ActionType } from './types';

type Action = {
	type: ActionType;
	payload?: any;
};

type IncomingMessage = {
	senderId: string;
	action: Action;
};

type Listener = (message: {
	senderId: string;
	type: ActionType;
	payload: any;
}) => void;

class StompService {
	private client: Client | null = null;
	private isConnected = false;
	private listeners: Set<Listener> = new Set();
	private clientId = '';
	private roomId = '';

	init(roomId: string, clientId: string) {
		if (this.client) return;
		const token = localStorage.getItem('token');
		this.roomId = roomId;
		this.clientId = clientId;

		this.client = new Client({
			brokerURL: process.env.NEXT_PUBLIC_SERVER_URL_SOCKET,
			reconnectDelay: 5000,
			connectHeaders: {
				Authorization: `Bearer ${token}`
			},
			onConnect: () => {
				this.isConnected = true;
				console.log('[STOMP] Conectado');

				this.client!.subscribe(`/topic/updates/${roomId}`, (message: IMessage) => {
					const incoming: IncomingMessage = JSON.parse(message.body);
					if (incoming.senderId !== this.clientId) {
						this.listeners.forEach((listener) =>
							listener({
								senderId: incoming.senderId,
								type: incoming.action.type,
								payload: incoming.action.payload,
							})
						);

					}
				});
			},
		});

		this.client.activate();
	}

	send(action: Action) {
		if (this.client && this.isConnected) {
			const msg: IncomingMessage = {
				senderId: this.clientId,
				action,
			};
			this.client.publish({
				destination: `/app/update/${this.roomId}`,
				body: JSON.stringify(msg),
			});
		} else {
			console.warn('[STOMP] No conectado. Acción no enviada');
		}
	}

	subscribe(listener: Listener) {
		this.listeners.add(listener);
	}

	unsubscribe(listener: Listener) {
		this.listeners.delete(listener);
	}

	disconnect() {
		this.client?.deactivate();
		this.client = null;
		this.isConnected = false;
		this.listeners.clear();
	}
}

const stompService = new StompService();
export default stompService;
