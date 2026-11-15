import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  ClipboardCheck,
  GitBranch,
  LayoutDashboard,
  Network,
  Plus,
  UserCircle2,
  X,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Button } from '@/src/components/ui/button';
import { useActiveLearner } from '@/src/hooks/useActiveLearner';

const NAV_ITEMS = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/assessments', label: 'Assessments', icon: ClipboardCheck },
  { to: '/knowledge-twin', label: 'Knowledge Twin', icon: Network },
  { to: '/learning-path', label: 'Learning Path', icon: GitBranch },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/profile', label: 'Profile', icon: UserCircle2 },
];

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const { setCreateDialogOpen } = useActiveLearner();

  const navContent = (
    <div className="flex h-full flex-col justify-between bg-white px-4 py-5">
      <div>
        <div className="flex items-center justify-between px-2 pb-6">
          <NavLink
            to="/"
            onClick={onCloseMobile}
            className="flex items-center gap-2.5 text-[#0F172A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] rounded-lg"
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="shrink-0"
            >
              <rect width="28" height="28" rx="7" fill="#4F46E5" />
              <circle cx="9.5" cy="18.5" r="2.25" fill="white" />
              <circle cx="18.5" cy="18.5" r="2.25" fill="white" />
              <circle cx="14" cy="9.5" r="2.5" fill="white" />
              <path
                d="M14 12V14.5M14 14.5L9.5 16.5M14 14.5L18.5 16.5"
                stroke="white"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
            <span className="font-display text-lg font-bold tracking-tight text-[#0F172A] whitespace-nowrap">
              LearnerTwin
            </span>
          </NavLink>
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-[#64748B] hover:bg-slate-100 hover:text-[#0F172A] lg:hidden"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav aria-label="Primary Navigation" className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 whitespace-nowrap',
                    isActive
                      ? 'bg-[#EEF2FF] text-[#4F46E5]'
                      : 'text-[#64748B] hover:bg-slate-100/80 hover:text-[#0F172A]'
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-[#E2E8F0] pt-4">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => {
            onCloseMobile();
            setCreateDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 text-[#4F46E5]" />
          <span>Create Learner</span>
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-[#E2E8F0] bg-white lg:block">
        <div className="sticky top-0 h-screen">{navContent}</div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-64 max-w-[80vw] border-r border-[#E2E8F0] bg-white shadow-xl">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}
