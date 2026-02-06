import Link from 'next/link';
import { ArrowRight, Users, Calendar, Award } from 'lucide-react';

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative px-6 pt-14 lg:px-8 overflow-hidden">
                <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                    <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#86efac] to-[#22c55e] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
                </div>

                <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56 text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
                        Le Réseau <span className="text-[var(--color-primary-600)]">JA Alumni</span>
                    </h1>
                    <p className="mt-6 text-lg leading-8 text-slate-600">
                        Rejoignez la communauté des anciens de la Mini-Entreprise. Continuez l&apos;aventure, développez votre réseau et participez à des événements exclusifs.
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        <Link href="/auth/register" className="btn-primary flex items-center gap-2 px-6 py-3 text-lg">
                            Rejoindre le mouvement <ArrowRight size={20} />
                        </Link>
                        <Link href="/about" className="text-sm font-semibold leading-6 text-slate-900 hover:text-[var(--color-primary-600)] transition-colors">
                            En savoir plus <span aria-hidden="true">→</span>
                        </Link>
                    </div>
                </div>

                <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
                    <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#86efac] to-[#22c55e] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" />
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 bg-white/50 backdrop-blur-sm">
                <div className="container mx-auto px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-12">
                        {/* Feature 1 */}
                        <div className="glass-card">
                            <div className="h-12 w-12 rounded-lg bg-[var(--color-primary-100)] flex items-center justify-center text-[var(--color-primary-600)] mb-4">
                                <Users size={24} />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Un Réseau Puissant</h3>
                            <p className="text-slate-600">
                                Connectez-vous avec des milliers d&apos;anciens mini-entrepreneurs à travers toute la France.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="glass-card">
                            <div className="h-12 w-12 rounded-lg bg-[var(--color-primary-100)] flex items-center justify-center text-[var(--color-primary-600)] mb-4">
                                <Calendar size={24} />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Événements Exclusifs</h3>
                            <p className="text-slate-600">
                                Participez à des afterworks, des ateliers et des événements de networking organisés par JA.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="glass-card">
                            <div className="h-12 w-12 rounded-lg bg-[var(--color-primary-100)] flex items-center justify-center text-[var(--color-primary-600)] mb-4">
                                <Award size={24} />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Opportunités</h3>
                            <p className="text-slate-600">
                                Accédez à des offres d&apos;emploi, de stage et de mentorat réservées aux membres.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
