import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import { CONCEPTS } from '@/src/lib/constants';
import type { ConceptMasterySnapshot } from '@/src/types/api';

interface PerformanceBreakdownChartProps {
  snapshots: ConceptMasterySnapshot[];
}

export function PerformanceBreakdownChart({
  snapshots,
}: PerformanceBreakdownChartProps) {
  const assessed = CONCEPTS.map((c) => {
    const snap = snapshots.find((s) => s.concept_id === c.id);
    const total = snap?.total_questions ?? 0;
    const correct = snap?.correct_count ?? 0;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : null;
    return {
      concept: c.shortTitle,
      fullTitle: c.title,
      accuracy: accuracy ?? 0,
      hasData: total > 0,
      correct,
      total,
    };
  });

  const hasAnyEvidence = assessed.some((item) => item.hasData);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assessment Performance Breakdown</CardTitle>
        <CardDescription>
          Observed item-level accuracy by concept (not a predictive score)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasAnyEvidence ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-[#E2E8F0] bg-[#F8FAFC] px-6 text-center">
            <BarChart2 className="h-7 w-7 text-[#94A3B8]" />
            <p className="mt-2.5 text-sm font-medium text-[#0F172A]">
              No concept evidence recorded yet
            </p>
            <p className="mt-1 max-w-sm text-xs text-[#64748B]">
              Accuracy bars will appear once at least one assessment item per concept is submitted.
            </p>
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={assessed} margin={{ top: 8, right: 16, left: -12, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="concept"
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
                  formatter={(value: unknown, _name: unknown, item: { payload?: { hasData?: boolean; correct?: number; total?: number } }) => {
                    if (!item?.payload?.hasData) return ['Not yet assessed', 'Accuracy'];
                    return [`${value}% (${item.payload.correct}/${item.payload.total})`, 'Observed Accuracy'];
                  }}
                />
                <Bar dataKey="accuracy" radius={[6, 6, 0, 0]} maxBarSize={56}>
                  {assessed.map((entry) => (
                    <Cell
                      key={entry.concept}
                      fill={
                        !entry.hasData
                          ? '#E2E8F0'
                          : entry.accuracy >= 75
                            ? '#10B981'
                            : entry.accuracy >= 50
                              ? '#F59E0B'
                              : '#EF4444'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
