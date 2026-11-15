import { Toaster as Sonner } from 'sonner';

export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      toastOptions={{
        style: {
          fontFamily: 'var(--font-sans)',
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          background: '#FFFFFF',
          color: '#0F172A',
        },
      }}
    />
  );
}
