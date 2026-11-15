import { Info, RefreshCw } from 'lucide-react';
import { useActiveLearner } from '@/src/hooks/useActiveLearner';
import { Button } from '@/src/components/ui/button';

export function DemoModeBanner() {
  const { connectionInfo, isCheckingConnection, recheckConnection } = useActiveLearner();

  if (connectionInfo.mode !== 'demo') {
    return null;
  }

  return (
    <div
      role="status"
      className="mb-6 flex flex-col gap-3 rounded-xl border border-amber-200 bg-[#FFFBEB] px-4 py-3 text-sm text-[#0F172A] sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-2.5 sm:items-center">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#D97706] sm:mt-0" />
        <p className="text-xs leading-relaxed text-slate-700 sm:text-sm">
          <span className="font-semibold text-[#0F172A]">Demo Mode (Fictional Sample Records):</span>{' '}
          FastAPI server at <span className="font-mono text-xs">{connectionInfo.baseUrl}</span> is
          not reachable. You can test the complete assessment and Knowledge Twin flow locally.
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => void recheckConnection()}
        disabled={isCheckingConnection}
        className="self-start sm:self-auto bg-white"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${isCheckingConnection ? 'animate-spin' : ''}`} />
        <span>Retry Backend</span>
      </Button>
    </div>
  );
}
