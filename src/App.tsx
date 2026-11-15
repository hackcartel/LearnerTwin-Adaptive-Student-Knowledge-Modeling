import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ActiveLearnerProvider } from '@/src/hooks/useActiveLearner';
import { Toaster } from '@/src/components/ui/sonner';
import { OverviewPage } from '@/src/pages/OverviewPage';
import { AssessmentsPage } from '@/src/pages/AssessmentsPage';
import { KnowledgeTwinPage } from '@/src/pages/KnowledgeTwinPage';
import { LearningPathPage } from '@/src/pages/LearningPathPage';
import { AnalyticsPage } from '@/src/pages/AnalyticsPage';
import { ProfilePage } from '@/src/pages/ProfilePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ActiveLearnerProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/assessments" element={<AssessmentsPage />} />
            <Route path="/knowledge-twin" element={<KnowledgeTwinPage />} />
            <Route path="/learning-path" element={<LearningPathPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </ActiveLearnerProvider>
    </QueryClientProvider>
  );
}
