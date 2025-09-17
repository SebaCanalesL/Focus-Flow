import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/contexts/app-provider';
import { Toaster } from "@/components/ui/toaster"
import { GoogleOAuthProvider } from '@react-oauth/google';

export const metadata: Metadata = {
  title: 'FocusFlow',
  description: 'Cultivate gratitude and build positive habits.',
};

// IMPORTANT: Replace this with your actual Google Client ID
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (GOOGLE_CLIENT_ID.startsWith("YOUR_GOOGLE_CLIENT_ID")) {
     console.error("ERROR: Please replace 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com' in src/app/layout.tsx with your actual Google Client ID.");
  }
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <AppProvider>
            {children}
            <Toaster />
          </AppProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
