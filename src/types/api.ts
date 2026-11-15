export type ConceptId = 'variables_and_data_types' | 'conditionals' | 'loops';

export type BackendMode = 'live' | 'demo';

export interface BackendConnectionInfo {
  mode: BackendMode;
  baseUrl: string;
  reachable: boolean;
  openApiVerified: boolean;
  openApiTitle?: string;
  openApiVersion?: string;
  lastCheckedAt: string;
  errorMessage?: string;
}

export interface Learner {
  id: string;
  name: string;
  learning_track: string;
  goal?: string;
  created_at: string;
  is_sample?: boolean;
}

export interface CreateLearnerRequest {
  name: string;
  learning_track: string;
  goal?: string;
}

export interface QuestionOption {
  id: string;
  label: string;
  text: string;
}

/**
 * Assessment question returned by GET /questions.
 * Deliberately excludes correct_option_id prior to submission.
 */
export interface Question {
  id: string;
  concept_id: ConceptId;
  concept_title: string;
  difficulty: 'foundational' | 'intermediate' | 'applied';
  prompt: string;
  code_snippet?: string;
  options: QuestionOption[];
}

export interface AssessmentAnswerInput {
  question_id: string;
  selected_option_id: string;
}

export interface SubmitAssessmentRequest {
  concept_focus?: ConceptId | 'all';
  answers: AssessmentAnswerInput[];
}

export interface AssessmentQuestionFeedback {
  question_id: string;
  concept_id: ConceptId;
  concept_title: string;
  prompt: string;
  selected_option_id: string;
  selected_option_text: string;
  correct_option_id: string;
  correct_option_text: string;
  is_correct: boolean;
  explanation: string;
  detected_misconception?: string;
}

export interface ConceptMasterySnapshot {
  concept_id: ConceptId;
  concept_title: string;
  /** Probabilistic mastery estimate in [0, 1], or null if not yet assessed. */
  estimated_mastery: number | null;
  previous_mastery?: number | null;
  attempts_count: number;
  correct_count: number;
  total_questions: number;
  last_assessed_at?: string;
}

export interface RecommendationResponse {
  learner_id: string;
  recommended_concept_id: ConceptId;
  recommended_concept_title: string;
  activity_title: string;
  activity_type: 'diagnostic' | 'targeted_practice' | 'mastery_reinforcement';
  reason: string;
  generated_at: string;
}

export interface AssessmentSubmissionResponse {
  assessment_id: string;
  learner_id: string;
  submitted_at: string;
  concept_focus: ConceptId | 'all';
  score: number;
  correct_count: number;
  total_questions: number;
  question_results: AssessmentQuestionFeedback[];
  updated_mastery: ConceptMasterySnapshot[];
  recommendation: RecommendationResponse;
}

export interface LearnerProfileResponse {
  learner: Learner;
  concepts_assessed: number;
  total_concepts: number;
  assessments_completed: number;
  overall_mastery: number | null;
  concept_mastery: ConceptMasterySnapshot[];
}

export interface MisconceptionPattern {
  id: string;
  concept_id: ConceptId;
  concept_title: string;
  tag: string;
  description: string;
  occurrences: number;
  last_observed_at: string;
  example_question_prompt?: string;
}

export interface MisconceptionsResponse {
  learner_id: string;
  misconceptions: MisconceptionPattern[];
}

export interface AssessmentEvidenceItem {
  question_id: string;
  concept_id: ConceptId;
  concept_title: string;
  question_prompt: string;
  selected_answer_text: string;
  is_correct: boolean;
  misconception_tag?: string;
  submitted_at: string;
  attempt_number: number;
}

export interface AssessmentHistoryAttempt {
  assessment_id: string;
  attempt_number: number;
  submitted_at: string;
  concept_focus: ConceptId | 'all';
  score: number;
  correct_count: number;
  total_questions: number;
  mastery_by_concept: Partial<Record<ConceptId, number>>;
  evidence_items: AssessmentEvidenceItem[];
}

export interface HistoryResponse {
  learner_id: string;
  attempts: AssessmentHistoryAttempt[];
}

export interface OpenApiSummary {
  reachable: boolean;
  verified: boolean;
  title?: string;
  version?: string;
  paths: string[];
  errorMessage?: string;
}
