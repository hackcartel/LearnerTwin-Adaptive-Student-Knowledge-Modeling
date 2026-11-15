import type { ConceptId } from '@/src/types/api';

export interface ConceptMeta {
  id: ConceptId;
  title: string;
  shortTitle: string;
  sequenceOrder: number;
  description: string;
  prerequisites: ConceptId[];
  practiceFocus: string;
}

export const CONCEPTS: ConceptMeta[] = [
  {
    id: 'variables_and_data_types',
    title: 'Variables & Data Types',
    shortTitle: 'Variables',
    sequenceOrder: 1,
    description:
      'Variable binding, reassignment semantics, primitive types (int, float, str, bool), and explicit type conversion.',
    prerequisites: [],
    practiceFocus: 'Tracing variable reassignment and predicting output types after arithmetic or string concatenation.',
  },
  {
    id: 'conditionals',
    title: 'Conditionals',
    shortTitle: 'Conditionals',
    sequenceOrder: 2,
    description:
      'Boolean expressions, relational operators, short-circuit evaluation, and mutually exclusive if / elif / else branching.',
    prerequisites: ['variables_and_data_types'],
    practiceFocus: 'Distinguishing chained if statements from if-elif-else blocks and evaluating compound boolean logic.',
  },
  {
    id: 'loops',
    title: 'Loops',
    shortTitle: 'Loops',
    sequenceOrder: 3,
    description:
      'Deterministic for-range iteration, while loop termination conditions, accumulator updates, and off-by-one boundary tracing.',
    prerequisites: ['variables_and_data_types', 'conditionals'],
    practiceFocus: 'Tracing loop counter bounds, accumulator variables across iterations, and loop exit conditions.',
  },
];

export const CONCEPT_MAP: Record<ConceptId, ConceptMeta> = {
  variables_and_data_types: CONCEPTS[0],
  conditionals: CONCEPTS[1],
  loops: CONCEPTS[2],
};

export function getMasteryBand(masteryPercent: number | null): {
  label: string;
  tone: 'positive' | 'warning' | 'error' | 'neutral';
  textClass: string;
  barClass: string;
  surfaceClass: string;
} {
  if (masteryPercent === null) {
    return {
      label: 'Not Yet Assessed',
      tone: 'neutral',
      textClass: 'text-[#64748B]',
      barClass: 'bg-slate-300',
      surfaceClass: 'bg-slate-100',
    };
  }
  if (masteryPercent >= 75) {
    return {
      label: 'Proficient',
      tone: 'positive',
      textClass: 'text-[#059669]',
      barClass: 'bg-[#10B981]',
      surfaceClass: 'bg-[#ECFDF5]',
    };
  }
  if (masteryPercent >= 50) {
    return {
      label: 'Developing',
      tone: 'warning',
      textClass: 'text-[#D97706]',
      barClass: 'bg-[#F59E0B]',
      surfaceClass: 'bg-[#FFFBEB]',
    };
  }
  return {
    label: 'Needs Practice',
    tone: 'error',
    textClass: 'text-[#DC2626]',
    barClass: 'bg-[#EF4444]',
    surfaceClass: 'bg-[#FEF2F2]',
  };
}
