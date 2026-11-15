import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import { formatDateShort } from '@/src/lib/utils';
import type { MisconceptionPattern } from '@/src/types/api';

interface MisconceptionPatternsPanelProps {
  misconceptions: MisconceptionPattern[];
}

export function MisconceptionPatternsPanel({
  misconceptions,
}: MisconceptionPatternsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recurring Misconception Tags</CardTitle>
        <CardDescription>
          Mistake patterns inferred from incorrect distractor selections
        </CardDescription>
      </CardHeader>
      <CardContent>
        {misconceptions.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-[#E2E8F0] bg-[#F8FAFC] px-6 text-center">
            <CheckCircle2 className="h-7 w-7 text-[#10B981]" />
            <p className="mt-2.5 text-sm font-medium text-[#0F172A]">
              No recurring misconception patterns recorded
            </p>
            <p className="mt-1 max-w-sm text-xs text-[#64748B]">
              When assessment distractors match known reasoning errors, tagged patterns will appear here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[#E2E8F0]">
            {misconceptions.map((misc) => (
              <li key={misc.id} className="py-3.5 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-[#D97706]" />
                      <span className="text-sm font-semibold text-[#0F172A]">
                        {misc.tag}
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B]">
                      {misc.concept_title} · Last observed{' '}
                      {formatDateShort(misc.last_observed_at)}
                    </p>
                    <p className="text-xs leading-relaxed text-[#64748B]">
                      {misc.description}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-sm font-semibold text-[#0F172A] tabular-nums">
                      {misc.occurrences}x
                    </span>
                    <p className="text-[11px] text-[#64748B]">observed</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
