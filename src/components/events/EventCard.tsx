"use client";

import { MapPin, Calendar, Users, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface EventCardProps {
    event: any;
    userRole: string;
    userId: string;
    isRegistered: boolean;
    onUpdate: () => void;
    onDelete?: (eventId: string) => void;
    onEdit?: (event: any) => void;
}

export default function EventCard({ event, userRole, userId, isRegistered, onUpdate, onDelete, onEdit }: EventCardProps) {
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        setLoading(true);
        try {
            if (isRegistered) {
                // Unsubscribe
                await supabase.from('participations')
                    .delete()
                    .eq('profile_id', userId)
                    .eq('event_id', event.id);
            } else {
                // Subscribe
                await supabase.from('participations')
                    .insert({ profile_id: userId, event_id: event.id });
            }
            onUpdate();
        } catch (error) {
            console.error('Error toggling participation:', error);
            alert("Une erreur est survenue lors de l'inscription/désinscription.");
        } finally {
            setLoading(false);
        }
    };

    const isAdminOrMod = ['admin', 'moderateur'].includes(userRole);
    const date = new Date(event.date);

    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
            <div style={{ marginBottom: '1rem' }}>
                <span style={{
                    fontSize: '0.8rem',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '1rem',
                    background: event.region_id ? 'var(--color-primary-light)' : '#E3F2FD',
                    color: event.region_id ? 'var(--color-primary-dark)' : '#1565C0',
                    fontWeight: 600
                }}>
                    {event.region_id || 'National'}
                </span>
            </div>

            <h3 style={{ marginBottom: '0.5rem' }}>{event.nom}</h3>

            <div style={{ display: 'flex', gap: '1rem', color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={16} />
                    <span>{date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={16} />
                    <span>{event.lieu || 'En ligne'}</span>
                </div>
            </div>

            <p style={{ color: '#555', fontSize: '0.95rem', flex: 1, marginBottom: '1.5rem' }}>
                {event.description || 'Aucune description disponible.'}
            </p>

            <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
                <button
                    className={`btn ${isRegistered ? 'btn-outline' : 'btn-primary'}`}
                    onClick={handleRegister}
                    disabled={loading}
                    style={{ flex: 1 }}
                >
                    {loading ? '...' : isRegistered ? 'Se désinscrire' : "S'inscrire"}
                </button>

                {isAdminOrMod && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            className="btn btn-outline"
                            style={{ padding: '0.5rem' }}
                            onClick={() => onEdit && onEdit(event)}
                            title="Modifier"
                        >
                            <Edit size={18} />
                        </button>
                        <button
                            className="btn btn-outline"
                            style={{ padding: '0.5rem', color: 'red', borderColor: 'red' }}
                            onClick={() => onDelete && onDelete(event.id)}
                            title="Supprimer"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
