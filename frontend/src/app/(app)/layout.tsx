import { Navigation } from '@/components/Navigation';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-900/20 via-transparent to-transparent" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent" />
      <Navigation />
      <main className="relative ml-0 min-h-screen p-4 md:ml-64 md:p-8">{children}</main>
    </div>
  );
}
