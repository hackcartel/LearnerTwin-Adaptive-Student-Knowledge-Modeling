import { motion } from 'motion/react';
import { Card, CardContent, CardHeader } from '@/src/components/ui/card';
import type { Question } from '@/src/types/api';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  selectedOptionId?: string;
  onSelectOption: (optionId: string) => void;
}

export function QuestionCard({
  question,
  questionNumber,
  selectedOptionId,
  onSelectOption,
}: QuestionCardProps) {
  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card>
        <CardHeader className="space-y-3 pb-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B]">
            <span className="font-medium text-[#4F46E5]">{question.concept_title}</span>
            <span aria-hidden="true">·</span>
            <span className="capitalize">{question.difficulty}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">Item {questionNumber}</span>
          </div>
          <h2 className="font-display text-lg font-semibold leading-snug text-[#0F172A] sm:text-xl">
            {question.prompt}
          </h2>
        </CardHeader>

        <CardContent className="space-y-5">
          {question.code_snippet && (
            <pre className="overflow-x-auto rounded-lg bg-[#0F172A] p-4 font-mono text-xs leading-relaxed text-slate-100 sm:text-sm">
              <code>{question.code_snippet}</code>
            </pre>
          )}

          <div
            role="radiogroup"
            aria-label={`Answer choices for question ${questionNumber}`}
            className="space-y-2.5"
          >
            {question.options.map((option) => {
              const isSelected = selectedOptionId === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => onSelectOption(option.id)}
                  className={`flex w-full items-center gap-3.5 rounded-xl border px-4 py-3.5 text-left text-sm transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] ${
                    isSelected
                      ? 'border-[#4F46E5] bg-[#EEF2FF]/70 text-[#0F172A]'
                      : 'border-[#E2E8F0] bg-white text-[#0F172A] hover:border-slate-300 hover:bg-slate-50/70'
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md font-mono text-xs font-semibold transition-colors ${
                      isSelected
                        ? 'bg-[#4F46E5] text-white'
                        : 'bg-slate-100 text-[#64748B]'
                    }`}
                  >
                    {option.label}
                  </span>
                  <span className="leading-snug">{option.text}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
