
import type { Metadata } from 'next';
import { Archivo_Black, Inter, Space_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Providers from './providers';
import Navbar from '@/components/layout/Navbar';

const archivo = Archivo_Black({ 
  subsets: ['latin'], 
  variable: '--font-archivo',
  weight: ['400'] 
});

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'] 
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  variable: '--font-space-mono',
  weight: ['400', '700']
});

export const metadata: Metadata = {
  title: 'Siyar - Timeline Manager',
  description: 'Visualize and manage your academic commitments with neo-brutalist clarity.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${archivo.variable} ${inter.variable} ${spaceMono.variable}`}>
      <head>
        {/* Removed direct Google Fonts links as next/font handles it */}
      </head>
      <body className="font-inter text-body-md bg-background text-foreground antialiased">
        <Providers>
          <Navbar />
          <main className="pt-16"> {/* Adjust padding top based on Navbar height */}
            {children}
          </main>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
    