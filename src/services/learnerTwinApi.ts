import { CONCEPTS, CONCEPT_MAP } from '@/src/lib/constants';
import {
  API_BASE_URL,
  apiClient,
  inspectOpenApiSpec,
} from '@/src/services/apiClient';
import {
  demoCreateLearner,
  demoGetHistory,
  demoGetMisconceptions,
  demoGetProfile,
  demoGetQuestions,
  demoGetRecommendation,
  demoListLearners,
  demoSubmitAssessment,
  resetDemoState,
} from '@/src/services/demoBackend';
import type {
  AssessmentSubmissionResponse,
  BackendConnectionInfo,
  BackendMode,
  ConceptId,
  CreateLearnerRequest,
  HistoryResponse,
  Learner,
  LearnerProfileResponse,
  MisconceptionsResponse,
  Question,
  RecommendationResponse,
  SubmitAssessmentRequest,
} from '@/src/types/api';

let currentMode: BackendMode = 'demo';

export function getBackendMode(): BackendMode {
  return currentMode;
}

export async function checkBackendConnection(): Promise<BackendConnectionInfo> {
  const checkedAt = new Date().toISOString();
  const spec = await inspectOpenApiSpec();

  if (spec.reachable && spec.verified) {
    currentMode = 'live';
    return {
      mode: 'live',
      baseUrl: API_BASE_URL,
      reachable: true,
      openApiVerified: true,
      openApiTitle: spec.title,
      openApiVersion: spec.version,
      lastCheckedAt: checkedAt,
    };
  }

  currentMode = 'demo';
  return {
    mode: 'demo',
    baseUrl: API_BASE_URL,
    reachable: spec.reachable,
    openApiVerified: false,
    lastCheckedAt: checkedAt,
    errorMessage:
      spec.errorMessage ||
      `FastAPI backend at ${API_BASE_URL} is unavailable. Showing Demo Mode with fictional sample records.`,
  };
}

function normalizeConceptId(raw: string): ConceptId {
  const cleaned = raw.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  if (cleaned.includes('variable')) return 'variables_and_data_types';
  if (cleaned.includes('conditional')) return 'conditionals';
  if (cleaned.includes('loop')) return 'loops';
  return 'variables_and_data_types';
}

function backendConceptId(conceptId: ConceptId): string {
  return conceptId === 'variables_and_data_types' ? 'variables' : conceptId;
}

function normalizeRecommendation(
  data: Record<string, unknown>,
  learnerId: string
): RecommendationResponse {
  const conceptId = normalizeConceptId(
    String(data.recommended_concept_id ?? data.concept_id ?? data.concept ?? 'variables')
  );
  return {
    learner_id: String(data.learner_id ?? learnerId),
    recommended_concept_id: conceptId,
    recommended_concept_title: String(
      data.recommended_concept_title ??
        data.concept_name ??
        CONCEPT_MAP[conceptId].title
    ),
    activity_title: String(
      data.activity_title ?? `Practice ${CONCEPT_MAP[conceptId].title}`
    ),
    activity_type:
      data.activity_type === 'diagnostic' || data.activity_type === 'mastery_reinforcement'
        ? data.activity_type
        : 'targeted_practice',
    reason: String(data.reason ?? data.explanation ?? ''),
    generated_at: String(data.generated_at ?? new Date().toISOString()),
  };
}

export async function listLearners(): Promise<Learner[]> {
  if (currentMode === 'demo') {
    return demoListLearners();
  }
  const res = await apiClient.get<Record<string, unknown>[] | { learners: Record<string, unknown>[] }>('/learners');
  const data = Array.isArray(res.data) ? res.data : res.data.learners;
  if (!Array.isArray(data)) {
    throw new Error('FastAPI returned an invalid learner list.');
  }
  return data.map((raw) => ({
    id: String(raw.id ?? raw.learner_id ?? ''),
    name: String(raw.name ?? raw.nickname ?? 'Learner'),
    learning_track: String(raw.learning_track ?? 'Python Foundations'),
    goal: raw.goal ? String(raw.goal) : undefined,
    created_at: String(raw.created_at ?? new Date().toISOString()),
    is_sample: false,
  }));
}

export async function createLearner(payload: CreateLearnerRequest): Promise<Learner> {
  if (currentMode === 'demo') {
    return demoCreateLearner(payload);
  }
  const res = await apiClient.post<Record<string, unknown>>('/learners', {
    nickname: payload.name,
    learning_track: payload.learning_track,
    goal: payload.goal,
  });
  const raw = res.data;
  const learner: Learner = {
    id: String(raw.id ?? raw.learner_id ?? ''),
    name: String(raw.name ?? raw.nickname ?? payload.name),
    learning_track: String(raw.learning_track ?? payload.learning_track),
    goal: raw.goal ? String(raw.goal) : payload.goal,
    created_at: String(raw.created_at ?? new Date().toISOString()),
    is_sample: false,
  };
  return learner;
}

export async function fetchQuestions(
  conceptFocus?: ConceptId | 'all'
): Promise<Question[]> {
  if (currentMode === 'demo') {
    return demoGetQuestions(conceptFocus);
  }
  const params =
    conceptFocus && conceptFocus !== 'all'
      ? { concept_id: backendConceptId(conceptFocus) }
      : undefined;
  const res = await apiClient.get<Record<string, unknown>[] | { questions: Record<string, unknown>[] }>(
    '/questions',
    { params }
  );
  const list = Array.isArray(res.data) ? res.data : res.data.questions ?? [];
  return list.map((q) => {
    const conceptId = normalizeConceptId(String(q.concept_id ?? q.concept ?? 'variables_and_data_types'));
    const rawOptions = Array.isArray(q.options) ? q.options : [];
    return {
      id: String(q.id ?? q.question_id),
      concept_id: conceptId,
      concept_title: String(q.concept_title ?? CONCEPT_MAP[conceptId].title),
      difficulty:
        q.difficulty === 'intermediate' || q.difficulty === 'applied'
          ? q.difficulty
          : 'foundational',
      prompt: String(q.prompt ?? q.question ?? q.text ?? ''),
      code_snippet: q.code_snippet ? String(q.code_snippet) : undefined,
      options: rawOptions.map((option: unknown, idx: number) => {
        const opt =
          typeof option === 'object' && option !== null
            ? (option as Record<string, unknown>)
            : {};
        const text = typeof option === 'string' ? option : opt.text ?? opt.label_text ?? '';
        return {
          id: String(opt.id ?? opt.option_id ?? text ?? String.fromCharCode(97 + idx)),
          label: String(opt.label ?? String.fromCharCode(65 + idx)),
          text: String(text),
        };
      }),
    };
  });
}

export async function fetchLearnerProfile(
  learnerId: string
): Promise<LearnerProfileResponse> {
  if (currentMode === 'demo') {
    return demoGetProfile(learnerId);
  }
  const res = await apiClient.get<Record<string, unknown>>(`/learners/${learnerId}/profile`);
  const data = res.data;

  const rawMastery = Array.isArray(data.concept_mastery)
    ? (data.concept_mastery as Record<string, unknown>[])
    : Array.isArray(data.concepts)
      ? (data.concepts as Record<string, unknown>[])
      : [];

  const masteryList = CONCEPTS.map((c) => {
    const found = rawMastery.find(
      (m) => normalizeConceptId(String(m.concept_id ?? m.concept ?? '')) === c.id
    );
    const attempts = Number(found?.attempts_count ?? found?.attempts ?? 0);
    const est = found?.estimated_mastery ?? found?.mastery;
    return {
      concept_id: c.id,
      concept_title: c.title,
      estimated_mastery: attempts > 0 && typeof est === 'number' ? est : null,
      attempts_count: attempts,
      correct_count: Number(found?.correct_count ?? 0),
      total_questions: Number(found?.total_questions ?? attempts),
      last_assessed_at: found?.last_assessed_at ? String(found.last_assessed_at) : undefined,
    };
  });

  const assessedCount = masteryList.filter((m) => m.estimated_mastery !== null).length;
  const rawLearner = (data.learner as Record<string, unknown> | undefined) ?? data;

  return {
    learner: {
      id: String(rawLearner.id ?? learnerId),
      name: String(rawLearner.name ?? rawLearner.nickname ?? 'Learner'),
      learning_track: String(rawLearner.learning_track ?? 'Python Foundations'),
      goal: rawLearner.goal ? String(rawLearner.goal) : undefined,
      created_at: String(rawLearner.created_at ?? new Date().toISOString()),
      is_sample: false,
    },
    concepts_assessed: Number(data.concepts_assessed ?? assessedCount),
    total_concepts: Number(data.total_concepts ?? CONCEPTS.length),
    assessments_completed: Number(
      data.assessments_completed ??
        rawMastery.reduce(
          (total, concept) => total + Number(concept.attempts_count ?? concept.attempts ?? 0),
          0
        )
    ),
    overall_mastery:
      typeof data.overall_mastery === 'number' ? data.overall_mastery : null,
    concept_mastery: masteryList,
  };
}

export async function fetchLearnerRecommendation(
  learnerId: string
): Promise<RecommendationResponse> {
  if (currentMode === 'demo') {
    return demoGetRecommendation(learnerId);
  }
  const res = await apiClient.get<Record<string, unknown>>(
    `/learners/${learnerId}/recommendation`
  );
  return normalizeRecommendation(res.data, learnerId);
}

export async function fetchLearnerMisconceptions(
  learnerId: string
): Promise<MisconceptionsResponse> {
  if (currentMode === 'demo') {
    return demoGetMisconceptions(learnerId);
  }
  const res = await apiClient.get<Record<string, unknown>>(
    `/learners/${learnerId}/misconceptions`
  );
  const rawList = Array.isArray(res.data)
    ? res.data
    : (res.data.misconceptions as Record<string, unknown>[] | undefined) ??
      (res.data.signals as Record<string, unknown>[] | undefined) ??
      [];

  return {
    learner_id: learnerId,
    misconceptions: rawList.map((m, idx) => {
      const conceptId = normalizeConceptId(String(m.concept_id ?? m.concept ?? ''));
      return {
        id: String(m.id ?? `misc-${idx}`),
        concept_id: conceptId,
        concept_title: String(m.concept_title ?? CONCEPT_MAP[conceptId].title),
        tag: String(m.tag ?? m.misconception_tag ?? m.pattern ?? 'Misconception'),
        description: String(
          m.description ?? 'This tag was recorded for an incorrect response; it is not a confirmed diagnosis.'
        ),
        occurrences: Number(m.occurrences ?? m.count ?? 1),
        last_observed_at: String(
          m.last_observed_at ?? m.created_at ?? new Date().toISOString()
        ),
        example_question_prompt: m.example_question_prompt
          ? String(m.example_question_prompt)
          : undefined,
      };
    }),
  };
}

export async function fetchLearnerHistory(
  learnerId: string
): Promise<HistoryResponse> {
  if (currentMode === 'demo') {
    return demoGetHistory(learnerId);
  }
  const res = await apiClient.get<Record<string, unknown>>(
    `/learners/${learnerId}/history`
  );
  const rawAttempts = Array.isArray(res.data)
    ? (res.data as Record<string, unknown>[])
    : (res.data.attempts as Record<string, unknown>[] | undefined) ?? [];
  const groupedAttempts = new Map<string, Record<string, unknown>[]>();
  rawAttempts.forEach((attempt, index) => {
    const key = String(
      attempt.assessment_id ?? attempt.created_at ?? `attempt-${index + 1}`
    );
    const group = groupedAttempts.get(key);
    if (group) {
      group.push(attempt);
    } else {
      groupedAttempts.set(key, [attempt]);
    }
  });

  return {
    learner_id: learnerId,
    attempts: [...groupedAttempts.entries()].map(([id, items], idx) => {
      const submittedAt = String(
        items[0].submitted_at ?? items[0].created_at ?? new Date().toISOString()
      );
      const evidenceItems = items.map((item) => {
        const conceptId = normalizeConceptId(String(item.concept_id ?? ''));
        const correct = Boolean(item.correct);
        const selectedAnswer = String(item.selected_answer ?? '');
        return {
          question_id: String(item.question_id ?? ''),
          concept_id: conceptId,
          concept_title: CONCEPT_MAP[conceptId].title,
          question_prompt: String(item.prompt ?? ''),
          selected_answer_text: selectedAnswer,
          is_correct: correct,
          misconception_tag: item.misconception_tag
            ? String(item.misconception_tag)
            : undefined,
          submitted_at: submittedAt,
          attempt_number: idx + 1,
        };
      });
      const correctCount = evidenceItems.filter((item) => item.is_correct).length;
      const conceptsInAttempt = new Set(evidenceItems.map((item) => item.concept_id));
      const masteryByConcept: Partial<Record<ConceptId, number>> = {};
      items.forEach((item, itemIndex) => {
        if (typeof item.mastery_after === 'number') {
          masteryByConcept[evidenceItems[itemIndex].concept_id] = item.mastery_after;
        }
      });
      const singleConcept = evidenceItems[0]?.concept_id ?? 'variables_and_data_types';
      return {
        assessment_id: id,
        attempt_number: idx + 1,
        submitted_at: submittedAt,
        concept_focus:
          items[0].concept_focus === 'all' || conceptsInAttempt.size > 1
            ? 'all'
            : items[0].concept_focus
              ? normalizeConceptId(String(items[0].concept_focus))
              : singleConcept,
        score: evidenceItems.length ? correctCount / evidenceItems.length : 0,
        correct_count: correctCount,
        total_questions: evidenceItems.length,
        mastery_by_concept: masteryByConcept,
        evidence_items: evidenceItems,
      };
    }),
  };
}

export async function submitAssessment(
  learnerId: string,
  payload: SubmitAssessmentRequest
): Promise<AssessmentSubmissionResponse> {
  if (currentMode === 'demo') {
    return demoSubmitAssessment(learnerId, payload);
  }
  const res = await apiClient.post<Record<string, unknown>>(
    `/learners/${learnerId}/assessments`,
    {
      answers: payload.answers.map((answer) => ({
        question_id: answer.question_id,
        selected_answer: answer.selected_option_id,
      })),
    }
  );
  const data = res.data;
  const rawResults = Array.isArray(data.results)
    ? (data.results as Record<string, unknown>[])
    : [];
  const rawProfile = Array.isArray(data.profile)
    ? (data.profile as Record<string, unknown>[])
    : [];
  const responseByQuestion = new Map(
    rawResults.map((item) => [String(item.question_id), item])
  );
  const questionResults = payload.answers.map((answer) => {
    const result = responseByQuestion.get(answer.question_id);
    if (!result) {
      throw new Error(`FastAPI omitted assessment result for ${answer.question_id}.`);
    }
    const conceptId = normalizeConceptId(String(result.concept_id ?? ''));
    const isCorrect = Boolean(result.correct);
    const selectedText = String(result.selected_answer ?? answer.selected_option_id);
    const correctText = String(result.correct_answer ?? '');
    return {
      question_id: answer.question_id,
      concept_id: conceptId,
      concept_title: CONCEPT_MAP[conceptId].title,
      prompt: String(result.prompt ?? ''),
      selected_option_id: answer.selected_option_id,
      selected_option_text: selectedText,
      correct_option_id: correctText,
      correct_option_text: correctText,
      is_correct: isCorrect,
      explanation: isCorrect
        ? `Correct. The answer is ${correctText}.`
        : `The correct answer is ${correctText}. Review this concept and try a similar question.`,
      detected_misconception: result.misconception_tag
        ? String(result.misconception_tag)
        : undefined,
    };
  });
  const correctCount = questionResults.filter((item) => item.is_correct).length;
  const answeredPerConcept = new Map<ConceptId, number>();
  for (const result of questionResults) {
    answeredPerConcept.set(
      result.concept_id,
      (answeredPerConcept.get(result.concept_id) ?? 0) + 1
    );
  }
  const updatedMastery = CONCEPTS.map((concept) => {
    const current = rawProfile.find(
      (item) => normalizeConceptId(String(item.concept_id ?? '')) === concept.id
    );
    const attempts = Number(current?.attempts ?? 0);
    const previousResult = rawResults.find(
      (item) => normalizeConceptId(String(item.concept_id ?? '')) === concept.id
    );
    const previousAttempts = answeredPerConcept.get(concept.id) ?? 0;
    return {
      concept_id: concept.id,
      concept_title: concept.title,
      estimated_mastery:
        attempts > 0 && typeof current?.mastery === 'number' ? current.mastery : null,
      previous_mastery:
        attempts <= previousAttempts
          ? null
          : typeof previousResult?.mastery_before === 'number'
            ? previousResult.mastery_before
            : null,
      attempts_count: attempts,
      correct_count: Number(current?.correct_count ?? 0),
      total_questions: attempts,
    };
  });
  return {
    assessment_id: String(data.assessment_id ?? `assessment-${Date.now()}`),
    learner_id: learnerId,
    submitted_at: String(data.submitted_at ?? new Date().toISOString()),
    concept_focus: payload.concept_focus ?? 'all',
    score: questionResults.length ? correctCount / questionResults.length : 0,
    correct_count: correctCount,
    total_questions: questionResults.length,
    question_results: questionResults,
    updated_mastery: updatedMastery,
    recommendation: normalizeRecommendation(
      (data.recommendation as Record<string, unknown> | undefined) ?? {},
      learnerId
    ),
  };
}

export function resetDemoWorkspace(): void {
  resetDemoState();
}
