"use client";

import EventList from '@/components/events/EventList';

export default function EventsPage() {
    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <h1 style={{ marginBottom: '2rem' }}>Événements</h1>
            <p style={{ marginBottom: '2rem', color: '#666' }}>
                Découvrez les événements à venir et inscrivez-vous pour participer.
            </p>
            <EventList />
        </div>
    );
}
