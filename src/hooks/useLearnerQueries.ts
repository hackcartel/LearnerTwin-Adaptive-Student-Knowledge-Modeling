import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createLearner,
  fetchLearnerHistory,
  fetchLearnerMisconceptions,
  fetchLearnerProfile,
  fetchLearnerRecommendation,
  fetchQuestions,
  submitAssessment,
} from '@/src/services/learnerTwinApi';
import { useActiveLearner } from '@/src/hooks/useActiveLearner';
import type {
  ConceptId,
  CreateLearnerRequest,
  SubmitAssessmentRequest,
} from '@/src/types/api';
import { toast } from 'sonner';

export function useLearnerProfile(learnerId: string) {
  const { connectionInfo } = useActiveLearner();
  return useQuery({
    queryKey: ['learner', learnerId, 'profile', connectionInfo.mode],
    queryFn: () => fetchLearnerProfile(learnerId),
    enabled: Boolean(learnerId),
  });
}

export function useLearnerRecommendation(learnerId: string) {
  const { connectionInfo } = useActiveLearner();
  return useQuery({
    queryKey: ['learner', learnerId, 'recommendation', connectionInfo.mode],
    queryFn: () => fetchLearnerRecommendation(learnerId),
    enabled: Boolean(learnerId),
  });
}

export function useLearnerMisconceptions(learnerId: string) {
  const { connectionInfo } = useActiveLearner();
  return useQuery({
    queryKey: ['learner', learnerId, 'misconceptions', connectionInfo.mode],
    queryFn: () => fetchLearnerMisconceptions(learnerId),
    enabled: Boolean(learnerId),
  });
}

export function useLearnerHistory(learnerId: string) {
  const { connectionInfo } = useActiveLearner();
  return useQuery({
    queryKey: ['learner', learnerId, 'history', connectionInfo.mode],
    queryFn: () => fetchLearnerHistory(learnerId),
    enabled: Boolean(learnerId),
  });
}

export function useQuestions(conceptFocus: ConceptId | 'all' = 'all') {
  const { connectionInfo } = useActiveLearner();
  return useQuery({
    queryKey: ['questions', conceptFocus, connectionInfo.mode],
    queryFn: () => fetchQuestions(conceptFocus),
  });
}

export function useCreateLearnerMutation() {
  const queryClient = useQueryClient();
  const { setActiveLearnerId, setCreateDialogOpen } = useActiveLearner();

  return useMutation({
    mutationFn: (payload: CreateLearnerRequest) => createLearner(payload),
    onSuccess: async (newLearner) => {
      await queryClient.invalidateQueries({ queryKey: ['learners'] });
      setActiveLearnerId(newLearner.id);
      setCreateDialogOpen(false);
      toast.success(`Created learner profile for ${newLearner.name}.`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Unable to create learner profile.');
    },
  });
}

export function useSubmitAssessmentMutation(learnerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitAssessmentRequest) =>
      submitAssessment(learnerId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['learner', learnerId, 'profile'] }),
        queryClient.invalidateQueries({
          queryKey: ['learner', learnerId, 'recommendation'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['learner', learnerId, 'misconceptions'],
        }),
        queryClient.invalidateQueries({ queryKey: ['learner', learnerId, 'history'] }),
      ]);
      toast.success('Assessment submitted and Knowledge Twin updated.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit assessment.');
    },
  });
}
