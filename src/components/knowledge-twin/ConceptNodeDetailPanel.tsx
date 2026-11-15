import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
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
import { CONCEPT_MAP, getMasteryBand } from '@/src/lib/constants';
import { formatDateShort, formatMasteryScore } from '@/src/lib/utils';
import type {
  AssessmentHistoryAttempt,
  ConceptId,
  ConceptMasterySnapshot,
  MisconceptionPattern,
  RecommendationResponse,
} from '@/src/types/api';

interface ConceptNodeDetailPanelProps {
  conceptId: ConceptId;
  snapshot?: ConceptMasterySnapshot;
  attempts: AssessmentHistoryAttempt[];
  misconceptions: MisconceptionPattern[];
  recommendation?: RecommendationResponse;
}

export function ConceptNodeDetailPanel({
  conceptId,
  snapshot,
  attempts,
  misconceptions,
  recommendation,
}: ConceptNodeDetailPanelProps) {
  const meta = CONCEPT_MAP[conceptId];
  const pct = formatMasteryScore(snapshot?.estimated_mastery);
  const band = getMasteryBand(pct);

  const conceptEvidence = attempts
    .flatMap((a) => a.evidence_items)
    .filter((item) => item.concept_id === conceptId)
    .reverse();

  const conceptMisconceptions = misconceptions.filter(
    (m) => m.concept_id === conceptId
  );

  const attemptChanges = attempts
    .filter((a) => a.mastery_by_concept[conceptId] !== undefined)
    .map((a) => ({
      attemptNumber: a.attempt_number,
      date: formatDateShort(a.submitted_at),
      mastery: formatMasteryScore(a.mastery_by_concept[conceptId]),
    }));

  const isRecommendedConcept =
    recommendation?.recommended_concept_id === conceptId;

  return (
    <motion.div
      key={conceptId}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card>
        <CardHeader className="border-b border-[#E2E8F0] pb-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <p className="text-xs font-medium text-[#4F46E5]">
                Concept Detail · Step 0{meta.sequenceOrder}
              </p>
              <CardTitle className="mt-1 text-xl">{meta.title}</CardTitle>
            </div>
            <div className="text-right">
              <span className="font-display text-2xl font-bold text-[#0F172A] tabular-nums">
                {pct !== null ? `${pct}%` : '—'}
              </span>
              <p className={`text-xs font-medium ${band.textClass}`}>{band.label}</p>
            </div>
          </div>
          <CardDescription className="pt-1 leading-relaxed">
            {meta.description}
          </CardDescription>
          <div className="pt-3">
            <Progress value={pct ?? 0} indicatorClassName={band.barClass} />
          </div>
        </CardHeader>

        <CardContent className="divide-y divide-[#E2E8F0] pt-5">
          {/* Attempt-by-attempt mastery changes */}
          <div className="pb-5">
            <h4 className="font-display text-sm font-semibold text-[#0F172A]">
              Changes Across Assessment Attempts
            </h4>
            {attemptChanges.length === 0 ? (
              <p className="mt-2 text-xs text-[#64748B]">
                No historical mastery snapshots recorded for this concept yet.
              </p>
            ) : (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                {attemptChanges.map((entry, idx) => {
                  const prev = idx > 0 ? attemptChanges[idx - 1].mastery : null;
                  const delta =
                    entry.mastery !== null && prev !== null
                      ? entry.mastery - prev
                      : null;
                  return (
                    <div
                      key={entry.attemptNumber}
                      className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-xs"
                    >
                      <div className="text-[#64748B]">
                        Attempt #{entry.attemptNumber} · {entry.date}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 font-mono font-semibold text-[#0F172A] tabular-nums">
                        <span>{entry.mastery ?? '—'}%</span>
                        {delta !== null && delta !== 0 && (
                          <span
                            className={
                              delta > 0 ? 'text-[#059669]' : 'text-[#DC2626]'
                            }
                          >
                            ({delta > 0 ? `+${delta}%` : `${delta}%`})
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Identified Mistake Patterns */}
          <div className="py-5">
            <h4 className="font-display text-sm font-semibold text-[#0F172A]">
              Identified Mistake Patterns
            </h4>
            {conceptMisconceptions.length === 0 ? (
              <p className="mt-2 text-xs text-[#64748B]">
                No recurring mistake patterns detected for {meta.title}.
              </p>
            ) : (
              <ul className="mt-3 space-y-2.5">
                {conceptMisconceptions.map((misc) => (
                  <li
                    key={misc.id}
                    className="rounded-lg bg-[#FFFBEB] p-3 text-xs leading-relaxed"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-[#0F172A]">
                        <AlertTriangle className="h-3.5 w-3.5 text-[#D97706]" />
                        <span>{misc.tag}</span>
                      </span>
                      <span className="font-mono text-[#D97706] tabular-nums">
                        {misc.occurrences} {misc.occurrences === 1 ? 'time' : 'times'}
                      </span>
                    </div>
                    <p className="mt-1 text-[#64748B]">{misc.description}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Previous Assessment Evidence */}
          <div className="py-5">
            <h4 className="font-display text-sm font-semibold text-[#0F172A]">
              Previous Assessment Evidence
            </h4>
            {conceptEvidence.length === 0 ? (
              <p className="mt-2 text-xs text-[#64748B]">
                Complete an assessment covering {meta.title} to inspect item-level evidence.
              </p>
            ) : (
              <ul className="mt-3 space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {conceptEvidence.slice(0, 6).map((ev, idx) => (
                  <li
                    key={`${ev.question_id}-${ev.attempt_number}-${idx}`}
                    className="flex items-start justify-between gap-3 rounded-lg border border-[#E2E8F0] px-3 py-2.5 text-xs"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <p className="truncate font-medium text-[#0F172A]">
                        {ev.question_prompt}
                      </p>
                      <p className="text-[#64748B]">
                        Attempt #{ev.attempt_number} · Answer:{' '}
                        <span className="font-mono text-[#0F172A]">
                          {ev.selected_answer_text}
                        </span>
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 shrink-0 font-medium ${
                        ev.is_correct ? 'text-[#059669]' : 'text-[#DC2626]'
                      }`}
                    >
                      {ev.is_correct ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5" />
                      )}
                      <span>{ev.is_correct ? 'Correct' : 'Incorrect'}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recommended Next Practice */}
          <div className="pt-5">
            <h4 className="font-display text-sm font-semibold text-[#0F172A]">
              Recommended Next Practice
            </h4>
            <p className="mt-1.5 text-xs leading-relaxed text-[#64748B]">
              {isRecommendedConcept && recommendation
                ? recommendation.reason
                : meta.practiceFocus}
            </p>
            <Button asChild className="mt-4 w-full sm:w-auto">
              <Link to={`/assessments?concept=${conceptId}`}>
                <span>Practice {meta.shortTitle}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
