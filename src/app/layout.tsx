import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { ThirdwebProvider } from '@/components/auth/ThirdwebProvider';
import { MotionProvider } from '@/components/motion/MotionProvider';

export const metadata: Metadata = {
  title: 'FAAJI - The Ultimate Whot! Experience',
  description: 'Play Whot! online with friends, practice against AI, or stake Zora coin in competitive matches.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-gradient-to-br from-gray-900 via-gray-900 to-black text-foreground">
        <ThirdwebProvider>
          <MotionProvider>
            {children}
          </MotionProvider>
        </ThirdwebProvider>
        <Toaster />
      </body>
    </html>
  );
}

    