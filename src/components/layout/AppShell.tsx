import React, { useState } from 'react';
import { Sidebar } from '@/src/components/layout/Sidebar';
import { TopBar } from '@/src/components/layout/TopBar';
import { DemoModeBanner } from '@/src/components/layout/DemoModeBanner';
import { CreateLearnerDialog } from '@/src/components/layout/CreateLearnerDialog';

interface AppShellProps {
  pageTitle: string;
  children: React.ReactNode;
}

export function AppShell({ pageTitle, children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      <Sidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          pageTitle={pageTitle}
          onOpenMobileNav={() => setMobileOpen(true)}
        />

        <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <DemoModeBanner />
          {children}
        </main>
      </div>

      <CreateLearnerDialog />
    </div>
  );
}
