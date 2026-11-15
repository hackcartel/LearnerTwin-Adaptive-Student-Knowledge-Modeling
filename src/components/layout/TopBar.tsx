import { Link } from 'react-router-dom';
import { Menu, RefreshCw, Server, ServerOff } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';
import { useActiveLearner } from '@/src/hooks/useActiveLearner';
import { getInitials } from '@/src/lib/utils';

interface TopBarProps {
  pageTitle: string;
  onOpenMobileNav: () => void;
}

export function TopBar({ pageTitle, onOpenMobileNav }: TopBarProps) {
  const {
    activeLearnerId,
    setActiveLearnerId,
    learners,
    isLoadingLearners,
    connectionInfo,
    isCheckingConnection,
    recheckConnection,
    setCreateDialogOpen,
  } = useActiveLearner();

  const activeLearner = learners.find((l) => l.id === activeLearnerId);

  const handleLearnerChange = (val: string) => {
    if (val === '__create_new__') {
      setCreateDialogOpen(true);
      return;
    }
    setActiveLearnerId(val);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[#E2E8F0] bg-white/95 backdrop-blur-xs">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileNav}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#E2E8F0] text-[#0F172A] hover:bg-slate-50 lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="font-display truncate text-lg font-semibold tracking-tight text-[#0F172A] sm:text-xl">
            {pageTitle}
          </h1>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="w-44 sm:w-56">
            <Select
              value={activeLearnerId || undefined}
              onValueChange={handleLearnerChange}
              disabled={isLoadingLearners}
            >
              <SelectTrigger aria-label="Select active learner" className="h-9 text-xs sm:text-sm">
                <SelectValue
                  placeholder={isLoadingLearners ? 'Loading learners...' : 'Select learner'}
                />
              </SelectTrigger>
              <SelectContent>
                {learners.map((learner) => (
                  <SelectItem key={learner.id} value={learner.id}>
                    {learner.name}
                  </SelectItem>
                ))}
                <SelectItem value="__create_new__" className="font-medium text-[#4F46E5]">
                  + Create new learner
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <button
            type="button"
            onClick={() => void recheckConnection()}
            disabled={isCheckingConnection}
            title={`Backend URL: ${connectionInfo.baseUrl}. Click to re-check FastAPI connection.`}
            className="hidden sm:inline-flex h-9 items-center gap-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-xs font-medium text-[#0F172A] transition-colors hover:bg-slate-100 whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60"
          >
            {isCheckingConnection ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#4F46E5]" />
            ) : connectionInfo.mode === 'live' ? (
              <Server className="h-3.5 w-3.5 text-[#10B981]" />
            ) : (
              <ServerOff className="h-3.5 w-3.5 text-[#F59E0B]" />
            )}
            <span>
              {connectionInfo.mode === 'live' ? 'FastAPI Connected' : 'Demo Mode'}
            </span>
          </button>

          <Link
            to="/profile"
            aria-label={
              activeLearner ? `Profile for ${activeLearner.name}` : 'Learner Profile'
            }
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#4F46E5] font-display text-xs font-semibold text-white transition-colors hover:bg-[#4338CA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2"
          >
            {getInitials(activeLearner?.name || 'LT')}
          </Link>
        </div>
      </div>
    </header>
  );
}
