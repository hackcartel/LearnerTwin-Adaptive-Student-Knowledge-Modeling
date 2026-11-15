import { AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';

interface QueryErrorCardProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function QueryErrorCard({
  title = 'Unable to load learner data',
  message = 'The request did not complete. Check backend connectivity or retry below.',
  onRetry,
}: QueryErrorCardProps) {
  return (
    <Card className="border-red-200 bg-[#FEF2F2]">
      <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#EF4444]" />
          <div>
            <h3 className="font-display text-sm font-semibold text-[#0F172A]">
              {title}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-[#64748B] sm:text-sm">
              {message}
            </p>
          </div>
        </div>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="bg-white self-start sm:self-auto">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Retry</span>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
