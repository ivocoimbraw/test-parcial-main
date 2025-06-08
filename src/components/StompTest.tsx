// components/StompTest.tsx
'use client';

import React, { useState } from 'react';
import { useStompSync } from '@/hooks/useStompSync';
import stompService from '@/lib/StompService';

export default function StompTest({ roomId }: { roomId: string }) {
	useStompSync(roomId);
	const [componentName, setComponentName] = useState('');

	const sendUpdate = () => {
		stompService.send({
			type: 'UPDATE_COMPONENT',
			payload: {
				component: { id: '123', name: componentName },
			},
		});
	};

	return (
		<div>
			<h2>STOMP Sync Test</h2>
			<input
				type="text"
				value={componentName}
				onChange={(e) => setComponentName(e.target.value)}
			/>
			<button onClick={sendUpdate}>Enviar Actualización</button>
		</div>
	);
}
