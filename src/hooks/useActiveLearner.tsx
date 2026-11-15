import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  checkBackendConnection,
  listLearners,
  resetDemoWorkspace,
} from '@/src/services/learnerTwinApi';
import type { BackendConnectionInfo, Learner } from '@/src/types/api';
import { API_BASE_URL } from '@/src/services/apiClient';
import { toast } from 'sonner';

interface ActiveLearnerContextValue {
  activeLearnerId: string;
  setActiveLearnerId: (id: string) => void;
  learners: Learner[];
  isLoadingLearners: boolean;
  connectionInfo: BackendConnectionInfo;
  isCheckingConnection: boolean;
  recheckConnection: () => Promise<void>;
  resetDemo: () => void;
  isCreateDialogOpen: boolean;
  setCreateDialogOpen: (open: boolean) => void;
}

const ACTIVE_LEARNER_KEY = 'learnertwin_active_learner_id';

const ActiveLearnerContext = createContext<ActiveLearnerContextValue | null>(null);

export function ActiveLearnerProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);
  const [connectionInfo, setConnectionInfo] = useState<BackendConnectionInfo>({
    mode: 'demo',
    baseUrl: API_BASE_URL,
    reachable: false,
    openApiVerified: false,
    lastCheckedAt: new Date().toISOString(),
  });

  const [activeLearnerId, setActiveLearnerIdState] = useState<string>(() => {
    try {
      return localStorage.getItem(ACTIVE_LEARNER_KEY) || '';
    } catch {
      return '';
    }
  });

  const setActiveLearnerId = useCallback((id: string) => {
    setActiveLearnerIdState(id);
    try {
      localStorage.setItem(ACTIVE_LEARNER_KEY, id);
    } catch {
      // Ignore storage error
    }
  }, []);

  const performConnectionCheck = useCallback(
    async (notifyOnSuccess = false) => {
      setIsCheckingConnection(true);
      try {
        const info = await checkBackendConnection();
        setConnectionInfo(info);
        await queryClient.invalidateQueries({ queryKey: ['learners'] });
        await queryClient.invalidateQueries({ queryKey: ['learner'] });
        await queryClient.invalidateQueries({ queryKey: ['questions'] });
        if (notifyOnSuccess) {
          if (info.mode === 'live') {
            toast.success('Connected to FastAPI backend.');
          } else {
            toast.info('FastAPI backend unreachable — running in Demo Mode with sample records.');
          }
        }
      } finally {
        setIsCheckingConnection(false);
      }
    },
    [queryClient]
  );

  useEffect(() => {
    void performConnectionCheck(false);
  }, [performConnectionCheck]);

  const { data: learners = [], isLoading: isLoadingLearners } = useQuery({
    queryKey: ['learners', connectionInfo.mode],
    queryFn: listLearners,
    enabled: !isCheckingConnection,
  });

  useEffect(() => {
    if (!isLoadingLearners && learners.length > 0) {
      const exists = learners.some((l) => l.id === activeLearnerId);
      if (!activeLearnerId || !exists) {
        setActiveLearnerId(learners[0].id);
      }
    }
  }, [learners, activeLearnerId, isLoadingLearners, setActiveLearnerId]);

  const resetDemo = useCallback(() => {
    resetDemoWorkspace();
    const firstId = 'demo-maya-lin';
    setActiveLearnerId(firstId);
    void queryClient.invalidateQueries();
    toast.success('Demo sample records restored.');
  }, [queryClient, setActiveLearnerId]);

  return (
    <ActiveLearnerContext.Provider
      value={{
        activeLearnerId,
        setActiveLearnerId,
        learners,
        isLoadingLearners: isLoadingLearners || isCheckingConnection,
        connectionInfo,
        isCheckingConnection,
        recheckConnection: () => performConnectionCheck(true),
        resetDemo,
        isCreateDialogOpen,
        setCreateDialogOpen,
      }}
    >
      {children}
    </ActiveLearnerContext.Provider>
  );
}

export function useActiveLearner() {
  const ctx = useContext(ActiveLearnerContext);
  if (!ctx) {
    throw new Error('useActiveLearner must be used within ActiveLearnerProvider');
  }
  return ctx;
}
