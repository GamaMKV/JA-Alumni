"use client";

import { useState, Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Calendar, MapPin, AlignLeft, Image as ImageIcon, Map } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import geoData from '@/lib/geoData';

type EventModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userRegion: string;
    canCreateNational: boolean;
    eventToEdit?: any; // New prop for editing
};

export default function EventModal({ isOpen, onClose, onSuccess, userRegion, canCreateNational, eventToEdit }: EventModalProps) {
    const [loading, setLoading] = useState(false);
    const { regions } = geoData;

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date_start: '',
        date_end: '',
        location_name: '',
        scope: 'regional', // default
        region: userRegion, // default to user's region
        cover_image_url: ''
    });

    // Load initial data if editing
    useEffect(() => {
        if (eventToEdit) {
            setFormData({
                title: eventToEdit.title,
                description: eventToEdit.description || '',
                date_start: eventToEdit.date_start ? new Date(eventToEdit.date_start).toISOString().slice(0, 16) : '',
                date_end: eventToEdit.date_end ? new Date(eventToEdit.date_end).toISOString().slice(0, 16) : '',
                location_name: eventToEdit.location_name || '',
                scope: eventToEdit.scope || 'regional',
                region: eventToEdit.region || userRegion,
                cover_image_url: eventToEdit.cover_image_url || ''
            });
        }
    }, [eventToEdit, userRegion]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validation
            if (!formData.title || !formData.date_start || !formData.date_end) {
                alert("Veuillez remplir les champs obligatoires.");
                setLoading(false);
                return;
            }

            const payload = {
                title: formData.title,
                description: formData.description,
                date_start: new Date(formData.date_start).toISOString(),
                date_end: new Date(formData.date_end).toISOString(),
                location_name: formData.location_name,
                scope: formData.scope,
                region: formData.scope === 'national' ? null : formData.region,
                cover_image_url: formData.cover_image_url
            };

            let error;
            if (eventToEdit) {
                // UPDATE
                const { error: updateError } = await supabase
                    .from('events')
                    .update(payload)
                    .eq('id', eventToEdit.id);
                error = updateError;
            } else {
                // INSERT
                const { error: insertError } = await supabase
                    .from('events')
                    .insert([payload]);
                error = insertError;
            }

            if (error) throw error;

            onSuccess();
            onClose();
            // Reset form only if creating new
            if (!eventToEdit) {
                setFormData({
                    title: '',
                    description: '',
                    date_start: '',
                    date_end: '',
                    location_name: '',
                    scope: 'regional',
                    region: userRegion,
                    cover_image_url: ''
                });
            }

        } catch (error: any) {
            console.error('Error saving event:', error);
            alert("Erreur lors de la sauvegarde: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <div className="flex justify-between items-center mb-6">
                                    <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-slate-900">
                                        {eventToEdit ? 'Modifier l\'événement' : 'Créer un événement'}
                                    </Dialog.Title>
                                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Scope & Region Selection */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Portée de l&apos;événement</label>
                                            <select
                                                name="scope"
                                                value={formData.scope}
                                                onChange={handleChange}
                                                className="input"
                                                disabled={!canCreateNational} // Only COPIL can change this
                                            >
                                                <option value="regional">Régional</option>
                                                {canCreateNational && <option value="national">National</option>}
                                            </select>
                                        </div>

                                        {formData.scope === 'regional' && (
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Région cible</label>
                                                <select
                                                    name="region"
                                                    value={formData.region}
                                                    onChange={handleChange}
                                                    className="input"
                                                    disabled={!canCreateNational} // Referents are locked to their region
                                                >
                                                    {regions.map(r => (
                                                        <option key={r} value={r}>{r}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>

                                    {/* Event Details */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Titre de l&apos;événement *</label>
                                        <input
                                            name="title"
                                            required
                                            value={formData.title}
                                            onChange={handleChange}
                                            className="input"
                                            placeholder="Ex: Afterwork de rentrée"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Début *</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-3 text-slate-400" size={16} />
                                                <input
                                                    type="datetime-local"
                                                    name="date_start"
                                                    required
                                                    value={formData.date_start}
                                                    onChange={handleChange}
                                                    className="input pl-10"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Fin *</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-3 text-slate-400" size={16} />
                                                <input
                                                    type="datetime-local"
                                                    name="date_end"
                                                    required
                                                    value={formData.date_end}
                                                    onChange={handleChange}
                                                    className="input pl-10"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Lieu</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 text-slate-400" size={16} />
                                            <input
                                                name="location_name"
                                                value={formData.location_name}
                                                onChange={handleChange}
                                                className="input pl-10"
                                                placeholder="Ex: Le Café Populaire, Paris"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            className="input min-h-[100px]"
                                            placeholder="Détails de l'événement..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Image de couverture (URL)</label>
                                        <div className="relative">
                                            <ImageIcon className="absolute left-3 top-3 text-slate-400" size={16} />
                                            <input
                                                name="cover_image_url"
                                                value={formData.cover_image_url}
                                                onChange={handleChange}
                                                className="input pl-10"
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="btn-secondary"
                                            disabled={loading}
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn-primary"
                                            disabled={loading}
                                        >
                                            {loading ? 'Sauvegarde...' : (eventToEdit ? 'Modifier' : 'Créer l\'événement')}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
