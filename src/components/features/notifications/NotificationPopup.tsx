"use client";

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { Bell, X } from 'lucide-react';

export default function NotificationPopup() {
    const { unreadNotifications, markAsRead } = useNotifications();
    const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);

    useEffect(() => {
        // Find the first unread notification that should be a popup
        const popupNotif = unreadNotifications.find(n => n.type === 'popup' || n.type === 'all');
        if (popupNotif) {
            // Check if we already showed one this session to avoid spamming
            const shownInSession = sessionStorage.getItem(`shown_notif_${popupNotif.id}`);
            if (!shownInSession) {
                setCurrentNotification(popupNotif);
            }
        } else {
            setCurrentNotification(null);
        }
    }, [unreadNotifications]);

    const handleClose = () => {
        if (currentNotification) {
            sessionStorage.setItem(`shown_notif_${currentNotification.id}`, 'true');
            markAsRead(currentNotification.id);
            setCurrentNotification(null);
        }
    };

    return (
        <Transition appear show={!!currentNotification} as={Fragment}>
            <Dialog as="div" className="relative z-[100]" onClose={handleClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
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
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-2xl transition-all border border-blue-100">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                        <Bell size={20} />
                                    </div>
                                    <button onClick={handleClose} className="p-1 rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>

                                <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-slate-900 mb-2">
                                    {currentNotification?.title || 'Rappel important'}
                                </Dialog.Title>

                                <div className="mt-2">
                                    <p className="text-slate-600 leading-relaxed">
                                        {currentNotification?.content}
                                    </p>
                                </div>

                                <div className="mt-8">
                                    <button
                                        type="button"
                                        className="w-full btn-primary py-3 rounded-xl font-bold"
                                        onClick={handleClose}
                                    >
                                        Compris !
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
