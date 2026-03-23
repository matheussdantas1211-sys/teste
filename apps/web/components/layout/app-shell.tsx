'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-100 lg:flex">
      <Sidebar pathname={pathname} />
      <div className="flex-1">
        <Header />
        <main className="space-y-6 p-6">{children}</main>
      </div>
    </div>
  );
}
