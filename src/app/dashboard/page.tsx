"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Calendar, Users, Briefcase, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const getProfile = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/auth/login');
                return;
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (error) {
                console.error("Error fetching profile:", error);
            }

            setProfile(data);
            setLoading(false);
        };
        getProfile();
    }, [router]);

    if (loading) {
        return <div className="flex justify-center items-center min-h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary-600)]"></div></div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">
                    Bonjour, <span className="text-[var(--color-primary-600)]">{profile?.first_name || 'Alumni'}</span> !
                </h1>
                <p className="text-slate-600 mt-2">
                    Bienvenue sur votre espace membre. Voici ce qu&apos;il se passe dans le réseau.
                </p>
            </header>

            {/* Quick Stats / Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <Link href="/events" className="glass-card group cursor-pointer hover:border-[var(--color-primary-300)]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                            <Calendar size={24} />
                        </div>
                        <ArrowRight size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Prochains Événements</h3>
                    <p className="text-slate-500 text-sm mt-1">Découvrez les afterworks et rencontres à venir près de chez vous.</p>
                </Link>

                <Link href="/directory" className="glass-card group cursor-pointer hover:border-[var(--color-primary-300)]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-lg group-hover:bg-orange-100 transition-colors">
                            <Users size={24} />
                        </div>
                        <ArrowRight size={20} className="text-slate-400 group-hover:text-orange-600 transition-colors" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Annuaire des Membres</h3>
                    <p className="text-slate-500 text-sm mt-1">Retrouvez vos anciens camarades de mini-entreprise.</p>
                </Link>

                <Link href="/profile" className="glass-card group cursor-pointer hover:border-[var(--color-primary-300)]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-100 transition-colors">
                            <Briefcase size={24} />
                        </div>
                        <ArrowRight size={20} className="text-slate-400 group-hover:text-green-600 transition-colors" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Mon Parcours</h3>
                    <p className="text-slate-500 text-sm mt-1">Mettez à jour votre profil et vos expériences.</p>
                </Link>
            </div>

            {/* Content Section (News or Recent Activity can go here) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card">
                    <h2 className="text-xl font-bold mb-4">Actualités du Réseau</h2>
                    <div className="space-y-4">
                        <div className="border-l-4 border-[var(--color-primary-500)] pl-4 py-1">
                            <p className="text-sm text-slate-500 mb-1">Il y a 2 jours</p>
                            <h4 className="font-medium text-slate-900">Lancement de la nouvelle plateforme !</h4>
                            <p className="text-slate-600 text-sm">Bienvenue sur le nouveau site JA Alumni. N&apos;hésitez pas à compléter votre profil.</p>
                        </div>
                        {/* More news items... */}
                    </div>
                </div>

                <div className="glass-card bg-[var(--color-primary-50)] border-[var(--color-primary-100)]">
                    <h2 className="text-xl font-bold mb-4 text-[var(--color-primary-800)]">Le Saviez-vous ?</h2>
                    <p className="text-[var(--color-primary-900)]">
                        Le réseau JA Alumni grandit chaque jour ! Nous sommes aujourd&apos;hui près de 200 anciens mini-entrepreneurs passionnés et engagés. Votre participation est essentielle pour faire vivre notre communauté !
                    </p>
                    <div className="mt-6">
                        <Link href="/about" className="text-sm font-semibold text-[var(--color-primary-700)] hover:underline">
                            Découvrir l&apos;histoire de JA &rarr;
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
