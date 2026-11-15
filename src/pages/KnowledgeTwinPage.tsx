import { useState } from 'react';
import { AppShell } from '@/src/components/layout/AppShell';
import { KnowledgeGraphCanvas } from '@/src/components/knowledge-twin/KnowledgeGraphCanvas';
import { ConceptNodeDetailPanel } from '@/src/components/knowledge-twin/ConceptNodeDetailPanel';
import { Skeleton } from '@/src/components/ui/skeleton';
import { QueryErrorCard } from '@/src/components/ui/query-error-card';
import { useActiveLearner } from '@/src/hooks/useActiveLearner';
import {
  useLearnerHistory,
  useLearnerMisconceptions,
  useLearnerProfile,
  useLearnerRecommendation,
} from '@/src/hooks/useLearnerQueries';
import type { ConceptId } from '@/src/types/api';

export function KnowledgeTwinPage() {
  const { activeLearnerId, isLoadingLearners } = useActiveLearner();
  const [selectedConceptId, setSelectedConceptId] =
    useState<ConceptId>('variables_and_data_types');

  const profileQuery = useLearnerProfile(activeLearnerId);
  const historyQuery = useLearnerHistory(activeLearnerId);
  const misconceptionsQuery = useLearnerMisconceptions(activeLearnerId);
  const recommendationQuery = useLearnerRecommendation(activeLearnerId);

  const isLoading =
    isLoadingLearners ||
    profileQuery.isLoading ||
    historyQuery.isLoading ||
    misconceptionsQuery.isLoading;

  const hasError =
    profileQuery.isError || historyQuery.isError || misconceptionsQuery.isError;

  const snapshots = profileQuery.data?.concept_mastery ?? [];
  const selectedSnapshot = snapshots.find(
    (s) => s.concept_id === selectedConceptId
  );

  return (
    <AppShell pageTitle="Knowledge Twin">
      <div className="space-y-6">
        <div className="border-b border-[#E2E8F0] pb-5">
          <h2 className="font-display text-xl font-bold text-[#0F172A] sm:text-2xl">
            Student Knowledge Twin
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-[#64748B]">
            Interactive representation of estimated concept mastery derived from assessment evidence.
          </p>
        </div>

        {hasError ? (
          <QueryErrorCard
            title="Unable to load Knowledge Twin"
            message="Failed to fetch learner profile or assessment evidence."
            onRetry={() => {
              void profileQuery.refetch();
              void historyQuery.refetch();
              void misconceptionsQuery.refetch();
            }}
          />
        ) : isLoading ? (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <Skeleton className="h-[420px] xl:col-span-7" />
            <Skeleton className="h-[420px] xl:col-span-5" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start">
            <div className="xl:col-span-7">
              <KnowledgeGraphCanvas
                snapshots={snapshots}
                selectedConceptId={selectedConceptId}
                onSelectConcept={setSelectedConceptId}
                recommendation={recommendationQuery.data}
              />
            </div>
            <div className="xl:col-span-5">
              <ConceptNodeDetailPanel
                conceptId={selectedConceptId}
                snapshot={selectedSnapshot}
                attempts={historyQuery.data?.attempts ?? []}
                misconceptions={misconceptionsQuery.data?.misconceptions ?? []}
                recommendation={recommendationQuery.data}
              />
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
