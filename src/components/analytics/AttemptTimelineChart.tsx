import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import { CONCEPT_MAP } from '@/src/lib/constants';
import { formatDateShort } from '@/src/lib/utils';
import type { AssessmentHistoryAttempt } from '@/src/types/api';

interface AttemptTimelineChartProps {
  attempts: AssessmentHistoryAttempt[];
}

export function AttemptTimelineChart({ attempts }: AttemptTimelineChartProps) {
  const data = attempts.map((a) => ({
    label: `#${a.attempt_number} (${formatDateShort(a.submitted_at).replace(/,\s*\d{4}$/, '')})`,
    scorePct: Math.round(a.score * 100),
    focus:
      a.concept_focus === 'all'
        ? 'Diagnostic'
        : CONCEPT_MAP[a.concept_focus]?.shortTitle || a.concept_focus,
    items: `${a.correct_count}/${a.total_questions}`,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assessment Attempt Timeline</CardTitle>
        <CardDescription>
          Observed percentage score across each chronological submission
        </CardDescription>
      </CardHeader>
      <CardContent>
        {attempts.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-[#E2E8F0] bg-[#F8FAFC] px-6 text-center">
            <BarChart3 className="h-7 w-7 text-[#94A3B8]" />
            <p className="mt-2.5 text-sm font-medium text-[#0F172A]">
              No assessment attempts recorded
            </p>
            <p className="mt-1 max-w-sm text-xs text-[#64748B]">
              Submit an assessment to populate the chronological performance timeline.
            </p>
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 16, left: -12, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  unit="%"
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                  }}
                  formatter={(value: unknown) => [`${value}%`, 'Assessment Score']}
                />
                <Bar
                  dataKey="scorePct"
                  fill="#4F46E5"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
