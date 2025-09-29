import { Outfit } from 'next/font/google';
import './globals.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { getUserEmail, getUserProfile } from '@/context/retrieval';
import { ProfileProvider } from '@/context/ProfileContext';
import { Toaster } from "@/components/ui/sonner"

const outfit = Outfit({
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = getUserProfile();
  const email = getUserEmail();

  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <ProfileProvider profilePromise={profile} emailPromise={email}>
            <SidebarProvider>{children}</SidebarProvider>
          </ProfileProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
