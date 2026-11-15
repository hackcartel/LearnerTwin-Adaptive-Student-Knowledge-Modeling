import { motion } from 'motion/react';
import { Info } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/src/components/ui/tooltip';
import { CONCEPTS, getMasteryBand } from '@/src/lib/constants';
import { formatMasteryScore } from '@/src/lib/utils';
import type {
  ConceptId,
  ConceptMasterySnapshot,
  RecommendationResponse,
} from '@/src/types/api';

interface KnowledgeGraphCanvasProps {
  snapshots: ConceptMasterySnapshot[];
  selectedConceptId: ConceptId;
  onSelectConcept: (id: ConceptId) => void;
  recommendation?: RecommendationResponse;
}

const NODE_RING_COLORS: Record<'positive' | 'warning' | 'error' | 'neutral', string> = {
  positive: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  neutral: '#CBD5E1',
};

export function KnowledgeGraphCanvas({
  snapshots,
  selectedConceptId,
  onSelectConcept,
  recommendation,
}: KnowledgeGraphCanvasProps) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle>Interactive Concept Knowledge Graph</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label="About mastery model estimates"
                    className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[#64748B] hover:bg-slate-100 hover:text-[#0F172A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] cursor-pointer"
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  Mastery values are model estimates inferred from assessment responses,
                  not definitive measurements of understanding or psychological traits.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <CardDescription className="mt-1">
            Select any concept node to inspect evidence, misconception patterns, and attempt trajectory
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <div className="relative rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-5 sm:p-8">
          {/* Desktop dependency connector lines */}
          <svg
            aria-hidden="true"
            viewBox="0 0 800 180"
            className="pointer-events-none absolute inset-x-0 top-1/2 hidden h-36 w-full -translate-y-1/2 px-16 md:block"
            preserveAspectRatio="none"
          >
            <defs>
              <marker
                id="lt-arrow"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#94A3B8" />
              </marker>
            </defs>
            <line
              x1="210"
              y1="90"
              x2="335"
              y2="90"
              stroke="#CBD5E1"
              strokeWidth="2"
              strokeDasharray="5 4"
              markerEnd="url(#lt-arrow)"
            />
            <line
              x1="465"
              y1="90"
              x2="590"
              y2="90"
              stroke="#CBD5E1"
              strokeWidth="2"
              strokeDasharray="5 4"
              markerEnd="url(#lt-arrow)"
            />
          </svg>

          <div className="relative z-10 grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
            {CONCEPTS.map((concept) => {
              const snapshot = snapshots.find((s) => s.concept_id === concept.id);
              const pct = formatMasteryScore(snapshot?.estimated_mastery);
              const band = getMasteryBand(pct);
              const isSelected = selectedConceptId === concept.id;
              const isRecommended =
                recommendation?.recommended_concept_id === concept.id;
              const strokeOffset =
                pct !== null
                  ? circumference - (pct / 100) * circumference
                  : circumference;

              return (
                <motion.button
                  key={concept.id}
                  type="button"
                  onClick={() => onSelectConcept(concept.id)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                  aria-pressed={isSelected}
                  className={`flex flex-col items-center rounded-xl border bg-white p-5 text-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] ${
                    isSelected
                      ? 'border-[#4F46E5] shadow-[0_4px_14px_rgba(79,70,229,0.12)]'
                      : 'border-[#E2E8F0] hover:border-slate-300'
                  }`}
                >
                  <div className="flex w-full items-center justify-between text-[11px] font-medium text-[#64748B]">
                    <span>0{concept.sequenceOrder}</span>
                    {isRecommended && (
                      <span className="text-[#4F46E5] font-semibold">
                        Recommended
                      </span>
                    )}
                  </div>

                  <div className="relative my-4 flex h-24 w-24 items-center justify-center">
                    <svg className="h-24 w-24 -rotate-90" viewBox="0 0 84 84">
                      <circle
                        cx="42"
                        cy="42"
                        r={radius}
                        fill="none"
                        stroke="#F1F5F9"
                        strokeWidth="7"
                      />
                      <motion.circle
                        cx="42"
                        cy="42"
                        r={radius}
                        fill="none"
                        stroke={NODE_RING_COLORS[band.tone]}
                        strokeWidth="7"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: strokeOffset }}
                        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-display text-lg font-bold text-[#0F172A] tabular-nums">
                        {pct !== null ? `${pct}%` : '—'}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-display text-sm font-semibold text-[#0F172A]">
                    {concept.title}
                  </h3>

                  <p className={`mt-1 text-xs font-medium ${band.textClass}`}>
                    {band.label}
                  </p>

                  <p className="mt-2 text-xs text-[#64748B] tabular-nums">
                    {snapshot && snapshot.attempts_count > 0
                      ? `${snapshot.attempts_count} ${snapshot.attempts_count === 1 ? 'attempt' : 'attempts'} · ${snapshot.correct_count}/${snapshot.total_questions} items`
                      : 'No evidence recorded'}
                  </p>
                </motion.button>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E8F0] pt-4 text-xs text-[#64748B]">
            <span>
              Prerequisite flow: Variables & Data Types → Conditionals → Loops
            </span>
            <span>
              Probabilistic estimates reflect observed assessment evidence only
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
