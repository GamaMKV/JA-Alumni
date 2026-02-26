"use client";

import { useState, Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Save, Trash2, Shield, Mail, User, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import geoData from '@/lib/geoData';

type MemberManageModalProps = {
    isOpen: boolean;
    onClose: () => void;
    member: any;
    currentUser: any;
    onSuccess: () => void;
};

export default function MemberManageModal({ isOpen, onClose, member, currentUser, onSuccess }: MemberManageModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        first_name: member?.first_name || '',
        last_name: member?.last_name || '',
        email: member?.email || '',
        phone: member?.phone || '',
        birth_date: member?.birth_date || '',
        region: member?.region || '',
        department: member?.department || '',
        bio: member?.bio || '',
        linkedin_url: member?.linkedin_url || '',
        mini_ent_year: member?.mini_ent_year || '',
        mini_ent_name: member?.mini_ent_name || '',
        mini_ent_org: member?.mini_ent_org || '',
        mini_ent_school: member?.mini_ent_school || '',
        mini_ent_format: member?.mini_ent_format || '',
        role: member?.role || 'member',
        is_referent: member?.is_referent || false,
        copil_role: member?.copil_role || '',
        copil_start_year: member?.copil_start_year || ''
    });

    const isCopilPlus = currentUser?.role === 'copil_plus';
    const isCopil = currentUser?.role === 'copil';
    const isReferent = currentUser?.role === 'referent';

    const { regions, departments } = geoData;
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: (currentYear + 1) - 2000 + 1 }, (_, i) => (2000 + i).toString()).reverse();

    useEffect(() => {
        if (member) {
            setFormData({
                first_name: member.first_name || '',
                last_name: member.last_name || '',
                email: member.email || '',
                phone: member.phone || '',
                birth_date: member.birth_date || '',
                region: member.region || '',
                department: member.department || '',
                bio: member.bio || '',
                linkedin_url: member.linkedin_url || '',
                mini_ent_year: member.mini_ent_year || '',
                mini_ent_name: member.mini_ent_name || '',
                mini_ent_org: member.mini_ent_org || '',
                mini_ent_school: member.mini_ent_school || '',
                mini_ent_format: member.mini_ent_format || '',
                role: member.role || 'member',
                is_referent: member.is_referent || false,
                copil_role: member.copil_role || '',
                copil_start_year: member.copil_start_year || ''
            });
        }
    }, [member]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const updates: any = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                region: formData.region,
                department: formData.department,
                phone: formData.phone,
                birth_date: formData.birth_date,
                bio: formData.bio,
                linkedin_url: formData.linkedin_url,
                mini_ent_year: formData.mini_ent_year ? parseInt(formData.mini_ent_year.toString()) : null,
                mini_ent_name: formData.mini_ent_name,
                mini_ent_org: formData.mini_ent_org,
                mini_ent_school: formData.mini_ent_school,
                mini_ent_format: formData.mini_ent_format,
                updated_at: new Date().toISOString()
            };

            // Copil+ Specific updates
            if (isCopilPlus) {
                updates.role = formData.role;
                updates.email = formData.email;
                updates.is_referent = formData.is_referent;
                updates.copil_role = formData.copil_role;
                updates.copil_start_year = formData.copil_start_year;
            }

            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', member.id);

            if (error) throw error;
            onSuccess();
        } catch (error: any) {
            alert("Erreur lors de la mise à jour: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Êtes-vous sûr de vouloir supprimer définitivement le compte de ${member.first_name} ${member.last_name} ? Cette action est irréversible.`)) {
            return;
        }

        setLoading(true);
        try {
            // In Supabase, deleting from profiles will work if RLS allows it, 
            // but the Auth user will remain unless an Edge Function handles it.
            // We implement the client-side call.
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', member.id);

            if (error) throw error;
            onSuccess();
        } catch (error: any) {
            alert("Erreur lors de la suppression: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target as any;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const availableDepts = formData.region ? (departments as any)[formData.region] || [] : [];

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[100]" onClose={onClose}>
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
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all h-[90vh] flex flex-col">
                                <div className="flex justify-between items-center mb-6 shrink-0">
                                    <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-slate-900 flex items-center gap-2">
                                        <Shield size={20} className="text-[var(--color-primary-600)]" />
                                        Gérer le profil de {member?.first_name}
                                    </Dialog.Title>
                                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto pr-2 space-y-8 custom-scrollbar">
                                    {/* Section 1: Personal Info */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-slate-900 border-b pb-2">Informations Personnelles</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-700 mb-1">Prénom</label>
                                                <input name="first_name" value={formData.first_name} onChange={handleInputChange} className="input text-sm py-1.5" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-700 mb-1">Nom</label>
                                                <input name="last_name" value={formData.last_name} onChange={handleInputChange} className="input text-sm py-1.5" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
                                                <input
                                                    name="email"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    disabled={!isCopilPlus}
                                                    className="input text-sm py-1.5 disabled:bg-slate-50"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-700 mb-1">Téléphone</label>
                                                <input name="phone" value={formData.phone} onChange={handleInputChange} className="input text-sm py-1.5" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-700 mb-1">Date de naissance</label>
                                                <input name="birth_date" type="date" value={formData.birth_date} onChange={handleInputChange} className="input text-sm py-1.5" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-700 mb-1">URL LinkedIn</label>
                                                <input name="linkedin_url" value={formData.linkedin_url} onChange={handleInputChange} className="input text-sm py-1.5" placeholder="https://..." />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1">Biographie</label>
                                            <textarea name="bio" value={formData.bio} onChange={handleInputChange} className="input text-sm min-h-[60px]" />
                                        </div>
                                    </div>

                                    {/* Section 2: Localisation */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-slate-900 border-b pb-2">Localisation</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-700 mb-1">Région</label>
                                                <select name="region" value={formData.region} onChange={handleInputChange} className="input text-sm py-1.5">
                                                    <option value="">Sélectionner...</option>
                                                    {regions.map(r => <option key={r} value={r}>{r}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-700 mb-1">Département</label>
                                                <select name="department" value={formData.department} onChange={handleInputChange} className="input text-sm py-1.5" disabled={!formData.region}>
                                                    <option value="">Sélectionner...</option>
                                                    {availableDepts.map((d: string) => <option key={d} value={d}>{d}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 3: Mini-Entreprise */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-slate-900 border-b pb-2">Parcours Mini-Entreprise</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-700 mb-1">Année</label>
                                                <select name="mini_ent_year" value={formData.mini_ent_year} onChange={handleInputChange} className="input text-sm py-1.5">
                                                    <option value="">Sélectionner...</option>
                                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-700 mb-1">Organisation</label>
                                                <select name="mini_ent_org" value={formData.mini_ent_org} onChange={handleInputChange} className="input text-sm py-1.5">
                                                    <option value="">Sélectionner...</option>
                                                    <option value="EPA">EPA</option>
                                                    <option value="1000_ENT">1000 Entrepreneurs</option>
                                                    <option value="AUTRE">Autre</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-700 mb-1">Nom de la Mini</label>
                                                <input name="mini_ent_name" value={formData.mini_ent_name} onChange={handleInputChange} className="input text-sm py-1.5" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-700 mb-1">Établissement</label>
                                                <input name="mini_ent_school" value={formData.mini_ent_school} onChange={handleInputChange} className="input text-sm py-1.5" />
                                            </div>
                                        </div>

                                        {formData.mini_ent_org === 'EPA' && (
                                            <div>
                                                <label className="block text-xs font-medium text-slate-700 mb-1">Format</label>
                                                <select name="mini_ent_format" value={formData.mini_ent_format} onChange={handleInputChange} className="input text-sm py-1.5">
                                                    <option value="">Sélectionner...</option>
                                                    <option value="S">S (Short)</option>
                                                    <option value="M">M (Medium)</option>
                                                    <option value="L">L (Long)</option>
                                                    <option value="XL">XL (Extra Long)</option>
                                                </select>
                                            </div>
                                        )}
                                    </div>

                                    {/* Section 4: Admin Controls */}
                                    {isCopilPlus && (
                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                                            <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                                <Shield size={16} /> Privilèges & Rôles
                                            </h4>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-600 mb-1">Rôle Système</label>
                                                    <select name="role" value={formData.role} onChange={handleInputChange} className="input text-sm py-1.5">
                                                        <option value="member">Alumni</option>
                                                        <option value="referent">Référent</option>
                                                        <option value="copil">Copil</option>
                                                        <option value="copil_plus">Copil +</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-600 mb-1">Fonction Copil</label>
                                                    <input name="copil_role" value={formData.copil_role} onChange={handleInputChange} className="input text-sm py-1.5" />
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    id="is_referent_check"
                                                    name="is_referent"
                                                    checked={formData.is_referent}
                                                    onChange={handleInputChange}
                                                    className="rounded border-slate-300"
                                                />
                                                <label htmlFor="is_referent_check" className="text-xs font-medium text-slate-700">
                                                    Marquer comme référent régional
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8 flex justify-between items-center shrink-0 border-t pt-4">
                                    {isCopilPlus ? (
                                        <button
                                            onClick={handleDelete}
                                            disabled={loading}
                                            className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1 bg-red-50 px-3 py-2 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} /> Supprimer
                                        </button>
                                    ) : <div></div>}

                                    <div className="flex gap-3">
                                        <button onClick={onClose} className="btn-secondary">Annuler</button>
                                        <button
                                            onClick={handleSave}
                                            disabled={loading}
                                            className="btn-primary flex items-center gap-2 min-w-[140px] justify-center"
                                        >
                                            {loading ? '...' : <Save size={18} />}
                                            Enregistrer
                                        </button>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
