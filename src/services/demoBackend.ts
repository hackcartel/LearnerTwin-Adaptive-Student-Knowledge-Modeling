import { CONCEPTS, CONCEPT_MAP } from '@/src/lib/constants';
import type {
  AssessmentEvidenceItem,
  AssessmentHistoryAttempt,
  AssessmentQuestionFeedback,
  ConceptId,
  ConceptMasterySnapshot,
  CreateLearnerRequest,
  HistoryResponse,
  Learner,
  LearnerProfileResponse,
  MisconceptionPattern,
  MisconceptionsResponse,
  Question,
  RecommendationResponse,
  SubmitAssessmentRequest,
  AssessmentSubmissionResponse,
} from '@/src/types/api';

interface InternalQuestion extends Question {
  correct_option_id: string;
  explanation: string;
  option_misconceptions: Record<string, { tag: string; description: string }>;
}

const QUESTION_BANK: InternalQuestion[] = [
  // Variables & Data Types (5 questions)
  {
    id: 'var-1',
    concept_id: 'variables_and_data_types',
    concept_title: 'Variables & Data Types',
    difficulty: 'foundational',
    prompt: 'What is printed when the following Python statements execute?',
    code_snippet: 'x = 4\ny = x + 3\nx = 10\nprint(y)',
    options: [
      { id: 'a', label: 'A', text: '7' },
      { id: 'b', label: 'B', text: '13' },
      { id: 'c', label: 'C', text: '10' },
      { id: 'd', label: 'D', text: '4' },
    ],
    correct_option_id: 'a',
    explanation:
      'In Python, assignment copies the value reference at the moment of execution. y is bound to 7 before x is reassigned to 10.',
    option_misconceptions: {
      b: {
        tag: 'Reactive Formula Binding',
        description:
          'Assuming variables store live algebraic formulas (y = x + 3) rather than evaluated values at assignment time.',
      },
      c: {
        tag: 'Latest Assignment Overwrite',
        description: 'Confusing the final value of x with the value stored in y.',
      },
    },
  },
  {
    id: 'var-2',
    concept_id: 'variables_and_data_types',
    concept_title: 'Variables & Data Types',
    difficulty: 'foundational',
    prompt: 'What is the output of this string and integer expression?',
    code_snippet: 'score = "15"\nbonus = "5"\nprint(score + bonus)',
    options: [
      { id: 'a', label: 'A', text: '20' },
      { id: 'b', label: 'B', text: '155' },
      { id: 'c', label: 'C', text: 'TypeError' },
      { id: 'd', label: 'D', text: '"15" + "5"' },
    ],
    correct_option_id: 'b',
    explanation:
      'Both score and bonus are strings (str). Applying + to two strings concatenates them into "155" rather than performing arithmetic addition.',
    option_misconceptions: {
      a: {
        tag: 'Implicit String-to-Int Coercion',
        description:
          'Assuming numeric characters inside quotes are automatically added numerically with +.',
      },
      c: {
        tag: 'TypeError Overgeneralization',
        description: 'Confusing str + str concatenation (valid) with str + int (TypeError).',
      },
    },
  },
  {
    id: 'var-3',
    concept_id: 'variables_and_data_types',
    concept_title: 'Variables & Data Types',
    difficulty: 'intermediate',
    prompt: 'Which data type does result hold after executing these lines?',
    code_snippet: 'total = 8\ncount = 2\nresult = total / count\nprint(type(result).__name__)',
    options: [
      { id: 'a', label: 'A', text: 'int' },
      { id: 'b', label: 'B', text: 'float' },
      { id: 'c', label: 'C', text: 'str' },
      { id: 'd', label: 'D', text: 'bool' },
    ],
    correct_option_id: 'b',
    explanation:
      'In Python 3, the single-slash division operator (/) always returns a float (4.0), even when the operands divide evenly.',
    option_misconceptions: {
      a: {
        tag: 'Integer Division Assumption',
        description:
          'Expecting / to return an int when operands divide evenly, instead of distinguishing / from //.',
      },
    },
  },
  {
    id: 'var-4',
    concept_id: 'variables_and_data_types',
    concept_title: 'Variables & Data Types',
    difficulty: 'intermediate',
    prompt: 'What value is stored in flag after the second line runs?',
    code_snippet: 'flag = False\nflag = (5 > 3) and (2 == 2)',
    options: [
      { id: 'a', label: 'A', text: 'False' },
      { id: 'b', label: 'B', text: 'True' },
      { id: 'c', label: 'C', text: '2' },
      { id: 'd', label: 'D', text: 'SyntaxError' },
    ],
    correct_option_id: 'b',
    explanation:
      'Both comparisons (5 > 3 and 2 == 2) evaluate to True, so the boolean and expression evaluates to True and rebinds flag.',
    option_misconceptions: {
      a: {
        tag: 'Sticky Initial Value',
        description: 'Ignoring variable reassignment when the initial value is explicitly defined.',
      },
    },
  },
  {
    id: 'var-5',
    concept_id: 'variables_and_data_types',
    concept_title: 'Variables & Data Types',
    difficulty: 'applied',
    prompt: 'What happens when the following code runs?',
    code_snippet: 'a = "7"\nb = int(a) * 2\nprint(b)',
    options: [
      { id: 'a', label: 'A', text: '77' },
      { id: 'b', label: 'B', text: '14' },
      { id: 'c', label: 'C', text: 'TypeError' },
      { id: 'd', label: 'D', text: '7 * 2' },
    ],
    correct_option_id: 'b',
    explanation:
      'int("7") converts the string "7" into the integer 7. Multiplying 7 by 2 evaluates to 14.',
    option_misconceptions: {
      a: {
        tag: 'Ignored Explicit Cast',
        description:
          'Applying string repetition ("7" * 2 -> "77") without noticing the int(a) type conversion.',
      },
    },
  },

  // Conditionals (5 questions)
  {
    id: 'cond-1',
    concept_id: 'conditionals',
    concept_title: 'Conditionals',
    difficulty: 'foundational',
    prompt: 'What will be printed when temp is 25?',
    code_snippet:
      'temp = 25\nif temp > 30:\n    print("Hot")\nelif temp > 20:\n    print("Warm")\nelse:\n    print("Cool")',
    options: [
      { id: 'a', label: 'A', text: 'Hot' },
      { id: 'b', label: 'B', text: 'Warm' },
      { id: 'c', label: 'C', text: 'Cool' },
      { id: 'd', label: 'D', text: 'Warm and Cool' },
    ],
    correct_option_id: 'b',
    explanation:
      'temp > 30 is False (25 is not > 30), so Python checks elif temp > 20, which is True and prints "Warm", skipping the else branch.',
    option_misconceptions: {
      d: {
        tag: 'Sequential if vs. Mutually Exclusive elif',
        description:
          'Treating elif/else branches as independent checks that can all execute rather than mutually exclusive branches.',
      },
    },
  },
  {
    id: 'cond-2',
    concept_id: 'conditionals',
    concept_title: 'Conditionals',
    difficulty: 'intermediate',
    prompt: 'How many lines are printed by this block when score is 92?',
    code_snippet:
      'score = 92\nif score >= 90:\n    print("A")\nif score >= 80:\n    print("B")\nelse:\n    print("C")',
    options: [
      { id: 'a', label: 'A', text: '1 line ("A")' },
      { id: 'b', label: 'B', text: '2 lines ("A" and "B")' },
      { id: 'c', label: 'C', text: '2 lines ("A" and "C")' },
      { id: 'd', label: 'D', text: '3 lines ("A", "B", and "C")' },
    ],
    correct_option_id: 'b',
    explanation:
      'The second statement uses if (not elif), so it is evaluated independently of the first if. Both score >= 90 and score >= 80 are True, printing "A" and "B".',
    option_misconceptions: {
      a: {
        tag: 'Sequential if vs. Mutually Exclusive elif',
        description:
          'Assuming a sequence of separate if statements stops after the first matching branch like an if-elif chain.',
      },
    },
  },
  {
    id: 'cond-3',
    concept_id: 'conditionals',
    concept_title: 'Conditionals',
    difficulty: 'intermediate',
    prompt: 'What is printed when age = 19 and has_id = False?',
    code_snippet:
      'age = 19\nhas_id = False\nif age >= 18 and has_id:\n    print("Admitted")\nelif age >= 18 or has_id:\n    print("Verify ID")\nelse:\n    print("Denied")',
    options: [
      { id: 'a', label: 'A', text: 'Admitted' },
      { id: 'b', label: 'B', text: 'Verify ID' },
      { id: 'c', label: 'C', text: 'Denied' },
      { id: 'd', label: 'D', text: 'Nothing is printed' },
    ],
    correct_option_id: 'b',
    explanation:
      'age >= 18 and has_id evaluates to False because has_id is False. However, age >= 18 or has_id is True because age >= 18 is True.',
    option_misconceptions: {
      a: {
        tag: 'Boolean AND/OR Confusion',
        description: 'Treating logical and as satisfied when only the left operand is True.',
      },
      c: {
        tag: 'Boolean AND/OR Confusion',
        description: 'Requiring both operands to be True for an or condition.',
      },
    },
  },
  {
    id: 'cond-4',
    concept_id: 'conditionals',
    concept_title: 'Conditionals',
    difficulty: 'applied',
    prompt: 'What does this code print?',
    code_snippet:
      'n = 10\nif not (n < 5 or n > 20):\n    print("In range")\nelse:\n    print("Out of range")',
    options: [
      { id: 'a', label: 'A', text: 'In range' },
      { id: 'b', label: 'B', text: 'Out of range' },
      { id: 'c', label: 'C', text: 'True' },
      { id: 'd', label: 'D', text: 'TypeError' },
    ],
    correct_option_id: 'a',
    explanation:
      'Inside parentheses, 10 < 5 is False and 10 > 20 is False, so (False or False) is False. Applying not gives True, printing "In range".',
    option_misconceptions: {
      b: {
        tag: 'Negation Distribution Error',
        description:
          'Misapplying not across a compound or expression (failing to flip or to and per De Morgan’s law).',
      },
    },
  },
  {
    id: 'cond-5',
    concept_id: 'conditionals',
    concept_title: 'Conditionals',
    difficulty: 'applied',
    prompt: 'Which output is produced by this nested conditional?',
    code_snippet:
      'x = 4\ny = 9\nif x > 5:\n    if y > 5:\n        print("Both")\nelse:\n    print("Low x")',
    options: [
      { id: 'a', label: 'A', text: 'Both' },
      { id: 'b', label: 'B', text: 'Low x' },
      { id: 'c', label: 'C', text: 'Nothing is printed' },
      { id: 'd', label: 'D', text: 'Both then Low x' },
    ],
    correct_option_id: 'b',
    explanation:
      'Indentation determines scope in Python: else is aligned with the outer if x > 5. Since 4 > 5 is False, the outer else executes and prints "Low x".',
    option_misconceptions: {
      c: {
        tag: 'Dangling Else Scope Misread',
        description:
          'Associating an outer-indented else clause with the inner if statement instead of the matching indentation level.',
      },
    },
  },

  // Loops (5 questions)
  {
    id: 'loop-1',
    concept_id: 'loops',
    concept_title: 'Loops',
    difficulty: 'foundational',
    prompt: 'How many numbers are printed by this for loop?',
    code_snippet: 'for i in range(1, 5):\n    print(i)',
    options: [
      { id: 'a', label: 'A', text: '3 numbers (1, 2, 3)' },
      { id: 'b', label: 'B', text: '4 numbers (1, 2, 3, 4)' },
      { id: 'c', label: 'C', text: '5 numbers (1, 2, 3, 4, 5)' },
      { id: 'd', label: 'D', text: '5 numbers (0, 1, 2, 3, 4)' },
    ],
    correct_option_id: 'b',
    explanation:
      'range(start, stop) includes start (1) and excludes stop (5), generating 1, 2, 3, 4 (4 iterations).',
    option_misconceptions: {
      c: {
        tag: 'Exclusive range() Upper Bound',
        description:
          'Treating the second argument of range(start, stop) as inclusive rather than stopping before stop.',
      },
      d: {
        tag: 'Zero-Index Start Override',
        description: 'Assuming range(1, 5) still begins at 0.',
      },
    },
  },
  {
    id: 'loop-2',
    concept_id: 'loops',
    concept_title: 'Loops',
    difficulty: 'intermediate',
    prompt: 'What is the final value of total printed at the end?',
    code_snippet:
      'total = 0\nfor n in [2, 4, 6]:\n    total = total + n\nprint(total)',
    options: [
      { id: 'a', label: 'A', text: '6' },
      { id: 'b', label: 'B', text: '12' },
      { id: 'c', label: 'C', text: '0' },
      { id: 'd', label: 'D', text: '3' },
    ],
    correct_option_id: 'b',
    explanation:
      'total accumulates each element: 0 + 2 = 2, 2 + 4 = 6, 6 + 6 = 12. The print statement runs once after the loop finishes.',
    option_misconceptions: {
      a: {
        tag: 'Accumulator Overwrite Misconception',
        description:
          'Assuming total is overwritten with the last item n (6) instead of accumulating total + n across iterations.',
      },
    },
  },
  {
    id: 'loop-3',
    concept_id: 'loops',
    concept_title: 'Loops',
    difficulty: 'intermediate',
    prompt: 'What is printed when this while loop completes?',
    code_snippet: 'count = 3\nwhile count > 0:\n    count -= 1\nprint(count)',
    options: [
      { id: 'a', label: 'A', text: '1' },
      { id: 'b', label: 'B', text: '0' },
      { id: 'c', label: 'C', text: '-1' },
      { id: 'd', label: 'D', text: '3' },
    ],
    correct_option_id: 'b',
    explanation:
      'When count is 1, count > 0 is True, so count decrements to 0. On the next check, 0 > 0 is False, exiting the loop with count equal to 0.',
    option_misconceptions: {
      a: {
        tag: 'Off-by-One Loop Termination',
        description:
          'Stopping the trace when count reaches 1 instead of executing the final valid iteration where count becomes 0.',
      },
      c: {
        tag: 'Post-Exit Decrement Error',
        description: 'Applying one extra decrement after the while condition becomes False.',
      },
    },
  },
  {
    id: 'loop-4',
    concept_id: 'loops',
    concept_title: 'Loops',
    difficulty: 'applied',
    prompt: 'What value does hits have after the loop finishes?',
    code_snippet:
      'hits = 0\nfor i in range(6):\n    if i % 2 == 0:\n        hits += 1\nprint(hits)',
    options: [
      { id: 'a', label: 'A', text: '2' },
      { id: 'b', label: 'B', text: '3' },
      { id: 'c', label: 'C', text: '4' },
      { id: 'd', label: 'D', text: '6' },
    ],
    correct_option_id: 'b',
    explanation:
      'range(6) yields 0, 1, 2, 3, 4, 5. The even values (i % 2 == 0) are 0, 2, and 4 — giving hits = 3.',
    option_misconceptions: {
      a: {
        tag: 'Zero Parity Oversight',
        description:
          'Forgetting that range(6) starts at 0 and that 0 % 2 == 0 counts as an even value.',
      },
    },
  },
  {
    id: 'loop-5',
    concept_id: 'loops',
    concept_title: 'Loops',
    difficulty: 'applied',
    prompt: 'What is printed by this loop with a break statement?',
    code_snippet:
      'for k in range(1, 6):\n    if k == 3:\n        break\nprint(k)',
    options: [
      { id: 'a', label: 'A', text: '2' },
      { id: 'b', label: 'B', text: '3' },
      { id: 'c', label: 'C', text: '5' },
      { id: 'd', label: 'D', text: '6' },
    ],
    correct_option_id: 'b',
    explanation:
      'When k reaches 3, if k == 3 is True and break immediately exits the loop, leaving k bound to 3 when print(k) runs.',
    option_misconceptions: {
      c: {
        tag: 'Ignored Loop Break Control Flow',
        description: 'Assuming the for loop still advances k to the end of range(1, 6) despite break.',
      },
    },
  },
];

interface DemoLearnerStore {
  learner: Learner;
  attempts: AssessmentHistoryAttempt[];
  mastery: Record<ConceptId, number | null>;
  misconceptions: MisconceptionPattern[];
}

interface DemoStorageState {
  learners: Record<string, DemoLearnerStore>;
}

const STORAGE_KEY = 'learnertwin_demo_state_v1';

function buildSeedState(): DemoStorageState {
  const mayaId = 'demo-maya-lin';
  const jordanId = 'demo-jordan-patel';

  const mayaAttempts: AssessmentHistoryAttempt[] = [
    {
      assessment_id: 'demo-att-1',
      attempt_number: 1,
      submitted_at: '2026-11-04T10:15:00Z',
      concept_focus: 'all',
      score: 0.5,
      correct_count: 3,
      total_questions: 6,
      mastery_by_concept: {
        variables_and_data_types: 0.62,
        conditionals: 0.45,
        loops: 0.34,
      },
      evidence_items: [
        {
          question_id: 'var-1',
          concept_id: 'variables_and_data_types',
          concept_title: 'Variables & Data Types',
          question_prompt: QUESTION_BANK[0].prompt,
          selected_answer_text: '7',
          is_correct: true,
          submitted_at: '2026-11-04T10:15:00Z',
          attempt_number: 1,
        },
        {
          question_id: 'var-2',
          concept_id: 'variables_and_data_types',
          concept_title: 'Variables & Data Types',
          question_prompt: QUESTION_BANK[1].prompt,
          selected_answer_text: '20',
          is_correct: false,
          misconception_tag: 'Implicit String-to-Int Coercion',
          submitted_at: '2026-11-04T10:15:00Z',
          attempt_number: 1,
        },
        {
          question_id: 'cond-1',
          concept_id: 'conditionals',
          concept_title: 'Conditionals',
          question_prompt: QUESTION_BANK[5].prompt,
          selected_answer_text: 'Warm',
          is_correct: true,
          submitted_at: '2026-11-04T10:15:00Z',
          attempt_number: 1,
        },
        {
          question_id: 'cond-2',
          concept_id: 'conditionals',
          concept_title: 'Conditionals',
          question_prompt: QUESTION_BANK[6].prompt,
          selected_answer_text: '1 line ("A")',
          is_correct: false,
          misconception_tag: 'Sequential if vs. Mutually Exclusive elif',
          submitted_at: '2026-11-04T10:15:00Z',
          attempt_number: 1,
        },
        {
          question_id: 'loop-1',
          concept_id: 'loops',
          concept_title: 'Loops',
          question_prompt: QUESTION_BANK[10].prompt,
          selected_answer_text: '5 numbers (1, 2, 3, 4, 5)',
          is_correct: false,
          misconception_tag: 'Exclusive range() Upper Bound',
          submitted_at: '2026-11-04T10:15:00Z',
          attempt_number: 1,
        },
        {
          question_id: 'loop-2',
          concept_id: 'loops',
          concept_title: 'Loops',
          question_prompt: QUESTION_BANK[11].prompt,
          selected_answer_text: '12',
          is_correct: true,
          submitted_at: '2026-11-04T10:15:00Z',
          attempt_number: 1,
        },
      ],
    },
    {
      assessment_id: 'demo-att-2',
      attempt_number: 2,
      submitted_at: '2026-11-07T14:40:00Z',
      concept_focus: 'variables_and_data_types',
      score: 0.75,
      correct_count: 3,
      total_questions: 4,
      mastery_by_concept: {
        variables_and_data_types: 0.78,
        conditionals: 0.45,
        loops: 0.34,
      },
      evidence_items: [
        {
          question_id: 'var-2',
          concept_id: 'variables_and_data_types',
          concept_title: 'Variables & Data Types',
          question_prompt: QUESTION_BANK[1].prompt,
          selected_answer_text: '155',
          is_correct: true,
          submitted_at: '2026-11-07T14:40:00Z',
          attempt_number: 2,
        },
        {
          question_id: 'var-3',
          concept_id: 'variables_and_data_types',
          concept_title: 'Variables & Data Types',
          question_prompt: QUESTION_BANK[2].prompt,
          selected_answer_text: 'int',
          is_correct: false,
          misconception_tag: 'Integer Division Assumption',
          submitted_at: '2026-11-07T14:40:00Z',
          attempt_number: 2,
        },
        {
          question_id: 'var-4',
          concept_id: 'variables_and_data_types',
          concept_title: 'Variables & Data Types',
          question_prompt: QUESTION_BANK[3].prompt,
          selected_answer_text: 'True',
          is_correct: true,
          submitted_at: '2026-11-07T14:40:00Z',
          attempt_number: 2,
        },
        {
          question_id: 'var-5',
          concept_id: 'variables_and_data_types',
          concept_title: 'Variables & Data Types',
          question_prompt: QUESTION_BANK[4].prompt,
          selected_answer_text: '14',
          is_correct: true,
          submitted_at: '2026-11-07T14:40:00Z',
          attempt_number: 2,
        },
      ],
    },
    {
      assessment_id: 'demo-att-3',
      attempt_number: 3,
      submitted_at: '2026-11-10T09:20:00Z',
      concept_focus: 'conditionals',
      score: 0.75,
      correct_count: 3,
      total_questions: 4,
      mastery_by_concept: {
        variables_and_data_types: 0.78,
        conditionals: 0.66,
        loops: 0.34,
      },
      evidence_items: [
        {
          question_id: 'cond-2',
          concept_id: 'conditionals',
          concept_title: 'Conditionals',
          question_prompt: QUESTION_BANK[6].prompt,
          selected_answer_text: '1 line ("A")',
          is_correct: false,
          misconception_tag: 'Sequential if vs. Mutually Exclusive elif',
          submitted_at: '2026-11-10T09:20:00Z',
          attempt_number: 3,
        },
        {
          question_id: 'cond-3',
          concept_id: 'conditionals',
          concept_title: 'Conditionals',
          question_prompt: QUESTION_BANK[7].prompt,
          selected_answer_text: 'Verify ID',
          is_correct: true,
          submitted_at: '2026-11-10T09:20:00Z',
          attempt_number: 3,
        },
        {
          question_id: 'cond-4',
          concept_id: 'conditionals',
          concept_title: 'Conditionals',
          question_prompt: QUESTION_BANK[8].prompt,
          selected_answer_text: 'In range',
          is_correct: true,
          submitted_at: '2026-11-10T09:20:00Z',
          attempt_number: 3,
        },
        {
          question_id: 'cond-5',
          concept_id: 'conditionals',
          concept_title: 'Conditionals',
          question_prompt: QUESTION_BANK[9].prompt,
          selected_answer_text: 'Low x',
          is_correct: true,
          submitted_at: '2026-11-10T09:20:00Z',
          attempt_number: 3,
        },
      ],
    },
    {
      assessment_id: 'demo-att-4',
      attempt_number: 4,
      submitted_at: '2026-11-13T16:05:00Z',
      concept_focus: 'loops',
      score: 0.5,
      correct_count: 2,
      total_questions: 4,
      mastery_by_concept: {
        variables_and_data_types: 0.82,
        conditionals: 0.66,
        loops: 0.44,
      },
      evidence_items: [
        {
          question_id: 'loop-1',
          concept_id: 'loops',
          concept_title: 'Loops',
          question_prompt: QUESTION_BANK[10].prompt,
          selected_answer_text: '5 numbers (1, 2, 3, 4, 5)',
          is_correct: false,
          misconception_tag: 'Exclusive range() Upper Bound',
          submitted_at: '2026-11-13T16:05:00Z',
          attempt_number: 4,
        },
        {
          question_id: 'loop-3',
          concept_id: 'loops',
          concept_title: 'Loops',
          question_prompt: QUESTION_BANK[12].prompt,
          selected_answer_text: '1',
          is_correct: false,
          misconception_tag: 'Off-by-One Loop Termination',
          submitted_at: '2026-11-13T16:05:00Z',
          attempt_number: 4,
        },
        {
          question_id: 'loop-4',
          concept_id: 'loops',
          concept_title: 'Loops',
          question_prompt: QUESTION_BANK[13].prompt,
          selected_answer_text: '3',
          is_correct: true,
          submitted_at: '2026-11-13T16:05:00Z',
          attempt_number: 4,
        },
        {
          question_id: 'loop-5',
          concept_id: 'loops',
          concept_title: 'Loops',
          question_prompt: QUESTION_BANK[14].prompt,
          selected_answer_text: '3',
          is_correct: true,
          submitted_at: '2026-11-13T16:05:00Z',
          attempt_number: 4,
        },
      ],
    },
  ];

  const jordanAttempts: AssessmentHistoryAttempt[] = [
    {
      assessment_id: 'demo-att-j1',
      attempt_number: 1,
      submitted_at: '2026-11-14T11:30:00Z',
      concept_focus: 'variables_and_data_types',
      score: 0.67,
      correct_count: 2,
      total_questions: 3,
      mastery_by_concept: {
        variables_and_data_types: 0.64,
      },
      evidence_items: [
        {
          question_id: 'var-1',
          concept_id: 'variables_and_data_types',
          concept_title: 'Variables & Data Types',
          question_prompt: QUESTION_BANK[0].prompt,
          selected_answer_text: '7',
          is_correct: true,
          submitted_at: '2026-11-14T11:30:00Z',
          attempt_number: 1,
        },
        {
          question_id: 'var-2',
          concept_id: 'variables_and_data_types',
          concept_title: 'Variables & Data Types',
          question_prompt: QUESTION_BANK[1].prompt,
          selected_answer_text: '155',
          is_correct: true,
          submitted_at: '2026-11-14T11:30:00Z',
          attempt_number: 1,
        },
        {
          question_id: 'var-3',
          concept_id: 'variables_and_data_types',
          concept_title: 'Variables & Data Types',
          question_prompt: QUESTION_BANK[2].prompt,
          selected_answer_text: 'int',
          is_correct: false,
          misconception_tag: 'Integer Division Assumption',
          submitted_at: '2026-11-14T11:30:00Z',
          attempt_number: 1,
        },
      ],
    },
  ];

  return {
    learners: {
      [mayaId]: {
        learner: {
          id: mayaId,
          name: 'Maya Lin (Sample)',
          learning_track: 'CS1 Python Foundations',
          goal: 'Reach 75%+ mastery across all core control flow concepts',
          created_at: '2026-11-04T10:00:00Z',
          is_sample: true,
        },
        attempts: mayaAttempts,
        mastery: {
          variables_and_data_types: 0.82,
          conditionals: 0.66,
          loops: 0.44,
        },
        misconceptions: deriveMisconceptionsFromAttempts(mayaAttempts),
      },
      [jordanId]: {
        learner: {
          id: jordanId,
          name: 'Jordan Patel (Sample)',
          learning_track: 'Introductory Programming',
          goal: 'Complete initial diagnostic across all three core concepts',
          created_at: '2026-11-14T11:15:00Z',
          is_sample: true,
        },
        attempts: jordanAttempts,
        mastery: {
          variables_and_data_types: 0.64,
          conditionals: null,
          loops: null,
        },
        misconceptions: deriveMisconceptionsFromAttempts(jordanAttempts),
      },
    },
  };
}

function deriveMisconceptionsFromAttempts(
  attempts: AssessmentHistoryAttempt[]
): MisconceptionPattern[] {
  const byTag = new Map<string, MisconceptionPattern>();
  for (const attempt of attempts) {
    for (const item of attempt.evidence_items) {
      if (!item.is_correct && item.misconception_tag) {
        const q = QUESTION_BANK.find((qb) => qb.id === item.question_id);
        const desc =
          Object.values(q?.option_misconceptions || {}).find(
            (m) => m.tag === item.misconception_tag
          )?.description || 'Recurring error pattern observed in submitted answers.';

        const existing = byTag.get(item.misconception_tag);
        if (existing) {
          existing.occurrences += 1;
          existing.last_observed_at = item.submitted_at;
        } else {
          byTag.set(item.misconception_tag, {
            id: `misc-${item.concept_id}-${item.misconception_tag.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
            concept_id: item.concept_id,
            concept_title: item.concept_title,
            tag: item.misconception_tag,
            description: desc,
            occurrences: 1,
            last_observed_at: item.submitted_at,
            example_question_prompt: item.question_prompt,
          });
        }
      }
    }
  }
  return Array.from(byTag.values()).sort((a, b) => b.occurrences - a.occurrences);
}

function loadDemoState(): DemoStorageState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DemoStorageState;
      if (parsed && parsed.learners && Object.keys(parsed.learners).length > 0) {
        return parsed;
      }
    }
  } catch {
    // Fallback to seed state if storage is unavailable
  }
  const seed = buildSeedState();
  saveDemoState(seed);
  return seed;
}

function saveDemoState(state: DemoStorageState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors
  }
}

export function resetDemoState(): DemoStorageState {
  const seed = buildSeedState();
  saveDemoState(seed);
  return seed;
}

export function demoListLearners(): Learner[] {
  const state = loadDemoState();
  return Object.values(state.learners).map((entry) => entry.learner);
}

export function demoCreateLearner(payload: CreateLearnerRequest): Learner {
  const state = loadDemoState();
  const slug = payload.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 24);
  const id = `demo-${slug || 'learner'}-${Date.now().toString(36).slice(-4)}`;
  const newLearner: Learner = {
    id,
    name: payload.name.trim(),
    learning_track: payload.learning_track.trim(),
    goal: payload.goal?.trim() || undefined,
    created_at: new Date().toISOString(),
    is_sample: true,
  };
  state.learners[id] = {
    learner: newLearner,
    attempts: [],
    mastery: {
      variables_and_data_types: null,
      conditionals: null,
      loops: null,
    },
    misconceptions: [],
  };
  saveDemoState(state);
  return newLearner;
}

export function demoGetQuestions(conceptFilter?: ConceptId | 'all'): Question[] {
  const filtered =
    conceptFilter && conceptFilter !== 'all'
      ? QUESTION_BANK.filter((q) => q.concept_id === conceptFilter)
      : [
          ...QUESTION_BANK.filter((q) => q.concept_id === 'variables_and_data_types').slice(0, 2),
          ...QUESTION_BANK.filter((q) => q.concept_id === 'conditionals').slice(0, 2),
          ...QUESTION_BANK.filter((q) => q.concept_id === 'loops').slice(0, 2),
        ];

  return filtered.map(({ correct_option_id: _c, explanation: _e, option_misconceptions: _m, ...pub }) => pub);
}

function computeConceptSnapshots(
  store: DemoLearnerStore,
  previousMasteryMap?: Record<ConceptId, number | null>
): ConceptMasterySnapshot[] {
  return CONCEPTS.map((concept) => {
    const items = store.attempts.flatMap((a) =>
      a.evidence_items.filter((item) => item.concept_id === concept.id)
    );
    const correctCount = items.filter((item) => item.is_correct).length;
    const attemptsWithConcept = store.attempts.filter((a) =>
      a.evidence_items.some((item) => item.concept_id === concept.id)
    );
    const lastItem = items[items.length - 1];

    return {
      concept_id: concept.id,
      concept_title: concept.title,
      estimated_mastery: store.mastery[concept.id],
      previous_mastery: previousMasteryMap ? previousMasteryMap[concept.id] : undefined,
      attempts_count: attemptsWithConcept.length,
      correct_count: correctCount,
      total_questions: items.length,
      last_assessed_at: lastItem?.submitted_at,
    };
  });
}

function computeDemoRecommendation(store: DemoLearnerStore): RecommendationResponse {
  const now = new Date().toISOString();
  const unassessed = CONCEPTS.find((c) => store.mastery[c.id] === null);

  if (store.attempts.length === 0) {
    return {
      learner_id: store.learner.id,
      recommended_concept_id: 'variables_and_data_types',
      recommended_concept_title: 'Variables & Data Types',
      activity_title: 'Complete Foundational Diagnostic Assessment',
      activity_type: 'diagnostic',
      reason:
        'No assessment evidence has been recorded yet. Start with the foundational diagnostic or Variables & Data Types to calibrate your initial Knowledge Twin profile.',
      generated_at: now,
    };
  }

  if (unassessed) {
    return {
      learner_id: store.learner.id,
      recommended_concept_id: unassessed.id,
      recommended_concept_title: unassessed.title,
      activity_title: `Assess ${unassessed.title} Baseline`,
      activity_type: 'diagnostic',
      reason: `${unassessed.title} has not been assessed yet. Completing a baseline check will populate all three concept nodes in your Knowledge Twin.`,
      generated_at: now,
    };
  }

  // Pick lowest mastery concept among assessed concepts
  const sorted = [...CONCEPTS].sort(
    (a, b) => (store.mastery[a.id] ?? 0) - (store.mastery[b.id] ?? 0)
  );
  const target = sorted[0];
  const targetMastery = store.mastery[target.id] ?? 0;
  const conceptMisconceptions = store.misconceptions.filter(
    (m) => m.concept_id === target.id
  );

  if (targetMastery < 0.75) {
    const miscSuffix =
      conceptMisconceptions.length > 0
        ? ` Recent responses also showed "${conceptMisconceptions[0].tag}".`
        : '';
    return {
      learner_id: store.learner.id,
      recommended_concept_id: target.id,
      recommended_concept_title: target.title,
      activity_title: `Targeted Practice: ${target.title}`,
      activity_type: 'targeted_practice',
      reason: `${target.title} currently has the lowest estimated mastery (${Math.round(
        targetMastery * 100
      )}%).${miscSuffix} Focused practice on ${target.practiceFocus.toLowerCase()}`,
      generated_at: now,
    };
  }

  return {
    learner_id: store.learner.id,
    recommended_concept_id: target.id,
    recommended_concept_title: target.title,
    activity_title: `Reinforcement Check: ${target.title}`,
    activity_type: 'mastery_reinforcement',
    reason: `All three concepts are currently estimated at 75% or higher. ${target.title} (${Math.round(
      targetMastery * 100
    )}%) has the most room for reinforcement via applied edge-case tracing.`,
    generated_at: now,
  };
}

export function demoGetProfile(learnerId: string): LearnerProfileResponse {
  const state = loadDemoState();
  const store = state.learners[learnerId] || Object.values(state.learners)[0];
  const snapshots = computeConceptSnapshots(store);
  const assessedSnapshots = snapshots.filter((s) => s.estimated_mastery !== null);
  const overallMastery =
    assessedSnapshots.length > 0
      ? assessedSnapshots.reduce((acc, s) => acc + (s.estimated_mastery ?? 0), 0) /
        assessedSnapshots.length
      : null;

  return {
    learner: store.learner,
    concepts_assessed: assessedSnapshots.length,
    total_concepts: CONCEPTS.length,
    assessments_completed: store.attempts.length,
    overall_mastery: overallMastery,
    concept_mastery: snapshots,
  };
}

export function demoGetRecommendation(learnerId: string): RecommendationResponse {
  const state = loadDemoState();
  const store = state.learners[learnerId] || Object.values(state.learners)[0];
  return computeDemoRecommendation(store);
}

export function demoGetMisconceptions(learnerId: string): MisconceptionsResponse {
  const state = loadDemoState();
  const store = state.learners[learnerId] || Object.values(state.learners)[0];
  return {
    learner_id: store.learner.id,
    misconceptions: store.misconceptions,
  };
}

export function demoGetHistory(learnerId: string): HistoryResponse {
  const state = loadDemoState();
  const store = state.learners[learnerId] || Object.values(state.learners)[0];
  return {
    learner_id: store.learner.id,
    attempts: store.attempts,
  };
}

export function demoSubmitAssessment(
  learnerId: string,
  payload: SubmitAssessmentRequest
): AssessmentSubmissionResponse {
  const state = loadDemoState();
  const store = state.learners[learnerId];
  if (!store) {
    throw new Error(`Learner "${learnerId}" not found in demo store.`);
  }

  const submittedAt = new Date().toISOString();
  const attemptNumber = store.attempts.length + 1;
  const previousMastery: Record<ConceptId, number | null> = { ...store.mastery };

  const questionResults: AssessmentQuestionFeedback[] = [];
  const evidenceItems: AssessmentEvidenceItem[] = [];
  const conceptStats: Record<ConceptId, { correct: number; total: number }> = {
    variables_and_data_types: { correct: 0, total: 0 },
    conditionals: { correct: 0, total: 0 },
    loops: { correct: 0, total: 0 },
  };

  for (const answer of payload.answers) {
    const q = QUESTION_BANK.find((item) => item.id === answer.question_id);
    if (!q) continue;

    const selectedOpt = q.options.find((o) => o.id === answer.selected_option_id);
    const correctOpt = q.options.find((o) => o.id === q.correct_option_id);
    const isCorrect = answer.selected_option_id === q.correct_option_id;
    const misconception = !isCorrect
      ? q.option_misconceptions[answer.selected_option_id]
      : undefined;

    conceptStats[q.concept_id].total += 1;
    if (isCorrect) {
      conceptStats[q.concept_id].correct += 1;
    }

    questionResults.push({
      question_id: q.id,
      concept_id: q.concept_id,
      concept_title: q.concept_title,
      prompt: q.prompt,
      selected_option_id: answer.selected_option_id,
      selected_option_text: selectedOpt ? `${selectedOpt.label}. ${selectedOpt.text}` : answer.selected_option_id,
      correct_option_id: q.correct_option_id,
      correct_option_text: correctOpt ? `${correctOpt.label}. ${correctOpt.text}` : q.correct_option_id,
      is_correct: isCorrect,
      explanation: q.explanation,
      detected_misconception: misconception?.tag,
    });

    evidenceItems.push({
      question_id: q.id,
      concept_id: q.concept_id,
      concept_title: q.concept_title,
      question_prompt: q.prompt,
      selected_answer_text: selectedOpt?.text ?? answer.selected_option_id,
      is_correct: isCorrect,
      misconception_tag: misconception?.tag,
      submitted_at: submittedAt,
      attempt_number: attemptNumber,
    });
  }

  // Update probabilistic mastery estimate using weighted evidence smoothing
  for (const concept of CONCEPTS) {
    const stats = conceptStats[concept.id];
    if (stats.total > 0) {
      const observedAccuracy = stats.correct / stats.total;
      const prior = store.mastery[concept.id];
      const updated =
        prior === null
          ? Number((0.35 + observedAccuracy * 0.5).toFixed(2))
          : Number(Math.min(0.98, Math.max(0.12, prior * 0.55 + observedAccuracy * 0.45)).toFixed(2));
      store.mastery[concept.id] = updated;
    }
  }

  const totalQuestions = questionResults.length;
  const correctCount = questionResults.filter((r) => r.is_correct).length;
  const score = totalQuestions > 0 ? correctCount / totalQuestions : 0;

  const masteryByConcept: Partial<Record<ConceptId, number>> = {};
  for (const concept of CONCEPTS) {
    const val = store.mastery[concept.id];
    if (val !== null) {
      masteryByConcept[concept.id] = val;
    }
  }

  const attemptRecord: AssessmentHistoryAttempt = {
    assessment_id: `demo-att-${Date.now().toString(36)}`,
    attempt_number: attemptNumber,
    submitted_at: submittedAt,
    concept_focus: payload.concept_focus ?? 'all',
    score,
    correct_count: correctCount,
    total_questions: totalQuestions,
    mastery_by_concept: masteryByConcept,
    evidence_items: evidenceItems,
  };

  store.attempts = [...store.attempts, attemptRecord];
  store.misconceptions = deriveMisconceptionsFromAttempts(store.attempts);
  saveDemoState(state);

  const updatedSnapshots = computeConceptSnapshots(store, previousMastery);
  const recommendation = computeDemoRecommendation(store);

  return {
    assessment_id: attemptRecord.assessment_id,
    learner_id: store.learner.id,
    submitted_at: submittedAt,
    concept_focus: attemptRecord.concept_focus,
    score,
    correct_count: correctCount,
    total_questions: totalQuestions,
    question_results: questionResults,
    updated_mastery: updatedSnapshots,
    recommendation,
  };
}
