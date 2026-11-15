import { AppShell } from '@/src/components/layout/AppShell';
import { MasteryEvolutionAnalyticsChart } from '@/src/components/analytics/MasteryEvolutionAnalyticsChart';
import { AttemptTimelineChart } from '@/src/components/analytics/AttemptTimelineChart';
import { PerformanceBreakdownChart } from '@/src/components/analytics/PerformanceBreakdownChart';
import { MisconceptionPatternsPanel } from '@/src/components/analytics/MisconceptionPatternsPanel';
import { EvidenceHistoryTable } from '@/src/components/analytics/EvidenceHistoryTable';
import { Skeleton } from '@/src/components/ui/skeleton';
import { QueryErrorCard } from '@/src/components/ui/query-error-card';
import { useActiveLearner } from '@/src/hooks/useActiveLearner';
import {
  useLearnerHistory,
  useLearnerMisconceptions,
  useLearnerProfile,
} from '@/src/hooks/useLearnerQueries';

export function AnalyticsPage() {
  const { activeLearnerId, isLoadingLearners } = useActiveLearner();

  const profileQuery = useLearnerProfile(activeLearnerId);
  const historyQuery = useLearnerHistory(activeLearnerId);
  const misconceptionsQuery = useLearnerMisconceptions(activeLearnerId);

  const isLoading =
    isLoadingLearners ||
    profileQuery.isLoading ||
    historyQuery.isLoading ||
    misconceptionsQuery.isLoading;

  const hasError =
    profileQuery.isError || historyQuery.isError || misconceptionsQuery.isError;

  const attempts = historyQuery.data?.attempts ?? [];
  const snapshots = profileQuery.data?.concept_mastery ?? [];
  const misconceptions = misconceptionsQuery.data?.misconceptions ?? [];

  return (
    <AppShell pageTitle="Analytics">
      <div className="space-y-6">
        <div className="border-b border-[#E2E8F0] pb-5">
          <h2 className="font-display text-xl font-bold text-[#0F172A] sm:text-2xl">
            Learning Analytics & Evidence Log
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-[#64748B]">
            Longitudinal concept mastery trends, submission outcomes, and observed misconception patterns grounded strictly in submitted evidence.
          </p>
        </div>

        {hasError ? (
          <QueryErrorCard
            title="Unable to load learning analytics"
            message="Failed to fetch assessment history or misconception endpoints."
            onRetry={() => {
              void profileQuery.refetch();
              void historyQuery.refetch();
              void misconceptionsQuery.refetch();
            }}
          />
        ) : isLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Skeleton className="h-80 w-full" />
              <Skeleton className="h-80 w-full" />
            </div>
            <Skeleton className="h-72 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <MasteryEvolutionAnalyticsChart attempts={attempts} />
              <AttemptTimelineChart attempts={attempts} />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <PerformanceBreakdownChart snapshots={snapshots} />
              <MisconceptionPatternsPanel misconceptions={misconceptions} />
            </div>

            <EvidenceHistoryTable attempts={attempts} />
          </div>
        )}
      </div>
    </AppShell>
  );
}
