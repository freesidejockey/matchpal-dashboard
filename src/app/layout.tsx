import { Outfit } from 'next/font/google';
import './globals.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { getUserProfile } from '@/context/retrieval';
import { ProfileProvider } from '@/context/ProfileContext';

const outfit = Outfit({
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = getUserProfile();

  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <ProfileProvider profilePromise={profile}>
            <SidebarProvider>{children}</SidebarProvider>
          </ProfileProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
