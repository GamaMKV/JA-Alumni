"use client";

import { Fragment, useState, useEffect, useCallback } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Calendar, MapPin, Clock, UserCheck, Users, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import EventModal from './EventModal';

type EventDetailsProps = {
    isOpen: boolean;
    eventId: string;
    onClose: () => void;
    currentUserId: string;
    userRole: string;
    userRegion: string;
    onUpdate: () => void;
};

type EventData = {
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

export default function EventDetails({ isOpen, eventId, onClose, currentUserId, userRole, userRegion, onUpdate }: EventDetailsProps) {
    const [event, setEvent] = useState<EventData | null>(null);
    const [loading, setLoading] = useState(true);
    const [participating, setParticipating] = useState(false);
    const [pLoading, setPLoading] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchDetails = useCallback(async () => {
        if (!eventId) return; // Add check inside since it's now called from outside useEffect

        setLoading(true);
        const { data: eventData } = await supabase
            .from('events')
            .select('*')
            .eq('id', eventId)
            .single();

        if (eventData) setEvent(eventData);

        const { data: participation } = await supabase
            .from('participations')
            .select('*')
            .eq('event_id', eventId)
            .eq('user_id', currentUserId)
            .single();

        setParticipating(!!participation);
        setLoading(false);
    }, [eventId, currentUserId]);

    useEffect(() => {
        if (isOpen) fetchDetails();
    }, [isOpen, fetchDetails]);

    const toggleParticipation = async () => {
        setPLoading(true);
        try {
            if (participating) {
                await supabase.from('participations').delete().eq('event_id', eventId).eq('user_id', currentUserId);
                setParticipating(false);
            } else {
                await supabase.from('participations').insert({ event_id: eventId, user_id: currentUserId, status: 'registered' });
                setParticipating(true);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setPLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) return;
        setActionLoading(true);
        await supabase.from('events').delete().eq('id', eventId);
        setActionLoading(false);
        onUpdate();
        onClose();
    };

    // Permission Logic
    const canManage = event && (
        ['copil', 'copil_plus'].includes(userRole) ||  // Copil+ can manage everything
        (userRole === 'referent' && event.region === userRegion) // Referent restricted to own region
    );

    return (
        <>
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
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
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
                                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                                    {loading || !event ? (
                                        <div className="p-12 text-center text-slate-500">Chargement...</div>
                                    ) : (
                                        <>
                                            {/* Cover Image Header */}
                                            <div className="h-48 bg-slate-100 relative group">
                                                {event.cover_image_url ? (
                                                    <img src={event.cover_image_url} alt={event.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                                                        <Calendar className="text-slate-300 w-16 h-16" />
                                                    </div>
                                                )}

                                                {/* Action Buttons */}
                                                <div className="absolute top-4 right-4 flex gap-2">
                                                    {canManage && (
                                                        <>
                                                            <button
                                                                onClick={() => handleDelete()}
                                                                disabled={actionLoading}
                                                                className="bg-white/90 text-red-500 hover:text-red-600 p-2 rounded-full shadow-sm hover:bg-white transition-all backdrop-blur"
                                                                title="Supprimer"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => setShowEditModal(true)}
                                                                className="bg-white/90 text-slate-700 hover:text-[var(--color-primary-600)] p-2 rounded-full shadow-sm hover:bg-white transition-all backdrop-blur"
                                                                title="Modifier"
                                                            >
                                                                <Edit size={18} />
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={onClose}
                                                        className="bg-white/90 text-slate-700 hover:text-slate-900 p-2 rounded-full shadow-sm hover:bg-white transition-all backdrop-blur"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </div>

                                                <div className="absolute bottom-4 left-4 flex gap-2">
                                                    {event.scope === 'national' && (
                                                        <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                                                            National
                                                        </span>
                                                    )}
                                                    <span className="bg-white/90 backdrop-blur text-slate-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                                                        {event.region}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p-6">
                                                <h2 className="text-2xl font-bold text-slate-900 mb-2">{event.title}</h2>

                                                <div className="flex flex-col md:flex-row gap-6 mt-6 mb-8">
                                                    <div className="flex-1 space-y-4">
                                                        <div className="flex items-start gap-3 text-slate-600">
                                                            <Clock className="w-5 h-5 text-[var(--color-primary-500)] mt-0.5" />
                                                            <div>
                                                                <p className="font-medium text-slate-900">
                                                                    {format(parseISO(event.date_start), 'd MMMM yyyy', { locale: fr })}
                                                                </p>
                                                                <p className="text-sm">
                                                                    {format(parseISO(event.date_start), 'HH:mm', { locale: fr })} - {format(parseISO(event.date_end), 'HH:mm', { locale: fr })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-start gap-3 text-slate-600">
                                                            <MapPin className="w-5 h-5 text-[var(--color-primary-500)] mt-0.5" />
                                                            <div>
                                                                <p className="font-medium text-slate-900">{event.location_name}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-100">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div className="flex items-center gap-2 text-slate-900 font-medium">
                                                                <Users size={18} />
                                                                <span>Participation</span>
                                                            </div>
                                                            {participating ? (
                                                                <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold uppercase flex items-center gap-1">
                                                                    <UserCheck size={14} /> Inscrit
                                                                </span>
                                                            ) : (
                                                                <span className="text-slate-500 bg-slate-100 px-2 py-1 rounded text-xs font-bold uppercase">
                                                                    Non inscrit
                                                                </span>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={toggleParticipation}
                                                            disabled={pLoading}
                                                            className={`w-full py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2
                                                                ${participating
                                                                    ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                                                                    : 'bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)] shadow-md hover:shadow-lg translate-y-0 hover:-translate-y-0.5'}
                                                            `}
                                                        >
                                                            {pLoading ? 'Traitement...' : participating ? 'Se désinscrire' : 'Je participe !'}
                                                        </button>
                                                    </div>
                                                </div>

                                                {event.description && (
                                                    <div className="border-t border-slate-100 pt-6">
                                                        <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                                                            <AlertCircle size={18} /> À propos
                                                        </h3>
                                                        <div className="prose prose-sm text-slate-600 max-w-none">
                                                            <p className="whitespace-pre-wrap">{event.description}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Nested Edit Modal */}
            {event && (
                <EventModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    onSuccess={() => {
                        fetchDetails(); // Refresh details
                        onUpdate(); // Refresh parent list
                    }}
                    userRegion={userRegion}
                    canCreateNational={['copil', 'copil_plus'].includes(userRole)}
                    eventToEdit={event} // Pass current event data
                />
            )}
        </>
    );
}
