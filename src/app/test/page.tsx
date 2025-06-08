// app/stomp-test/page.tsx (o en pages/stomp-test.tsx si usas pages router)
import StompTest from '@/components/StompTest';

export default function StompTestPage() {
  const roomId = '1'; // Usa un roomId válido

  return (
    <div>
      <h1>Probar STOMP Sync</h1>
      <StompTest roomId={roomId} />
    </div>
  );
}
