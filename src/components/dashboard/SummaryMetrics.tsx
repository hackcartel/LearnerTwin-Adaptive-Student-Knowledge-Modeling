import { Card, CardContent } from '@/src/components/ui/card';
import { Skeleton } from '@/src/components/ui/skeleton';
import { formatMasteryScore } from '@/src/lib/utils';
import type { LearnerProfileResponse, RecommendationResponse } from '@/src/types/api';

interface SummaryMetricsProps {
  profile?: LearnerProfileResponse;
  recommendation?: RecommendationResponse;
  isLoading: boolean;
}

export function SummaryMetrics({
  profile,
  recommendation,
  isLoading,
}: SummaryMetricsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((idx) => (
          <Card key={idx}>
            <CardContent className="p-5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-3 h-8 w-20" />
              <Skeleton className="mt-2 h-3.5 w-36" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const overallMastery = formatMasteryScore(profile?.overall_mastery);
  const conceptsAssessed = profile?.concepts_assessed ?? 0;
  const totalConcepts = profile?.total_concepts ?? 3;
  const assessmentsCompleted = profile?.assessments_completed ?? 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardContent className="p-5">
          <p className="text-xs font-medium text-[#64748B]">Concepts Assessed</p>
          <p className="mt-2 font-display text-2xl font-bold tracking-tight text-[#0F172A] tabular-nums">
            {conceptsAssessed} <span className="text-base font-normal text-[#64748B]">/ {totalConcepts}</span>
          </p>
          <p className="mt-1.5 text-xs text-[#64748B]">
            {conceptsAssessed === totalConcepts
              ? 'All core concepts modeled'
              : `${totalConcepts - conceptsAssessed} remaining for baseline`}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <p className="text-xs font-medium text-[#64748B]">Latest Mastery Overview</p>
          <p className="mt-2 font-display text-2xl font-bold tracking-tight text-[#0F172A] tabular-nums">
            {overallMastery !== null ? `${overallMastery}%` : '—'}
          </p>
          <p className="mt-1.5 text-xs text-[#64748B]">
            {overallMastery !== null
              ? 'Mean model estimate across assessed concepts'
              : 'Awaiting first assessment evidence'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <p className="text-xs font-medium text-[#64748B]">Assessments Completed</p>
          <p className="mt-2 font-display text-2xl font-bold tracking-tight text-[#0F172A] tabular-nums">
            {assessmentsCompleted}
          </p>
          <p className="mt-1.5 text-xs text-[#64748B]">
            {assessmentsCompleted === 0
              ? 'No submitted attempts recorded'
              : assessmentsCompleted === 1
                ? '1 recorded submission'
                : `${assessmentsCompleted} recorded submissions`}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <p className="text-xs font-medium text-[#64748B]">Recommended Concept</p>
          <p className="mt-2 truncate font-display text-xl font-bold tracking-tight text-[#4F46E5]">
            {recommendation?.recommended_concept_title || 'Variables & Data Types'}
          </p>
          <p className="mt-1.5 truncate text-xs text-[#64748B]">
            {recommendation
              ? recommendation.activity_type === 'diagnostic'
                ? 'Baseline calibration priority'
                : recommendation.activity_type === 'targeted_practice'
                  ? 'Lowest estimated mastery focus'
                  : 'Reinforcement opportunity'
              : 'Initial diagnostic focus'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
