import { Progress } from '@/src/components/ui/progress';

interface AssessmentProgressBarProps {
  currentIndex: number;
  totalQuestions: number;
  answeredCount: number;
  onSelectQuestion: (index: number) => void;
  answeredMap: Record<string, boolean>;
  questionIds: string[];
}

export function AssessmentProgressBar({
  currentIndex,
  totalQuestions,
  answeredCount,
  onSelectQuestion,
  answeredMap,
  questionIds,
}: AssessmentProgressBarProps) {
  const progressPct =
    totalQuestions > 0 ? Math.round(((currentIndex + 1) / totalQuestions) * 100) : 0;

  return (
    <div className="space-y-3 rounded-xl border border-[#E2E8F0] bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
        <span className="font-display font-semibold text-[#0F172A] tabular-nums">
          Question {currentIndex + 1} of {totalQuestions}
        </span>
        <span className="text-[#64748B] tabular-nums">
          {answeredCount} of {totalQuestions} answered
        </span>
      </div>

      <Progress value={progressPct} aria-label="Assessment question progress" />

      <div className="flex flex-wrap items-center gap-1.5 pt-1" role="navigation" aria-label="Question steps">
        {questionIds.map((qId, idx) => {
          const isCurrent = idx === currentIndex;
          const isAnswered = Boolean(answeredMap[qId]);
          return (
            <button
              key={qId}
              type="button"
              onClick={() => onSelectQuestion(idx)}
              className={`h-8 min-w-8 rounded-md px-2 font-mono text-xs font-medium transition-colors cursor-pointer tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] ${
                isCurrent
                  ? 'bg-[#4F46E5] text-white'
                  : isAnswered
                    ? 'bg-[#EEF2FF] text-[#4F46E5] hover:bg-indigo-100'
                    : 'bg-slate-100 text-[#64748B] hover:bg-slate-200'
              }`}
              aria-current={isCurrent ? 'step' : undefined}
              aria-label={`Jump to question ${idx + 1}${isAnswered ? ' (answered)' : ''}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
