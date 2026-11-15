import { Link } from 'react-router-dom';
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
import { Button } from '@/src/components/ui/button';
import { Skeleton } from '@/src/components/ui/skeleton';
import { formatDateShort, formatMasteryScore } from '@/src/lib/utils';
import type { AssessmentHistoryAttempt } from '@/src/types/api';

interface KnowledgeEvolutionChartProps {
  attempts?: AssessmentHistoryAttempt[];
  isLoading: boolean;
}

export function KnowledgeEvolutionChart({
  attempts = [],
  isLoading,
}: KnowledgeEvolutionChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  const hasSufficientHistory = attempts.length >= 2;

  const chartData = attempts.map((attempt) => ({
    name: `Attempt ${attempt.attempt_number}`,
    date: formatDateShort(attempt.submitted_at),
    variables: formatMasteryScore(attempt.mastery_by_concept.variables_and_data_types),
    conditionals: formatMasteryScore(attempt.mastery_by_concept.conditionals),
    loops: formatMasteryScore(attempt.mastery_by_concept.loops),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Knowledge Evolution</CardTitle>
        <CardDescription>
          Estimated concept mastery trajectory across sequential assessment attempts
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasSufficientHistory ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-[#E2E8F0] bg-[#F8FAFC] px-6 text-center">
            <LineChartIcon className="h-8 w-8 text-[#94A3B8]" />
            <p className="mt-3 text-sm font-medium text-[#0F172A]">
              {attempts.length === 0
                ? 'No assessment history available yet'
                : 'At least 2 assessment attempts are needed to plot mastery evolution'}
            </p>
            <p className="mt-1 max-w-md text-xs leading-relaxed text-[#64748B]">
              LearnerTwin only plots historical curves from recorded evidence. Complete{' '}
              {attempts.length === 0 ? 'two assessments' : 'one more assessment'} to observe
              how mastery estimates shift over time.
            </p>
            <Button asChild size="sm" variant="outline" className="mt-4">
              <Link to="/assessments">Take Assessment</Link>
            </Button>
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 16, left: -12, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  dataKey="name"
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
                    boxShadow: '0 4px 12px rgba(15,23,42,0.06)',
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
