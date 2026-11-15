import { AppShell } from '@/src/components/layout/AppShell';
import { LearningPathRoadmap } from '@/src/components/learning-path/LearningPathRoadmap';
import { Skeleton } from '@/src/components/ui/skeleton';
import { QueryErrorCard } from '@/src/components/ui/query-error-card';
import { useActiveLearner } from '@/src/hooks/useActiveLearner';
import {
  useLearnerMisconceptions,
  useLearnerProfile,
  useLearnerRecommendation,
} from '@/src/hooks/useLearnerQueries';

export function LearningPathPage() {
  const { activeLearnerId, isLoadingLearners } = useActiveLearner();

  const profileQuery = useLearnerProfile(activeLearnerId);
  const recommendationQuery = useLearnerRecommendation(activeLearnerId);
  const misconceptionsQuery = useLearnerMisconceptions(activeLearnerId);

  const isLoading =
    isLoadingLearners ||
    profileQuery.isLoading ||
    recommendationQuery.isLoading ||
    misconceptionsQuery.isLoading;

  const hasError =
    profileQuery.isError ||
    recommendationQuery.isError ||
    misconceptionsQuery.isError;

  return (
    <AppShell pageTitle="Learning Path">
      <div className="space-y-6">
        <div className="border-b border-[#E2E8F0] pb-5">
          <h2 className="font-display text-xl font-bold text-[#0F172A] sm:text-2xl">
            Personalized Learning Path
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-[#64748B]">
            Structured sequence across foundational programming concepts, prioritized by the recommendation engine from your latest assessment evidence.
          </p>
        </div>

        {hasError ? (
          <QueryErrorCard
            title="Unable to load learning path"
            message="Failed to retrieve learner mastery or recommendation data."
            onRetry={() => {
              void profileQuery.refetch();
              void recommendationQuery.refetch();
              void misconceptionsQuery.refetch();
            }}
          />
        ) : isLoading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((idx) => (
              <Skeleton key={idx} className="h-44 w-full" />
            ))}
          </div>
        ) : (
          <LearningPathRoadmap
            snapshots={profileQuery.data?.concept_mastery ?? []}
            recommendation={recommendationQuery.data}
            misconceptions={misconceptionsQuery.data?.misconceptions ?? []}
          />
        )}
      </div>
    </AppShell>
  );
}
