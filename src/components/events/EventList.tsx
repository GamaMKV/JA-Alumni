"use client";

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import EventCard from './EventCard';
import EventModal from './EventModal';
import { Plus } from 'lucide-react';

interface EventListProps {
    limit?: number;
    showPast?: boolean;
    regionFilter?: string; // If set, only show events for this region (plus National)
    adminMode?: boolean; // If true, show Add/Edit buttons
}

export default function EventList({ limit, showPast = false, regionFilter, adminMode = false }: EventListProps) {
    const [events, setEvents] = useState<any[]>([]);
    const [participations, setParticipations] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string>('membre');
    const [userRegion, setUserRegion] = useState<string | null>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<any>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // 1. Get User Info
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                const { data: profile } = await supabase.from('profiles').select('statut, region').eq('id', user.id).single();
                if (profile) {
                    setUserRole(profile.statut);
                    setUserRegion(profile.region);
                }

                // 2. Get User Participations
                const { data: parts } = await supabase.from('participations').select('event_id').eq('profile_id', user.id);
                if (parts) {
                    setParticipations(new Set(parts.map(p => p.event_id)));
                }
            }

            // 3. Get Events
            let query = supabase.from('evenements').select('*').order('date', { ascending: true });

            if (!showPast) {
                query = query.gte('date', new Date().toISOString());
            }

            if (limit) {
                query = query.limit(limit);
            }

            const { data: eventsData, error } = await query;
            if (error) throw error;

            // Client-side filtering for region mixed with National (Supabase OR is tricky with complex filters sometimes, keeping it simple)
            // Show events if: Event is National (region_id is null) OR Event Region matches Filter
            let filteredEvents = eventsData || [];
            if (regionFilter) {
                filteredEvents = filteredEvents.filter(e => !e.region_id || e.region_id === regionFilter);
            }

            setEvents(filteredEvents);

        } catch (error) {
            console.error("Error fetching events:", error);
        } finally {
            setLoading(false);
        }
    }, [limit, showPast, regionFilter]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreateClick = () => {
        setEditingEvent(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (event: any) => {
        setEditingEvent(event);
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (eventId: string) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) return;
        try {
            const { error } = await supabase.from('evenements').delete().eq('id', eventId);
            if (error) throw error;
            fetchData();
        } catch (err) {
            console.error("Error deleting event:", err);
            alert("Erreur lors de la suppression");
        }
    };

    if (loading) return <div>Chargement des événements...</div>;

    const canCreate = adminMode || ['admin', 'moderateur'].includes(userRole);

    return (
        <div>
            {canCreate && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <button className="btn btn-primary" onClick={handleCreateClick}>
                        <Plus size={18} style={{ marginRight: '0.5rem' }} />
                        Créer un événement
                    </button>
                </div>
            )}

            {events.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#666', background: '#f9f9f9', borderRadius: '0.5rem' }}>
                    Aucun événement à venir pour le moment.
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {events.map(event => (
                        <EventCard
                            key={event.id}
                            event={event}
                            userId={userId!}
                            userRole={userRole}
                            isRegistered={participations.has(event.id)}
                            onUpdate={fetchData}
                            onDelete={canCreate ? handleDeleteClick : undefined}
                            onEdit={canCreate ? handleEditClick : undefined}
                        />
                    ))}
                </div>
            )}

            <EventModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onUpdate={fetchData}
                event={editingEvent}
                userRegion={userRegion}
                userRole={userRole}
            />
        </div>
    );
}
