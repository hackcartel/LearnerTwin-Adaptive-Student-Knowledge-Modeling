import { useMemo, useState } from 'react';
import { CheckCircle2, ClipboardList, XCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import { CONCEPTS } from '@/src/lib/constants';
import { formatDateShort } from '@/src/lib/utils';
import type { AssessmentHistoryAttempt, ConceptId } from '@/src/types/api';

interface EvidenceHistoryTableProps {
  attempts: AssessmentHistoryAttempt[];
}

export function EvidenceHistoryTable({ attempts }: EvidenceHistoryTableProps) {
  const [conceptFilter, setConceptFilter] = useState<'all' | ConceptId>('all');
  const [outcomeFilter, setOutcomeFilter] = useState<'all' | 'correct' | 'incorrect'>('all');

  const allEvidence = useMemo(
    () =>
      [...attempts]
        .reverse()
        .flatMap((a) => a.evidence_items),
    [attempts]
  );

  const filtered = useMemo(() => {
    return allEvidence.filter((item) => {
      if (conceptFilter !== 'all' && item.concept_id !== conceptFilter) {
        return false;
      }
      if (outcomeFilter === 'correct' && !item.is_correct) return false;
      if (outcomeFilter === 'incorrect' && item.is_correct) return false;
      return true;
    });
  }, [allEvidence, conceptFilter, outcomeFilter]);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Evidence History</CardTitle>
          <CardDescription>
            Item-level response evidence used to update the learner knowledge model
          </CardDescription>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setConceptFilter('all')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                conceptFilter === 'all'
                  ? 'bg-white text-[#0F172A] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              All Concepts
            </button>
            {CONCEPTS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setConceptFilter(c.id)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  conceptFilter === c.id
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {c.shortTitle}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
            {(['all', 'correct', 'incorrect'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setOutcomeFilter(status)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors cursor-pointer whitespace-nowrap ${
                  outcomeFilter === status
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#E2E8F0] bg-[#F8FAFC] px-6 py-10 text-center">
            <ClipboardList className="h-7 w-7 text-[#94A3B8]" />
            <p className="mt-2.5 text-sm font-medium text-[#0F172A]">
              {allEvidence.length === 0
                ? 'No item-level evidence recorded yet'
                : 'No evidence items match the active filters'}
            </p>
            <p className="mt-1 text-xs text-[#64748B]">
              {allEvidence.length === 0
                ? 'Submitted quiz responses will appear here.'
                : 'Adjust the concept or outcome filter to view additional records.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-xs font-medium text-[#64748B]">
                  <th className="pb-2.5 pr-4">Attempt</th>
                  <th className="pb-2.5 pr-4">Date</th>
                  <th className="pb-2.5 pr-4">Concept</th>
                  <th className="pb-2.5 pr-4">Question</th>
                  <th className="pb-2.5 pr-4">Submitted</th>
                  <th className="pb-2.5 text-right">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item, idx) => (
                  <tr
                    key={`${item.question_id}-${item.attempt_number}-${idx}`}
                    className="h-11 hover:bg-slate-50/70"
                  >
                    <td className="pr-4 font-mono text-xs text-[#0F172A] tabular-nums">
                      #{item.attempt_number}
                    </td>
                    <td className="pr-4 text-xs text-[#64748B] whitespace-nowrap">
                      {formatDateShort(item.submitted_at)}
                    </td>
                    <td className="pr-4 text-xs font-medium text-[#0F172A] whitespace-nowrap">
                      {item.concept_title}
                    </td>
                    <td className="max-w-xs truncate pr-4 text-xs text-[#0F172A]">
                      {item.question_prompt}
                    </td>
                    <td className="pr-4 font-mono text-xs text-[#64748B] whitespace-nowrap">
                      {item.selected_answer_text}
                      {item.misconception_tag && (
                        <span className="ml-2 font-sans text-[#D97706]">
                          · {item.misconception_tag}
                        </span>
                      )}
                    </td>
                    <td className="text-right text-xs font-medium whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 ${
                          item.is_correct ? 'text-[#059669]' : 'text-[#DC2626]'
                        }`}
                      >
                        {item.is_correct ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Correct</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Incorrect</span>
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
