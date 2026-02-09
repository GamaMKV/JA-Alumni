import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { Suspense } from "react";
import GlobalLoading from "./loading";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "JA Alumni - Réseau des Anciens Mini-Entreprises",
    description: "Plateforme de gestion et d'animation du réseau JA Alumni",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr">
            <body className={inter.className}>
                <Navbar />
                <Suspense fallback={<GlobalLoading />}>
                    <main className="min-h-screen">
                        {children}
                    </main>
                </Suspense>
            </body>
        </html>
    );
}
