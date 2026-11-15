import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, RefreshCw, RotateCcw, Server, ServerOff, UserPlus } from 'lucide-react';
import { AppShell } from '@/src/components/layout/AppShell';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { useActiveLearner } from '@/src/hooks/useActiveLearner';
import {
  useCreateLearnerMutation,
  useLearnerProfile,
} from '@/src/hooks/useLearnerQueries';
import { formatDateShort, formatMasteryScore, getInitials } from '@/src/lib/utils';

const profileCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Learner name must be at least 2 characters.')
    .max(60, 'Learner name must be under 60 characters.'),
  learning_track: z
    .string()
    .trim()
    .min(2, 'Learning track is required.')
    .max(80, 'Learning track must be under 80 characters.'),
  goal: z
    .string()
    .trim()
    .max(160, 'Goal must be under 160 characters.')
    .optional(),
});

type ProfileCreateValues = z.infer<typeof profileCreateSchema>;

export function ProfilePage() {
  const {
    activeLearnerId,
    setActiveLearnerId,
    learners,
    connectionInfo,
    isCheckingConnection,
    recheckConnection,
    resetDemo,
  } = useActiveLearner();

  const profileQuery = useLearnerProfile(activeLearnerId);
  const createMutation = useCreateLearnerMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileCreateValues>({
    resolver: zodResolver(profileCreateSchema),
    defaultValues: {
      name: '',
      learning_track: 'CS1 Python Foundations',
      goal: '',
    },
  });

  const onCreate = async (values: ProfileCreateValues) => {
    await createMutation.mutateAsync({
      name: values.name,
      learning_track: values.learning_track,
      goal: values.goal || undefined,
    });
    reset();
  };

  const activeProfile = profileQuery.data;
  const overallPct = formatMasteryScore(activeProfile?.overall_mastery);

  return (
    <AppShell pageTitle="Profile">
      <div className="space-y-6">
        <div className="border-b border-[#E2E8F0] pb-5">
          <h2 className="font-display text-xl font-bold text-[#0F172A] sm:text-2xl">
            Learner Profiles & API Configuration
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-[#64748B]">
            Switch between active learner profiles, register a new learner for diagnostic onboarding, or verify FastAPI backend connectivity.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Active Learner Summary + Switcher */}
          <div className="space-y-6 lg:col-span-7">
            <Card>
              <CardHeader>
                <CardTitle>Active Learner</CardTitle>
                <CardDescription>
                  Currently selected profile for assessments and Knowledge Twin modeling
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {activeProfile?.learner ? (
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#4F46E5] font-display text-base font-bold text-white">
                        {getInitials(activeProfile.learner.name)}
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-semibold text-[#0F172A]">
                          {activeProfile.learner.name}
                        </h3>
                        <p className="text-xs text-[#64748B]">
                          {activeProfile.learner.learning_track} · Created{' '}
                          {formatDateShort(activeProfile.learner.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-6 text-right">
                      <div>
                        <p className="text-xs text-[#64748B]">Overall Mastery</p>
                        <p className="font-display text-xl font-bold text-[#0F172A] tabular-nums">
                          {overallPct !== null ? `${overallPct}%` : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#64748B]">Attempts</p>
                        <p className="font-display text-xl font-bold text-[#0F172A] tabular-nums">
                          {activeProfile.assessments_completed}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-[#64748B]">
                    No active learner selected. Create a new learner on the right to begin.
                  </p>
                )}

                {activeProfile?.learner.goal && (
                  <div className="rounded-lg bg-[#F8FAFC] px-4 py-3 text-xs text-[#64748B]">
                    <span className="font-medium text-[#0F172A]">Target Goal: </span>
                    {activeProfile.learner.goal}
                  </div>
                )}

                <div className="border-t border-[#E2E8F0] pt-4">
                  <p className="mb-3 text-xs font-medium text-[#64748B]">
                    Available Learner Profiles ({learners.length})
                  </p>
                  <div className="space-y-2">
                    {learners.map((learner) => {
                      const isActive = learner.id === activeLearnerId;
                      return (
                        <button
                          key={learner.id}
                          type="button"
                          onClick={() => setActiveLearnerId(learner.id)}
                          className={`flex w-full items-center justify-between rounded-lg border px-3.5 py-2.5 text-left text-sm transition-colors cursor-pointer ${
                            isActive
                              ? 'border-[#4F46E5] bg-[#EEF2FF]/60'
                              : 'border-[#E2E8F0] bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div className="min-w-0">
                            <p className="truncate font-medium text-[#0F172A]">
                              {learner.name}
                            </p>
                            <p className="truncate text-xs text-[#64748B]">
                              {learner.learning_track}
                            </p>
                          </div>
                          {isActive && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#4F46E5] shrink-0">
                              <Check className="h-3.5 w-3.5" />
                              <span>Active</span>
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Backend Connection Diagnostics */}
            <Card>
              <CardHeader>
                <CardTitle>FastAPI Backend Connection</CardTitle>
                <CardDescription>
                  Configured endpoint via <code className="font-mono text-xs">VITE_API_BASE_URL</code>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
                      {connectionInfo.mode === 'live' ? (
                        <Server className="h-4 w-4 text-[#10B981]" />
                      ) : (
                        <ServerOff className="h-4 w-4 text-[#F59E0B]" />
                      )}
                      <span>
                        {connectionInfo.mode === 'live'
                          ? 'Connected to Live FastAPI Server'
                          : 'Demo Mode (Backend Unreachable)'}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-[#64748B]">
                      {connectionInfo.baseUrl}
                    </p>
                    {connectionInfo.errorMessage && (
                      <p className="text-xs text-[#64748B]">
                        {connectionInfo.errorMessage}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void recheckConnection()}
                      disabled={isCheckingConnection}
                    >
                      <RefreshCw
                        className={`h-3.5 w-3.5 ${
                          isCheckingConnection ? 'animate-spin' : ''
                        }`}
                      />
                      <span>Test Connection</span>
                    </Button>

                    {connectionInfo.mode === 'demo' && (
                      <Button variant="outline" size="sm" onClick={resetDemo}>
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Reset Sample Data</span>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Create New Learner Form */}
          <div className="lg:col-span-5">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 text-xs font-medium text-[#4F46E5]">
                  <UserPlus className="h-4 w-4" />
                  <span>Onboarding</span>
                </div>
                <CardTitle className="pt-1">Register New Learner</CardTitle>
                <CardDescription>
                  Create a fresh learner profile to run through the Create Learner → Assess → Knowledge Twin → Recommend workflow.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="profile-name">Full Name</Label>
                    <Input
                      id="profile-name"
                      placeholder="e.g., Samir Kulkarni"
                      {...register('name')}
                    />
                    {errors.name && (
                      <p className="text-xs text-[#EF4444]">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="profile-track">Learning Track</Label>
                    <Input
                      id="profile-track"
                      placeholder="e.g., CS1 Python Foundations"
                      {...register('learning_track')}
                    />
                    {errors.learning_track && (
                      <p className="text-xs text-[#EF4444]">
                        {errors.learning_track.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="profile-goal">Learning Goal (Optional)</Label>
                    <Input
                      id="profile-goal"
                      placeholder="e.g., Master loop invariants and conditionals"
                      {...register('goal')}
                    />
                    {errors.goal && (
                      <p className="text-xs text-[#EF4444]">
                        {errors.goal.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending
                      ? 'Creating Profile...'
                      : 'Create & Switch to Learner'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
