import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  CircleDashed,
  XCircle,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import { Progress } from '@/src/components/ui/progress';
import { Skeleton } from '@/src/components/ui/skeleton';
import { CONCEPTS, getMasteryBand } from '@/src/lib/constants';
import { formatMasteryScore } from '@/src/lib/utils';
import type { ConceptMasterySnapshot } from '@/src/types/api';

interface MasteryOverviewCardProps {
  snapshots?: ConceptMasterySnapshot[];
  isLoading: boolean;
}

export function MasteryOverviewCard({
  snapshots,
  isLoading,
}: MasteryOverviewCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-5">
          {[0, 1, 2].map((idx) => (
            <div key={idx} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-2.5 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-4">
        <div>
          <CardTitle>Knowledge Mastery</CardTitle>
          <CardDescription className="mt-1">
            Model-estimated proficiency across the three foundational Python concepts
          </CardDescription>
        </div>
        <Link
          to="/knowledge-twin"
          className="inline-flex items-center gap-1 text-xs font-medium text-[#4F46E5] hover:text-[#4338CA] whitespace-nowrap shrink-0"
        >
          <span>Inspect Twin</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>

      <CardContent className="space-y-5">
        {CONCEPTS.map((concept) => {
          const snapshot = snapshots?.find((s) => s.concept_id === concept.id);
          const pct = formatMasteryScore(snapshot?.estimated_mastery);
          const band = getMasteryBand(pct);

          const BandIcon =
            band.tone === 'positive'
              ? CheckCircle2
              : band.tone === 'warning'
                ? AlertTriangle
                : band.tone === 'error'
                  ? XCircle
                  : CircleDashed;

          return (
            <div key={concept.id} className="space-y-2">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#0F172A]">
                    {concept.title}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className={`inline-flex items-center gap-1 font-medium ${band.textClass}`}>
                    <BandIcon className="h-3.5 w-3.5" />
                    <span>{band.label}</span>
                  </span>
                  <span className="font-mono font-semibold text-[#0F172A] tabular-nums">
                    {pct !== null ? `${pct}%` : '—'}
                  </span>
                </div>
              </div>

              <Progress
                value={pct ?? 0}
                indicatorClassName={band.barClass}
                aria-label={`${concept.title} estimated mastery ${pct ?? 0}%`}
              />

              <p className="text-xs text-[#64748B] tabular-nums">
                {snapshot && snapshot.total_questions > 0
                  ? `${snapshot.correct_count} of ${snapshot.total_questions} items answered accurately across ${snapshot.attempts_count} ${snapshot.attempts_count === 1 ? 'attempt' : 'attempts'}`
                  : 'No assessment items submitted for this concept yet'}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
