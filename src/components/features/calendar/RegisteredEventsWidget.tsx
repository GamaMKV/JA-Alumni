"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Calendar, Clock, MapPin, ExternalLink } from 'lucide-react';
import { format, parseISO, isAfter } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';

type RegisteredEvent = {
    id: string;
    title: string;
    date_start: string;
    location_name: string;
    region: string;
    scope: string;
};

export default function RegisteredEventsWidget() {
    const [events, setEvents] = useState<RegisteredEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyEvents = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            // Fetch participations with event details
            const { data, error } = await supabase
                .from('participations')
                .select(`
                    event_id,
                    events (
                        id,
                        title,
                        date_start,
                        location_name,
                        region,
                        scope
                    )
                `)
                .eq('user_id', session.user.id);

            if (!error && data) {
                // Filter out past events and sort by date
                const now = new Date();
                const upcoming = data
                    .map((p: any) => p.events)
                    .filter((e: any) => e && isAfter(parseISO(e.date_start), now))
                    .sort((a: any, b: any) => parseISO(a.date_start).getTime() - parseISO(b.date_start).getTime());

                setEvents(upcoming);
            }
            setLoading(false);
        };

        fetchMyEvents();
    }, []);

    if (loading) return (
        <div className="glass-card animate-pulse">
            <div className="h-6 w-40 bg-slate-200 rounded mb-4"></div>
            <div className="space-y-3">
                <div className="h-20 bg-slate-100 rounded"></div>
            </div>
        </div>
    );

    return (
        <div className="glass-card flex flex-col h-full border-l-4 border-l-[var(--color-primary-500)]">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Calendar size={20} className="text-[var(--color-primary-600)]" />
                    Mes Rappels d'Événements
                </h2>
                <Link href="/calendar" className="text-xs text-[var(--color-primary-600)] hover:underline font-medium">
                    Voir tout
                </Link>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar flex-1">
                {events.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-sm text-slate-400">Vous n'êtes inscrit à aucun événement futur.</p>
                        <Link href="/calendar" className="btn-secondary text-xs mt-3 inline-block">
                            Parcourir le calendrier
                        </Link>
                    </div>
                ) : (
                    events.map((event) => (
                        <div key={event.id} className="p-3 rounded-lg border border-slate-100 bg-white hover:border-[var(--color-primary-200)] transition-all group">
                            <div className="flex justify-between items-start gap-2">
                                <h4 className="text-sm font-bold text-slate-900 group-hover:text-[var(--color-primary-700)] transition-colors">
                                    {event.title}
                                </h4>
                                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${event.scope === 'national' ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600'
                                    }`}>
                                    {event.scope === 'national' ? 'National' : event.region}
                                </span>
                            </div>

                            <div className="mt-2 space-y-1">
                                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                    <Clock size={12} className="text-slate-400" />
                                    <span>{format(parseISO(event.date_start), 'eeee d MMMM', { locale: fr })}</span>
                                    <span className="text-slate-300">|</span>
                                    <span className="font-medium">{format(parseISO(event.date_start), 'HH:mm')}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                    <MapPin size={12} className="text-slate-400" />
                                    <span className="truncate">{event.location_name || 'Lieu non défini'}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
