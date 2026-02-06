import type { Metadata } from 'next';
import '../styles/globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
    title: 'JA Alumni ERP',
    description: 'Plateforme de gestion JA Alumni France',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="fr">
            <body>
                <div className="main-layout">
                    <Navbar />
                    <main style={{ flex: 1 }}>{children}</main>
                </div>
            </body>
        </html>
    );
}
