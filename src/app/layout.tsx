import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'JA Alumni France - Espace Membre',
    description: 'Le réseau des anciens de la Mini-Entreprise.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="fr" className="h-full">
            <body className={`${inter.className} flex h-full flex-col bg-[var(--bg-main)]`}>
                <Navbar />
                <main className="flex-1">
                    {children}
                </main>
            </body>
        </html>
    );
}
