"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Avatar from '@/components/ui/Avatar';
import { Save, User, MapPin, Briefcase, Phone, Mail, Calendar, Loader, Camera, AlertTriangle } from 'lucide-react';
import geoData from '@/lib/geoData';

const { regions, departments } = geoData;

export default function ProfilePage() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: (currentYear + 1) - 2000 + 1 }, (_, i) => (2000 + i).toString()).reverse();
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const router = useRouter();

    useEffect(() => {
        const getProfile = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/auth/login');
                return;
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (error) console.error(error);
            setProfile(data);
            setLoading(false);
        };
        getProfile();
    }, [router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'region') {
            setProfile((p: any) => ({ ...p, region: value, department: '' }));
        } else {
            setProfile((p: any) => ({ ...p, [name]: value }));
        }
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('Sélectionnez une image.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${profile.id}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get URL
            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

            // Update local state (will be saved on "Enregistrer" or separate call? Let's save immediately for Avatar)
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', profile.id);

            if (updateError) throw updateError;

            setProfile((p: any) => ({ ...p, avatar_url: publicUrl }));
            setMessage({ type: 'success', text: "Avatar mis à jour !" });

        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    first_name: profile.first_name,
                    last_name: profile.last_name,
                    phone: profile.phone,
                    birth_date: profile.birth_date,
                    region: profile.region,
                    department: profile.department,
                    bio: profile.bio,
                    linkedin_url: profile.linkedin_url,

                    // Mini-Entreprise
                    mini_ent_year: profile.mini_ent_year ? parseInt(profile.mini_ent_year) : null,
                    mini_ent_org: profile.mini_ent_org,
                    mini_ent_format: profile.mini_ent_format,
                    mini_ent_name: profile.mini_ent_name,
                    mini_ent_school: profile.mini_ent_school,

                    updated_at: new Date().toISOString()
                })
                .eq('id', profile.id);

            if (error) throw error;
            setMessage({ type: 'success', text: "Profil mis à jour avec succès." });

        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader className="animate-spin text-slate-400" /></div>;

    // Handle missing profile (e.g. registration error)
    if (!profile) return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
            <div className="bg-orange-50 p-8 rounded-xl border border-orange-100 max-w-md">
                <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-900 mb-2">Profil incomplet</h2>
                <p className="text-slate-600 mb-6">
                    Votre compte utilisateur existe, mais votre profil membre n&apos;a pas été créé correctement.
                </p>
                <button
                    onClick={async () => {
                        setLoading(true);
                        const { data: { session } } = await supabase.auth.getSession();
                        if (session) {
                            const { error } = await supabase.from('profiles').insert({
                                id: session.user.id,
                                email: session.user.email,
                                first_name: session.user.user_metadata.firstName || 'Sans nom',
                                last_name: session.user.user_metadata.lastName || '',
                                role: 'member',
                                updated_at: new Date().toISOString()
                            });
                            if (error) {
                                alert("Erreur: " + error.message);
                            } else {
                                window.location.reload();
                            }
                        }
                        setLoading(false);
                    }}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                >
                    <Save size={18} /> Initialiser mon profil
                </button>
            </div>
        </div>
    );

    const availableDepts = profile.region ? departments[profile.region] || [] : [];

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">Mon Profil</h1>

            {message && (
                <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Avatar & Basic Info */}
                <div className="glass-card flex flex-col items-center text-center h-fit">
                    <div className="relative mb-4 group">
                        <Avatar
                            url={profile.avatar_url}
                            firstName={profile.first_name}
                            lastName={profile.last_name}
                            size={120}
                            className="shadow-md"
                        />
                        {/* Only allow upload for privileged roles */}
                        {['admin', 'moderator', 'copil', 'referent'].includes(profile.role) && (
                            <>
                                <label
                                    htmlFor="avatar-upload"
                                    className="absolute bottom-0 right-0 bg-[var(--color-primary-600)] text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-[var(--color-primary-700)] transition-colors"
                                    title="Modifier la photo"
                                >
                                    {uploading ? <Loader size={16} className="animate-spin" /> : <Camera size={16} />}
                                </label>
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarUpload}
                                    disabled={uploading}
                                />
                            </>
                        )}
                    </div>

                    <h2 className="text-xl font-bold text-slate-900">{profile.first_name} {profile.last_name}</h2>
                    <p className="text-slate-500 mb-4 capitalize">
                        {profile.role === 'member' ? 'Alumni' : profile.role}
                    </p>

                    {/* DEBUG MODE FOR ADMIN/SPECIFIC USER */}
                    {profile.email === 'mroberdeau.pro@gmail.com' && (
                        <div className="mb-4 w-full bg-red-50 p-3 rounded-lg border border-red-200">
                            <h4 className="text-xs font-bold text-red-700 uppercase mb-2">Debug Mode</h4>
                            <select
                                value={profile.role}
                                onChange={async (e) => {
                                    const newRole = e.target.value;
                                    setProfile({ ...profile, role: newRole });
                                    await supabase.from('profiles').update({ role: newRole }).eq('id', profile.id);
                                    window.location.reload();
                                }}
                                className="w-full text-xs p-1 rounded border border-red-300"
                            >
                                <option value="member">Alumni (Member)</option>
                                <option value="referent">Référent</option>
                                <option value="copil">Copil</option>
                                <option value="copil_plus">Copil +</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    )}

                    <div className="w-full border-t border-slate-100 pt-4 text-left space-y-3">
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                            <Mail size={16} className="text-slate-400" />
                            <span>{profile.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                            <Calendar size={16} className="text-slate-400" />
                            <span>Né(e) le {profile.birth_date ? new Date(profile.birth_date).toLocaleDateString() : 'Non renseigné'}</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Edit Form */}
                <div className="glass-card lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <User size={20} className="text-[var(--color-primary-600)]" />
                            Informations Personnelles
                        </h3>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Prénom</label>
                                <input name="first_name" value={profile.first_name || ''} onChange={handleInputChange} className="input" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
                                <input name="last_name" value={profile.last_name || ''} onChange={handleInputChange} className="input" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Phone size={16} /></div>
                                    <input name="phone" value={profile.phone || ''} onChange={handleInputChange} className="input pl-10" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Profil LinkedIn (URL)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Briefcase size={16} /></div>
                                    <input name="linkedin_url" value={profile.linkedin_url || ''} onChange={handleInputChange} className="input pl-10" placeholder="https://linkedin.com/in/..." />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Biographie</label>
                            <textarea
                                name="bio"
                                value={profile.bio || ''}
                                onChange={handleInputChange}
                                className="input min-h-[100px]"
                                placeholder="Parlez-nous de vous..."
                            />
                        </div>



                        <div className="border-t border-slate-100 pt-6">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                                <Briefcase size={20} className="text-[var(--color-primary-600)]" />
                                Expérience Mini-Entreprise
                            </h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Année de participation</label>
                                        <select name="mini_ent_year" value={profile.mini_ent_year || ''} onChange={handleInputChange} className="input">
                                            <option value="">Sélectionner...</option>
                                            {years.map((y) => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Organisation</label>
                                        <select name="mini_ent_org" value={profile.mini_ent_org || ''} onChange={handleInputChange} className="input">
                                            <option value="">Sélectionner...</option>
                                            <option value="EPA">EPA (Entreprendre Pour Apprendre)</option>
                                            <option value="1000_ENT">1000 Entrepreneurs</option>
                                            <option value="AUTRE">Autre</option>
                                        </select>
                                    </div>
                                </div>

                                {profile.mini_ent_org === 'EPA' && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Format</label>
                                        <select name="mini_ent_format" value={profile.mini_ent_format || ''} onChange={handleInputChange} className="input">
                                            <option value="">Sélectionner...</option>
                                            <option value="S">S (Short)</option>
                                            <option value="M">M (Medium)</option>
                                            <option value="L">L (Long)</option>
                                            <option value="XL">XL (Extra Long)</option>
                                        </select>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Nom de la Mini-Entreprise</label>
                                        <input name="mini_ent_name" value={profile.mini_ent_name || ''} onChange={handleInputChange} className="input" placeholder="Ex: EcoBag" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Etablissement / Ville</label>
                                        <input name="mini_ent_school" value={profile.mini_ent_school || ''} onChange={handleInputChange} className="input" placeholder="Ex: Lycée Victor Hugo" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-6">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                                <MapPin size={20} className="text-[var(--color-primary-600)]" />
                                Localisation
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Région</label>
                                    <select name="region" value={profile.region || ''} onChange={handleInputChange} className="input">
                                        <option value="">Sélectionner...</option>
                                        {regions.map((r: string) => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Département</label>
                                    <select name="department" value={profile.department || ''} onChange={handleInputChange} className="input" disabled={!profile.region}>
                                        <option value="">Sélectionner...</option>
                                        {availableDepts.map((d: string) => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 flex justify-end">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="btn-primary flex items-center gap-2 px-6"
                            >
                                {saving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                                Enregistrer les modifications
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
