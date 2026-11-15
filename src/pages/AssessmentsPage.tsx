import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { AppShell } from '@/src/components/layout/AppShell';
import { AssessmentProgressBar } from '@/src/components/assessments/AssessmentProgressBar';
import { QuestionCard } from '@/src/components/assessments/QuestionCard';
import { AssessmentResultSummary } from '@/src/components/assessments/AssessmentResultSummary';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent } from '@/src/components/ui/card';
import { Skeleton } from '@/src/components/ui/skeleton';
import { QueryErrorCard } from '@/src/components/ui/query-error-card';
import { CONCEPTS } from '@/src/lib/constants';
import { useActiveLearner } from '@/src/hooks/useActiveLearner';
import {
  useQuestions,
  useSubmitAssessmentMutation,
} from '@/src/hooks/useLearnerQueries';
import type { AssessmentSubmissionResponse, ConceptId } from '@/src/types/api';

type ConceptFilter = 'all' | ConceptId;

function parseConceptParam(raw: string | null): ConceptFilter {
  if (
    raw === 'variables_and_data_types' ||
    raw === 'conditionals' ||
    raw === 'loops'
  ) {
    return raw;
  }
  return 'all';
}

export function AssessmentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFocus = parseConceptParam(searchParams.get('concept'));

  const [conceptFocus, setConceptFocus] = useState<ConceptFilter>(initialFocus);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submissionResult, setSubmissionResult] =
    useState<AssessmentSubmissionResponse | null>(null);

  const { activeLearnerId } = useActiveLearner();
  const questionsQuery = useQuestions(conceptFocus);
  const submitMutation = useSubmitAssessmentMutation(activeLearnerId);

  useEffect(() => {
    const paramFocus = parseConceptParam(searchParams.get('concept'));
    setConceptFocus(paramFocus);
    setCurrentIndex(0);
    setAnswers({});
    setSubmissionResult(null);
  }, [searchParams]);

  const questions = questionsQuery.data ?? [];
  const activeQuestion = questions[currentIndex];

  const answeredCount = useMemo(
    () => questions.filter((q) => Boolean(answers[q.id])).length,
    [questions, answers]
  );

  const answeredMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const q of questions) {
      map[q.id] = Boolean(answers[q.id]);
    }
    return map;
  }, [questions, answers]);

  const allAnswered = questions.length > 0 && answeredCount === questions.length;

  const handleFocusChange = (nextFocus: ConceptFilter) => {
    setConceptFocus(nextFocus);
    setCurrentIndex(0);
    setAnswers({});
    setSubmissionResult(null);
    if (nextFocus === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ concept: nextFocus });
    }
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    if (!activeLearnerId || !allAnswered || submitMutation.isPending) return;
    const response = await submitMutation.mutateAsync({
      concept_focus: conceptFocus,
      answers: questions.map((q) => ({
        question_id: q.id,
        selected_option_id: answers[q.id],
      })),
    });
    setSubmissionResult(response);
  };

  const handleStartNew = () => {
    setSubmissionResult(null);
    setAnswers({});
    setCurrentIndex(0);
  };

  return (
    <AppShell pageTitle="Assessments">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-col gap-4 border-b border-[#E2E8F0] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-[#0F172A] sm:text-2xl">
              Adaptive Knowledge Assessment
            </h2>
            <p className="mt-1 text-sm text-[#64748B]">
              Answer each question carefully. Correct answers and explanations are revealed after submission.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Assessment concept scope"
            className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1 self-start"
          >
            <button
              type="button"
              role="tab"
              aria-selected={conceptFocus === 'all'}
              onClick={() => handleFocusChange('all')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                conceptFocus === 'all'
                  ? 'bg-white text-[#0F172A] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Full Diagnostic
            </button>
            {CONCEPTS.map((c) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={conceptFocus === c.id}
                onClick={() => handleFocusChange(c.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  conceptFocus === c.id
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {c.shortTitle}
              </button>
            ))}
          </div>
        </div>

        {questionsQuery.isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
        ) : questionsQuery.isError ? (
          <QueryErrorCard
            title="Unable to load assessment questions"
            message="Failed to retrieve questions from the backend."
            onRetry={() => void questionsQuery.refetch()}
          />
        ) : submissionResult ? (
          <AssessmentResultSummary
            result={submissionResult}
            onRetakeOrNew={handleStartNew}
          />
        ) : questions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-sm font-medium text-[#0F172A]">
                No questions available for this concept filter.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => handleFocusChange('all')}
              >
                Switch to Full Diagnostic
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-5">
            <AssessmentProgressBar
              currentIndex={currentIndex}
              totalQuestions={questions.length}
              answeredCount={answeredCount}
              onSelectQuestion={setCurrentIndex}
              answeredMap={answeredMap}
              questionIds={questions.map((q) => q.id)}
            />

            {activeQuestion && (
              <QuestionCard
                question={activeQuestion}
                questionNumber={currentIndex + 1}
                selectedOptionId={answers[activeQuestion.id]}
                onSelectOption={(optId) =>
                  handleSelectOption(activeQuestion.id, optId)
                }
              />
            )}

            <div className="flex flex-col gap-3 rounded-xl border border-[#E2E8F0] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0 || submitMutation.isPending}
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>

              <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                {!allAnswered && (
                  <span className="text-xs text-[#64748B] tabular-nums">
                    {questions.length - answeredCount} remaining before submission
                  </span>
                )}

                {currentIndex < questions.length - 1 ? (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      setCurrentIndex((prev) =>
                        Math.min(questions.length - 1, prev + 1)
                      )
                    }
                  >
                    <span>Next Question</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : null}

                <Button
                  type="button"
                  onClick={() => void handleSubmit()}
                  disabled={!allAnswered || submitMutation.isPending || !activeLearnerId}
                >
                  {submitMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Submitting Assessment...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Submit Assessment</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
