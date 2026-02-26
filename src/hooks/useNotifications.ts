"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export type Notification = {
    id: string;
    user_id: string;
    event_id: string | null;
    type: 'popup' | 'dashboard' | 'email' | 'all';
    title: string;
    content: string;
    is_read: boolean;
    created_at: string;
};

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setNotifications(data);
        }
        setLoading(false);
    };

    const markAsRead = async (id: string) => {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id);

        if (!error) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Subscribe to new notifications
        const channel = supabase
            .channel('notifications_changes')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications'
            }, () => {
                fetchNotifications();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return {
        notifications,
        unreadNotifications: notifications.filter(n => !n.is_read),
        loading,
        markAsRead,
        refresh: fetchNotifications
    };
}
