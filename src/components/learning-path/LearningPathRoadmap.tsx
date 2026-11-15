import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  Compass,
  XCircle,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Progress } from '@/src/components/ui/progress';
import { CONCEPTS, getMasteryBand } from '@/src/lib/constants';
import { formatDateShort, formatMasteryScore } from '@/src/lib/utils';
import type {
  ConceptMasterySnapshot,
  MisconceptionPattern,
  RecommendationResponse,
} from '@/src/types/api';

interface LearningPathRoadmapProps {
  snapshots: ConceptMasterySnapshot[];
  recommendation?: RecommendationResponse;
  misconceptions: MisconceptionPattern[];
}

export function LearningPathRoadmap({
  snapshots,
  recommendation,
  misconceptions,
}: LearningPathRoadmapProps) {
  return (
    <div className="space-y-5">
      {CONCEPTS.map((concept) => {
        const snapshot = snapshots.find((s) => s.concept_id === concept.id);
        const pct = formatMasteryScore(snapshot?.estimated_mastery);
        const band = getMasteryBand(pct);
        const isRecommended =
          recommendation?.recommended_concept_id === concept.id;
        const conceptMisconceptions = misconceptions.filter(
          (m) => m.concept_id === concept.id
        );

        const BandIcon =
          band.tone === 'positive'
            ? CheckCircle2
            : band.tone === 'warning'
              ? AlertTriangle
              : band.tone === 'error'
                ? XCircle
                : CircleDashed;

        const activityTitle =
          isRecommended && recommendation
            ? recommendation.activity_title
            : pct === null
              ? `Baseline Diagnostic: ${concept.title}`
              : pct >= 75
                ? `Applied Reinforcement: ${concept.title}`
                : `Focused Practice: ${concept.title}`;

        const reasonText =
          isRecommended && recommendation
            ? recommendation.reason
            : pct === null
              ? `No assessment items have been completed for ${concept.title} yet. Taking a baseline check will establish your initial mastery estimate.`
              : conceptMisconceptions.length > 0
                ? `Observed ${conceptMisconceptions[0].tag} (${conceptMisconceptions[0].occurrences}x). ${concept.practiceFocus}`
                : pct >= 75
                  ? `Estimated mastery is ${pct}% (${band.label}). Periodic reinforcement checks help verify edge-case consistency.`
                  : `Estimated mastery is ${pct}% (${band.label}). ${concept.practiceFocus}`;

        return (
          <Card
            key={concept.id}
            className={
              isRecommended
                ? 'border-[#4F46E5] shadow-[0_4px_16px_rgba(79,70,229,0.08)]'
                : undefined
            }
          >
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono font-semibold text-[#64748B]">
                      Step 0{concept.sequenceOrder}
                    </span>
                    {isRecommended && (
                      <>
                        <span aria-hidden="true" className="text-[#64748B]">
                          ·
                        </span>
                        <span className="inline-flex items-center gap-1 font-semibold text-[#4F46E5]">
                          <Compass className="h-3.5 w-3.5" />
                          <span>Recommended Next by Engine</span>
                        </span>
                      </>
                    )}
                  </div>
                  <CardTitle className="text-xl">{concept.title}</CardTitle>
                  <CardDescription>{concept.description}</CardDescription>
                </div>

                <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-1 shrink-0">
                  <span className="font-display text-2xl font-bold text-[#0F172A] tabular-nums">
                    {pct !== null ? `${pct}%` : '—'}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-medium ${band.textClass}`}
                  >
                    <BandIcon className="h-3.5 w-3.5" />
                    <span>{band.label}</span>
                  </span>
                </div>
              </div>

              <div className="pt-3">
                <Progress value={pct ?? 0} indicatorClassName={band.barClass} />
              </div>
            </CardHeader>

            <CardContent className="grid grid-cols-1 gap-5 border-t border-[#E2E8F0] pt-5 lg:grid-cols-3 lg:items-center">
              <div>
                <p className="text-xs font-medium text-[#64748B]">
                  Assessment History Summary
                </p>
                <p className="mt-1 text-sm font-medium text-[#0F172A] tabular-nums">
                  {snapshot && snapshot.total_questions > 0
                    ? `${snapshot.attempts_count} ${
                        snapshot.attempts_count === 1 ? 'attempt' : 'attempts'
                      } · ${snapshot.correct_count}/${snapshot.total_questions} items correct`
                    : 'Not yet assessed'}
                </p>
                {snapshot?.last_assessed_at && (
                  <p className="mt-0.5 text-xs text-[#64748B]">
                    Last assessed {formatDateShort(snapshot.last_assessed_at)}
                  </p>
                )}
              </div>

              <div className="lg:col-span-1">
                <p className="text-xs font-medium text-[#64748B]">
                  Recommended Activity & Rationale
                </p>
                <p className="mt-1 text-sm font-semibold text-[#0F172A]">
                  {activityTitle}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#64748B]">
                  {reasonText}
                </p>
              </div>

              <div className="flex lg:justify-end">
                <Button
                  asChild
                  variant={isRecommended ? 'default' : 'outline'}
                >
                  <Link to={`/assessments?concept=${concept.id}`}>
                    <span>Practice This Concept</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
