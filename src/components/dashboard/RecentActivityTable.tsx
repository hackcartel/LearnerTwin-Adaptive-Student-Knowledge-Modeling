import { Link } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Skeleton } from '@/src/components/ui/skeleton';
import { CONCEPT_MAP } from '@/src/lib/constants';
import { formatDateShort } from '@/src/lib/utils';
import type { AssessmentHistoryAttempt } from '@/src/types/api';

interface RecentActivityTableProps {
  attempts?: AssessmentHistoryAttempt[];
  isLoading: boolean;
}

export function RecentActivityTable({
  attempts = [],
  isLoading,
}: RecentActivityTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const recentAttempts = [...attempts].reverse().slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-4">
        <div>
          <CardTitle>Recent Assessment Activity</CardTitle>
          <CardDescription className="mt-1">
            Chronological log of submitted quizzes and accuracy outcomes
          </CardDescription>
        </div>
        {attempts.length > 0 && (
          <Link
            to="/analytics"
            className="text-xs font-medium text-[#4F46E5] hover:text-[#4338CA] whitespace-nowrap shrink-0"
          >
            Full Analytics
          </Link>
        )}
      </CardHeader>

      <CardContent>
        {recentAttempts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#E2E8F0] bg-[#F8FAFC] px-6 py-10 text-center">
            <ClipboardList className="h-7 w-7 text-[#94A3B8]" />
            <p className="mt-3 text-sm font-medium text-[#0F172A]">
              No assessments submitted yet
            </p>
            <p className="mt-1 text-xs text-[#64748B]">
              Submit your first assessment to generate evidence for your Knowledge Twin.
            </p>
            <Button asChild size="sm" className="mt-4">
              <Link to="/assessments">Begin Diagnostic</Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-xs font-medium text-[#64748B]">
                  <th className="pb-2.5 pr-4">Attempt</th>
                  <th className="pb-2.5 pr-4">Date</th>
                  <th className="pb-2.5 pr-4">Concept Focus</th>
                  <th className="pb-2.5 pr-4 text-right">Items Correct</th>
                  <th className="pb-2.5 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentAttempts.map((attempt) => {
                  const scorePct = Math.round(attempt.score * 100);
                  const focusTitle =
                    attempt.concept_focus === 'all'
                      ? 'Comprehensive Diagnostic'
                      : CONCEPT_MAP[attempt.concept_focus]?.title ||
                        attempt.concept_focus;

                  return (
                    <tr key={attempt.assessment_id} className="h-11 hover:bg-slate-50/70">
                      <td className="pr-4 font-mono text-xs font-medium text-[#0F172A] tabular-nums">
                        #{attempt.attempt_number}
                      </td>
                      <td className="pr-4 text-xs text-[#64748B] whitespace-nowrap">
                        {formatDateShort(attempt.submitted_at)}
                      </td>
                      <td className="pr-4 text-sm text-[#0F172A] whitespace-nowrap">
                        {focusTitle}
                      </td>
                      <td className="pr-4 text-right font-mono text-xs text-[#64748B] tabular-nums">
                        {attempt.correct_count}/{attempt.total_questions}
                      </td>
                      <td className="text-right font-mono text-xs font-semibold tabular-nums">
                        <span
                          className={
                            scorePct >= 75
                              ? 'text-[#059669]'
                              : scorePct >= 50
                                ? 'text-[#D97706]'
                                : 'text-[#DC2626]'
                          }
                        >
                          {scorePct}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
