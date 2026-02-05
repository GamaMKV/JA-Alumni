"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Save } from 'lucide-react';

interface EventModalProps {
    event?: any;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
    userRegion: string | null;
    userRole: string;
}

const REGIONS = [
    'Auvergne-Rhône-Alpes', 'Bourgogne-Franche-Comté', 'Bretagne', 'Centre-Val de Loire',
    'Corse', 'Grand Est', 'Hauts-de-France', 'Île-de-France', 'Normandie',
    'Nouvelle-Aquitaine', 'Occitanie', 'Pays de la Loire', 'Provence-Alpes-Côte d\'Azur',
    'Guadeloupe', 'Martinique', 'Guyane', 'La Réunion', 'Mayotte'
];

export default function EventModal({ event, isOpen, onClose, onUpdate, userRegion, userRole }: EventModalProps) {
    const [formData, setFormData] = useState({
        nom: '',
        date: '',
        time: '',
        lieu: '',
        region_id: '',
        description: ''
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            if (event) {
                const d = new Date(event.date);
                setFormData({
                    nom: event.nom,
                    date: d.toISOString().split('T')[0],
                    time: d.toTimeString().slice(0, 5),
                    lieu: event.lieu || '',
                    region_id: event.region_id || '',
                    description: event.description || ''
                });
            } else {
                // New Event Defaults
                setFormData({
                    nom: '',
                    date: new Date().toISOString().split('T')[0],
                    time: '18:00',
                    lieu: '',
                    region_id: userRole === 'moderateur' && userRegion ? userRegion : '', // Default to user region if mod
                    description: ''
                });
            }
        }
        setError(null);
    }, [isOpen, event, userRegion, userRole]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            if (!formData.nom || !formData.date || !formData.time) {
                throw new Error("Veuillez remplir les champs obligatoires (Nom, Date, Heure).");
            }

            const fullDate = new Date(`${formData.date}T${formData.time}:00`);

            const payload = {
                nom: formData.nom,
                date: fullDate.toISOString(),
                lieu: formData.lieu,
                region_id: formData.region_id || null, // Empty string means null (National)
                description: formData.description
            };

            let error;
            if (event) {
                // Update
                const { error: err } = await supabase.from('evenements').update(payload).eq('id', event.id);
                error = err;
            } else {
                // Create
                const { error: err } = await supabase.from('evenements').insert(payload);
                error = err;
            }

            if (error) throw error;

            onUpdate();
            onClose();
        } catch (err: any) {
            console.error('Error saving event:', err);
            setError(err.message || "Erreur lors de l'enregistrement.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div style={{
                background: 'white', padding: '2rem', borderRadius: '0.5rem',
                width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', position: 'relative'
            }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    <X size={24} />
                </button>

                <h2 style={{ marginTop: 0 }}>{event ? 'Modifier l\'événement' : 'Nouvel événement'}</h2>

                {error && <div style={{ color: 'red', marginBottom: '1rem', padding: '0.5rem', background: '#ffebee', borderRadius: '4px' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                    <div>
                        <label className="label">Nom de l'événement *</label>
                        <input className="input" name="nom" value={formData.nom} onChange={handleChange} required />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label className="label">Date *</label>
                            <input type="date" className="input" name="date" value={formData.date} onChange={handleChange} required />
                        </div>
                        <div>
                            <label className="label">Heure *</label>
                            <input type="time" className="input" name="time" value={formData.time} onChange={handleChange} required />
                        </div>
                    </div>

                    <div>
                        <label className="label">Lieu</label>
                        <input className="input" name="lieu" value={formData.lieu} onChange={handleChange} placeholder="Ex: Paris, En ligne..." />
                    </div>

                    {userRole === 'admin' && (
                        <div>
                            <label className="label">Région</label>
                            <select className="input" name="region_id" value={formData.region_id} onChange={handleChange}>
                                <option value="">National (Tous)</option>
                                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                    )}

                    {/* Moderators are locked to their region usually, or allowed to post National? Let's assume locked or National if allowed. 
                         For simplicity, if role is moderator, we hide or freeze this if we want strict control, 
                         but the form init logic handles the default. Visual feedback: */}
                    {userRole === 'moderateur' && (
                        <div>
                            <label className="label">Région</label>
                            <div style={{ padding: '0.5rem', background: '#f5f5f5', borderRadius: '4px', color: '#666' }}>
                                {formData.region_id || 'National'}
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="label">Description</label>
                        <textarea className="input" name="description" value={formData.description} onChange={handleChange} rows={4} style={{ resize: 'vertical' }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" className="btn btn-outline" onClick={onClose} disabled={saving}>Annuler</button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'Enregistrement...' : <><Save size={18} style={{ marginRight: '0.5rem' }} /> Enregistrer</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
