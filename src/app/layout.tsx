import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/lib/theme-context';
import { AuthProvider } from '@/lib/auth-context';
import { Navbar } from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'InternTrack | BE Sem VII Internship Portal (Course ET740)',
  description: 'Single web portal replacing Appendix B1, B2 and B3 for BE Semester VII Internship at Don Bosco College of Engineering',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans antialiased text-slate-900 dark:text-slate-100 transition-colors duration-200">
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1 pb-16">{children}</main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
