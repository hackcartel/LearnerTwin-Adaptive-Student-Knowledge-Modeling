import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  Network,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Progress } from '@/src/components/ui/progress';
import { formatMasteryScore } from '@/src/lib/utils';
import type { AssessmentSubmissionResponse } from '@/src/types/api';

interface AssessmentResultSummaryProps {
  result: AssessmentSubmissionResponse;
  onRetakeOrNew: () => void;
}

export function AssessmentResultSummary({
  result,
  onRetakeOrNew,
}: AssessmentResultSummaryProps) {
  const scorePct = Math.round(result.score * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <p className="text-xs font-medium text-[#4F46E5]">Assessment Submitted</p>
            <CardTitle className="text-2xl">
              Score: <span className="font-mono tabular-nums">{scorePct}%</span> ({result.correct_count} of{' '}
              {result.total_questions} correct)
            </CardTitle>
            <CardDescription>
              Your learner profile and Knowledge Twin mastery estimates have been updated with this evidence.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <h3 className="font-display text-sm font-semibold text-[#0F172A]">
              Updated Concept Mastery
            </h3>
            <div className="space-y-4">
              {result.updated_mastery.map((item) => {
                const nextPct = formatMasteryScore(item.estimated_mastery);
                const prevPct = formatMasteryScore(item.previous_mastery);
                const delta =
                  nextPct !== null && prevPct !== null ? nextPct - prevPct : null;

                return (
                  <div key={item.concept_id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-[#0F172A]">
                        {item.concept_title}
                      </span>
                      <div className="flex items-center gap-2 font-mono text-xs tabular-nums">
                        {delta !== null && delta !== 0 && (
                          <span
                            className={
                              delta > 0 ? 'text-[#059669]' : 'text-[#DC2626]'
                            }
                          >
                            {delta > 0 ? `+${delta}%` : `${delta}%`}
                          </span>
                        )}
                        <span className="font-semibold text-[#0F172A]">
                          {nextPct !== null ? `${nextPct}%` : '—'}
                        </span>
                      </div>
                    </div>
                    <Progress value={nextPct ?? 0} />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center gap-2 text-xs font-medium text-[#7C3AED]">
              <Compass className="h-4 w-4" />
              <span>Recommended Next Practice</span>
            </div>
            <CardTitle className="pt-1 text-lg">
              {result.recommendation.activity_title}
            </CardTitle>
            <CardDescription>
              Focus: {result.recommendation.recommended_concept_title}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm leading-relaxed text-[#64748B]">
              {result.recommendation.reason}
            </p>
            <div className="flex flex-col gap-2.5">
              <Button asChild>
                <Link to="/knowledge-twin">
                  <Network className="h-4 w-4" />
                  <span>Inspect Knowledge Twin</span>
                </Link>
              </Button>
              <Button variant="outline" onClick={onRetakeOrNew}>
                <RotateCcw className="h-4 w-4" />
                <span>Start Another Assessment</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Question-by-Question Review</CardTitle>
          <CardDescription>
            Explanations and identified misconception patterns from this submission
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-[#E2E8F0]">
          {result.question_results.map((item, idx) => (
            <div key={item.question_id} className="py-5 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B]">
                    <span className="font-mono tabular-nums">Item {idx + 1}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.concept_title}</span>
                    {item.detected_misconception && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-medium text-[#D97706]">
                          Pattern: {item.detected_misconception}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="font-medium text-[#0F172A]">{item.prompt}</p>
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold shrink-0 ${
                    item.is_correct ? 'text-[#059669]' : 'text-[#DC2626]'
                  }`}
                >
                  {item.is_correct ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Correct</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4" />
                      <span>Incorrect</span>
                    </>
                  )}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                <div className="rounded-lg bg-slate-50 px-3 py-2">
                  <span className="text-[#64748B]">Your answer: </span>
                  <span className="font-medium text-[#0F172A]">
                    {item.selected_option_text}
                  </span>
                </div>
                {!item.is_correct && (
                  <div className="rounded-lg bg-[#ECFDF5] px-3 py-2">
                    <span className="text-[#059669]">Expected answer: </span>
                    <span className="font-medium text-[#0F172A]">
                      {item.correct_option_text}
                    </span>
                  </div>
                )}
              </div>

              <p className="mt-2.5 text-xs leading-relaxed text-[#64748B] sm:text-sm">
                {item.explanation}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
