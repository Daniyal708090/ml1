import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Smart Interview Analyser | AI Technical Interviews',
  description:
    'Premium AI-powered interview platform for software engineers. Practice, analyse, and level up with FAANG-level feedback.',
  keywords: ['interview', 'AI', 'frontend', 'backend', 'software engineering'],
  openGraph: {
    title: 'Smart Interview Analyser',
    description: 'AI technical interviews with deep engineering feedback',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full antialiased">
        {children}
        <Toaster theme="dark" position="bottom-right" />
      </body>
    </html>
  );
}
