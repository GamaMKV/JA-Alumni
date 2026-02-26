"use client";

import { useNotifications } from '@/hooks/useNotifications';
import { Bell, BellOff, Check, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function NotificationWidget() {
    const { notifications, unreadNotifications, markAsRead, loading } = useNotifications();

    if (loading) return (
        <div className="glass-card animate-pulse">
            <div className="h-6 w-32 bg-slate-200 rounded mb-4"></div>
            <div className="space-y-3">
                <div className="h-16 bg-slate-100 rounded"></div>
                <div className="h-16 bg-slate-100 rounded"></div>
            </div>
        </div>
    );

    return (
        <div className="glass-card flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Bell size={20} className="text-[var(--color-primary-600)]" />
                    Notifications
                </h2>
                {unreadNotifications.length > 0 && (
                    <span className="px-2 py-0.5 bg-[var(--color-primary-600)] text-white text-[10px] font-bold rounded-full">
                        {unreadNotifications.length} nouvelles
                    </span>
                )}
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar flex-1">
                {notifications.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                        <BellOff className="mx-auto mb-2 opacity-20" size={32} />
                        <p className="text-sm">Aucune notification pour le moment.</p>
                    </div>
                ) : (
                    notifications.map((notif) => (
                        <div
                            key={notif.id}
                            className={`p-3 rounded-lg border transition-all relative group ${notif.is_read
                                    ? 'bg-white border-slate-100 opacity-60'
                                    : 'bg-blue-50/50 border-blue-100 shadow-sm'
                                }`}
                        >
                            {!notif.is_read && (
                                <button
                                    onClick={() => markAsRead(notif.id)}
                                    className="absolute top-2 right-2 p-1 rounded-full hover:bg-blue-100 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Marquer comme lu"
                                >
                                    <Check size={14} />
                                </button>
                            )}
                            <h4 className={`text-sm font-bold ${notif.is_read ? 'text-slate-700' : 'text-blue-900'}`}>
                                {notif.title}
                            </h4>
                            <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                                {notif.content}
                            </p>
                            <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400">
                                <Clock size={10} />
                                {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: fr })}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
