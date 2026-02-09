"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import {
    Calendar as CalendarIcon,
    MapPin,
    Clock,
    Plus,
    Filter,
    ChevronLeft,
    ChevronRight,
    Loader,
    CheckCircle
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import geoData from '@/lib/geoData';
import EventModal from '@/components/features/calendar/EventModal';
import EventDetails from '@/components/features/calendar/EventDetails';

// Types
type Event = {
    id: string;
    title: string;
    description: string;
    date_start: string;
    date_end: string;
    location_name: string;
    region: string;
    scope: 'national' | 'regional';
    cover_image_url: string;
};

type UserProfile = {
    id: string;
    role: string;
    region: string;
};

export default function CalendarPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [events, setEvents] = useState<Event[]>([]);

    // Calendar State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    // Filters
    const { regions } = geoData;
    const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
    const [regionFilters, setRegionFilters] = useState<string[]>([]);

    // Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/auth/login');
                return;
            }

            // 1. Get Profile
            const { data: profileData } = await supabase
                .from('profiles')
                .select('id, role, region')
                .eq('id', session.user.id)
                .single();

            if (profileData) {
                setProfile(profileData);
                // Default filters: National + User's Region
                // We handle "National" scope separately, filtering here applies to REGIONAL events
                setRegionFilters([profileData.region]);
            }

            // 2. Get Events
            fetchEvents();
        };

        init();
    }, [router]);

    const fetchEvents = async () => {
        setLoading(true);
        // Fetch all events for the current month window (plus/minus some padding) would be better
        // For simplicity, fetching all for now (optimize later)
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('date_start', { ascending: true });

        if (error) console.error(error);
        if (data) setEvents(data);
        setLoading(false);
    };

    // Filter Logic
    const filteredEvents = events.filter(event => {
        // Always show National events
        if (event.scope === 'national') return true;
        // Show Regional events if their region is in the selected filters
        if (event.scope === 'regional' && regionFilters.includes(event.region)) return true;
        return false;
    });

    // Calendar Grid Generation
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Permissions
    const canCreateEvent = profile && ['copil', 'copil_plus', 'referent'].includes(profile.role);
    const canCreateNational = profile && ['copil', 'copil_plus'].includes(profile.role);

    // Helpers
    const getDaysEvents = (date: Date) => filteredEvents.filter(e => isSameDay(parseISO(e.date_start), date));

    const toggleRegionFilter = (region: string) => {
        // Prevent unchecking user's own region
        if (region === profile?.region) return;

        setRegionFilters(prev =>
            prev.includes(region)
                ? prev.filter(r => r !== region)
                : [...prev, region]
        );
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader className="animate-spin text-[var(--color-primary-500)]" /></div>;

    return (
        <div className="container mx-auto px-4 py-8 h-[calc(100vh-80px)] flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                        <CalendarIcon className="text-[var(--color-primary-600)]" size={32} />
                        Calendrier des Événements
                    </h1>
                    <p className="text-slate-500 mt-1">Découvrez les événements nationaux et de votre région</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-white rounded-lg border border-slate-200 p-1 flex">
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`px-3 py-1.5 text-sm rounded-md transition-all ${viewMode === 'calendar' ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Mois
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-1.5 text-sm rounded-md transition-all ${viewMode === 'list' ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Liste
                        </button>
                    </div>

                    {canCreateEvent && (
                        <button
                            onClick={() => setShowCreateModal(true)} // We will build this modal next
                            className="btn-primary flex items-center gap-2"
                        >
                            <Plus size={18} />
                            Créer
                        </button>
                    )}
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
                {/* Sidebar / Filters */}
                <div className="w-full lg:w-64 glass-card p-4 h-fit overflow-y-auto max-h-full">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Filter size={18} /> Filtres
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Obligatoire</h4>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm text-slate-700 opacity-75 cursor-not-allowed">
                                    <CheckCircle size={16} className="text-[var(--color-primary-600)]" />
                                    National
                                </label>
                                <label className="flex items-center gap-2 text-sm text-slate-700 opacity-75 cursor-not-allowed">
                                    <CheckCircle size={16} className="text-[var(--color-primary-600)]" />
                                    {profile?.region || 'Ma Région'}
                                </label>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Autres Régions</h4>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {regions.filter(r => r !== profile?.region).map(region => (
                                    <label key={region} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer hover:bg-slate-50 p-1 rounded">
                                        <input
                                            type="checkbox"
                                            className="rounded border-slate-300 text-[var(--color-primary-600)] focus:ring-[var(--color-primary-500)]"
                                            checked={regionFilters.includes(region)}
                                            onChange={() => toggleRegionFilter(region)}
                                        />
                                        <span className="truncate">{region}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Calendar Grid / List */}
                <div className="flex-1 glass-card p-6 flex flex-col min-h-0">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-slate-900 capitalize">
                            {format(currentDate, 'MMMM yyyy', { locale: fr })}
                        </h2>
                        <div className="flex gap-2">
                            <button onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1))} className="p-2 hover:bg-slate-100 rounded-full">
                                <ChevronLeft size={20} />
                            </button>
                            <button onClick={() => setCurrentDate(new Date())} className="text-sm font-medium px-3 py-1 hover:bg-slate-100 rounded-md">
                                Aujourd&apos;hui
                            </button>
                            <button onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1))} className="p-2 hover:bg-slate-100 rounded-full">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>

                    {viewMode === 'calendar' ? (
                        <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-lg overflow-hidden flex-1 border border-slate-200">
                            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                                <div key={day} className="bg-slate-50 p-2 text-center text-xs font-semibold text-slate-500 uppercase">
                                    {day}
                                </div>
                            ))}
                            {calendarDays.map((day, dayIdx) => {
                                const dayEvents = getDaysEvents(day);
                                return (
                                    <div
                                        key={day.toString()}
                                        onClick={() => setSelectedDate(day)}
                                        className={`bg-white min-h-[100px] p-2 transition-colors hover:bg-blue-50 cursor-pointer flex flex-col gap-1
                                            ${!isSameMonth(day, currentDate) ? 'bg-slate-50 text-slate-400' : ''}
                                            ${isSameDay(day, selectedDate) ? 'ring-2 ring-inset ring-[var(--color-primary-500)]' : ''}
                                        `}
                                    >
                                        <div className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1
                                            ${isToday(day) ? 'bg-[var(--color-primary-600)] text-white' : ''}
                                        `}>
                                            {format(day, 'd')}
                                        </div>

                                        {dayEvents.map(event => (
                                            <div
                                                key={event.id}
                                                onClick={(e) => { e.stopPropagation(); setSelectedEventId(event.id); }}
                                                className={`text-xs px-1.5 py-0.5 rounded truncate border-l-2 cursor-pointer hover:scale-105 transition-transform
                                                ${event.scope === 'national'
                                                        ? 'bg-purple-100 text-purple-700 border-purple-500'
                                                        : 'bg-emerald-100 text-emerald-700 border-emerald-500'}
                                            `}>
                                                {event.title}
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="space-y-4 overflow-y-auto flex-1">
                            {filteredEvents.length === 0 && (
                                <div className="text-center py-12 text-slate-400">
                                    Aucun événement trouvé pour ces filtres.
                                </div>
                            )}
                            {filteredEvents.map(event => (
                                <div
                                    key={event.id}
                                    onClick={() => setSelectedEventId(event.id)}
                                    className="p-4 border border-slate-200 rounded-lg hover:border-[var(--color-primary-300)] transition-colors flex gap-4 cursor-pointer"
                                >
                                    <div className={`w-1 origin-center scale-y-100 rounded-full ${event.scope === 'national' ? 'bg-purple-500' : 'bg-emerald-500'}`} />
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            {event.scope === 'national' && <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">National</span>}
                                            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{event.region}</span>
                                        </div>
                                        <h3 className="font-bold text-slate-900">{event.title}</h3>
                                        <div className="flex items-center gap-4 text-sm text-slate-500 mt-2">
                                            <span className="flex items-center gap-1"><Clock size={14} /> {format(parseISO(event.date_start), 'dd MMM yyyy HH:mm', { locale: fr })}</span>
                                            <span className="flex items-center gap-1"><MapPin size={14} /> {event.location_name}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Event Create Modal */}
            {profile && (
                <EventModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        fetchEvents();
                    }}
                    userRegion={profile.region}
                    canCreateNational={canCreateNational || false}
                />
            )}

            {/* Event Details Modal */}
            {selectedEventId && profile && (
                <EventDetails
                    isOpen={!!selectedEventId}
                    eventId={selectedEventId}
                    onClose={() => setSelectedEventId(null)}
                    currentUserId={profile.id}
                    userRole={profile.role}
                    userRegion={profile.region}
                    onUpdate={fetchEvents} // Refresh list after edit/delete
                />
            )}
        </div>
    );
}
