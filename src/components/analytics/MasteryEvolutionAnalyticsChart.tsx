import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { LineChart as LineChartIcon } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import { formatDateShort, formatMasteryScore } from '@/src/lib/utils';
import type { AssessmentHistoryAttempt } from '@/src/types/api';

interface MasteryEvolutionAnalyticsChartProps {
  attempts: AssessmentHistoryAttempt[];
}

export function MasteryEvolutionAnalyticsChart({
  attempts,
}: MasteryEvolutionAnalyticsChartProps) {
  const hasSufficientData = attempts.length >= 2;

  const data = attempts.map((a) => ({
    attempt: `#${a.attempt_number}`,
    date: formatDateShort(a.submitted_at),
    variables: formatMasteryScore(a.mastery_by_concept.variables_and_data_types),
    conditionals: formatMasteryScore(a.mastery_by_concept.conditionals),
    loops: formatMasteryScore(a.mastery_by_concept.loops),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Concept-Level Mastery Evolution</CardTitle>
        <CardDescription>
          Trajectory of probabilistic mastery estimates across completed attempts
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasSufficientData ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-[#E2E8F0] bg-[#F8FAFC] px-6 text-center">
            <LineChartIcon className="h-7 w-7 text-[#94A3B8]" />
            <p className="mt-2.5 text-sm font-medium text-[#0F172A]">
              Insufficient sample size ({attempts.length} of 2 attempts)
            </p>
            <p className="mt-1 max-w-sm text-xs text-[#64748B]">
              At least two assessment submissions are required to display a longitudinal mastery curve.
            </p>
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, right: 16, left: -12, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  dataKey="attempt"
                  tick={{ fill: '#64748B', fontSize: 12 }}
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
                  formatter={(value: unknown) =>
                    typeof value === 'number' ? [`${value}%`, undefined] : ['—', undefined]
                  }
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Line
                  type="monotone"
                  dataKey="variables"
                  name="Variables & Data Types"
                  stroke="#4F46E5"
                  strokeWidth={2.25}
                  dot={{ r: 3.5 }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="conditionals"
                  name="Conditionals"
                  stroke="#7C3AED"
                  strokeWidth={2.25}
                  dot={{ r: 3.5 }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="loops"
                  name="Loops"
                  stroke="#10B981"
                  strokeWidth={2.25}
                  dot={{ r: 3.5 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
