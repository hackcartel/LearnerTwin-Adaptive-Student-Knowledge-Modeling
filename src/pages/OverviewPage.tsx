import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { AppShell } from '@/src/components/layout/AppShell';
import { SummaryMetrics } from '@/src/components/dashboard/SummaryMetrics';
import { MasteryOverviewCard } from '@/src/components/dashboard/MasteryOverviewCard';
import { KnowledgeEvolutionChart } from '@/src/components/dashboard/KnowledgeEvolutionChart';
import { RecommendationCard } from '@/src/components/dashboard/RecommendationCard';
import { RecentActivityTable } from '@/src/components/dashboard/RecentActivityTable';
import { Button } from '@/src/components/ui/button';
import { QueryErrorCard } from '@/src/components/ui/query-error-card';
import { useActiveLearner } from '@/src/hooks/useActiveLearner';
import {
  useLearnerHistory,
  useLearnerProfile,
  useLearnerRecommendation,
} from '@/src/hooks/useLearnerQueries';

export function OverviewPage() {
  const { activeLearnerId, isLoadingLearners } = useActiveLearner();

  const profileQuery = useLearnerProfile(activeLearnerId);
  const recommendationQuery = useLearnerRecommendation(activeLearnerId);
  const historyQuery = useLearnerHistory(activeLearnerId);

  const isLoading =
    isLoadingLearners ||
    profileQuery.isLoading ||
    recommendationQuery.isLoading ||
    historyQuery.isLoading;

  const hasError =
    profileQuery.isError || recommendationQuery.isError || historyQuery.isError;

  const handleRetry = () => {
    void profileQuery.refetch();
    void recommendationQuery.refetch();
    void historyQuery.refetch();
  };

  return (
    <AppShell pageTitle="Overview">
      <div className="space-y-6">
        <section className="flex flex-col gap-4 border-b border-[#E2E8F0] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl space-y-1.5">
            <h2 className="font-display text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
              Understand your learning. Improve with evidence.
            </h2>
            <p className="text-sm text-[#64748B]">
              {profileQuery.data?.learner
                ? `${profileQuery.data.learner.name} · ${profileQuery.data.learner.learning_track}`
                : 'Adaptive knowledge modeling from submitted assessment evidence'}
            </p>
          </div>
          <Button asChild className="self-start sm:self-auto">
            <Link to="/assessments">
              <span>Take Assessment</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </section>

        {hasError ? (
          <QueryErrorCard
            title="Could not load learner overview"
            message="One or more learner endpoints returned an error."
            onRetry={handleRetry}
          />
        ) : (
          <>
            <SummaryMetrics
              profile={profileQuery.data}
              recommendation={recommendationQuery.data}
              isLoading={isLoading}
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <MasteryOverviewCard
                  snapshots={profileQuery.data?.concept_mastery}
                  isLoading={isLoading}
                />
              </div>
              <div className="lg:col-span-5">
                <RecommendationCard
                  recommendation={recommendationQuery.data}
                  isLoading={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="lg:col-span-6">
                <KnowledgeEvolutionChart
                  attempts={historyQuery.data?.attempts}
                  isLoading={isLoading}
                />
              </div>
              <div className="lg:col-span-6">
                <RecentActivityTable
                  attempts={historyQuery.data?.attempts}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
