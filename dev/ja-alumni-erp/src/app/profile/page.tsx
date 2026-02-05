"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Mail, MapPin, Briefcase, Phone, Calendar, Save, X, Edit2, AlertTriangle, CheckSquare, Square } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Data: Regions and Departments
const REGIONS_DEPARTEMENTS: Record<string, string[]> = {
    'Auvergne-Rhône-Alpes': ['Ain', 'Allier', 'Ardèche', 'Cantal', 'Drôme', 'Isère', 'Loire', 'Haute-Loire', 'Puy-de-Dôme', 'Rhône', 'Savoie', 'Haute-Savoie'],
    'Bourgogne-Franche-Comté': ['Côte-d\'Or', 'Doubs', 'Jura', 'Nièvre', 'Haute-Saône', 'Saône-et-Loire', 'Yonne', 'Territoire de Belfort'],
    'Bretagne': ['Côtes-d\'Armor', 'Finistère', 'Ille-et-Vilaine', 'Morbihan'],
    'Centre-Val de Loire': ['Cher', 'Eure-et-Loir', 'Indre', 'Indre-et-Loire', 'Loir-et-Cher', 'Loiret'],
    'Corse': ['Corse-du-Sud', 'Haute-Corse'],
    'Grand Est': ['Ardennes', 'Aube', 'Marne', 'Haute-Marne', 'Meurthe-et-Moselle', 'Meuse', 'Moselle', 'Bas-Rhin', 'Haut-Rhin', 'Vosges'],
    'Hauts-de-France': ['Aisne', 'Nord', 'Oise', 'Pas-de-Calais', 'Somme'],
    'Île-de-France': ['Paris', 'Seine-et-Marne', 'Yvelines', 'Essonne', 'Hauts-de-Seine', 'Seine-Saint-Denis', 'Val-de-Marne', 'Val-d\'Oise'],
    'Normandie': ['Calvados', 'Eure', 'Manche', 'Orne', 'Seine-Maritime'],
    'Nouvelle-Aquitaine': ['Charente', 'Charente-Maritime', 'Corrèze', 'Creuse', 'Dordogne', 'Gironde', 'Landes', 'Lot-et-Garonne', 'Pyrénées-Atlantiques', 'Deux-Sèvres', 'Vienne', 'Haute-Vienne'],
    'Occitanie': ['Ariège', 'Aude', 'Aveyron', 'Gard', 'Haute-Garonne', 'Gers', 'Hérault', 'Lot', 'Lozère', 'Hautes-Pyrénées', 'Pyrénées-Orientales', 'Tarn', 'Tarn-et-Garonne'],
    'Pays de la Loire': ['Loire-Atlantique', 'Maine-et-Loire', 'Mayenne', 'Sarthe', 'Vendée'],
    'Provence-Alpes-Côte d\'Azur': ['Alpes-de-Haute-Provence', 'Hautes-Alpes', 'Alpes-Maritimes', 'Bouches-du-Rhône', 'Var', 'Vaucluse'],
    'Guadeloupe': ['Guadeloupe'],
    'Martinique': ['Martinique'],
    'Guyane': ['Guyane'],
    'La Réunion': ['La Réunion'],
    'Mayotte': ['Mayotte']
};

const REGIONS = Object.keys(REGIONS_DEPARTEMENTS);

// Component defined outside to prevent re-renders losing focus
const InfoRow = ({ icon: Icon, label, value, name, type = 'text', options, isEditing, onChange }: any) => {
    if (!isEditing) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 0', borderBottom: '1px solid #eee' }}>
                <div style={{ padding: '0.5rem', background: 'var(--color-primary-light)', borderRadius: '50%', color: 'var(--color-primary-dark)' }}>
                    <Icon size={20} />
                </div>
                <div>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>{label}</div>
                    <div style={{ fontWeight: 500 }}>{value instanceof Date ? value.toLocaleDateString() : value || 'Non renseigné'}</div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 0', borderBottom: '1px solid #eee' }}>
            <div style={{ padding: '0.5rem', background: 'var(--color-primary-light)', borderRadius: '50%', color: 'var(--color-primary-dark)' }}>
                <Icon size={20} />
            </div>
            <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.85rem', color: '#666', display: 'block', marginBottom: '0.2rem' }}>{label}</label>
                {type === 'select' ? (
                    <select
                        name={name}
                        value={value || ''}
                        onChange={onChange}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #ccc' }}
                    >
                        <option value="">Sélectionner...</option>
                        {options && options.map((opt: string) => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                ) : (
                    <input
                        type={type}
                        name={name}
                        value={value || ''}
                        onChange={onChange}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #ccc' }}
                    />
                )}
            </div>
        </div>
    );
};

export default function ProfilePage() {
    const [profile, setProfile] = useState<any>(null);
    const [originalProfile, setOriginalProfile] = useState<any>(null); // To revert changes
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [rgpdNeeded, setRgpdNeeded] = useState(false);

    const router = useRouter();

    useEffect(() => {
        const getProfile = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                router.push('/auth');
                return;
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (data) {
                setProfile(data);
                setOriginalProfile(data);

                // Check RGPD (2 YEARS)
                const lastRgpd = data.derniere_maj_rgpd ? new Date(data.derniere_maj_rgpd) : null;
                const twoYearsAgo = new Date();
                twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

                if (!data.consentement_rgpd || !lastRgpd || lastRgpd < twoYearsAgo) {
                    setRgpdNeeded(true);
                }
            }
            setLoading(false);
        };

        getProfile();
    }, [router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Special handling for Region change to reset Departement
        if (name === 'region') {
            setProfile((prev: any) => ({
                ...prev,
                [name]: value,
                departement: '' // Reset dept when region changes
            }));
        } else {
            setProfile((prev: any) => ({ ...prev, [name]: value }));
        }
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setProfile((prev: any) => ({ ...prev, [name]: checked }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setMessage(null);

        // Validation Client-side
        if (!profile.email || !profile.email.includes('@')) {
            setMessage({ type: 'error', text: "L'adresse email est invalide. Veuillez vérifier qu'elle contient un '@'." });
            setIsSaving(false);
            return;
        }

        if (!profile.prenom || !profile.nom) {
            setMessage({ type: 'error', text: "Le prénom et le nom sont obligatoires." });
            setIsSaving(false);
            return;
        }

        try {
            // 1. Sanitize Data
            const sanitizedUpdates = {
                ...profile,
                anniversaire: profile.anniversaire === '' ? null : profile.anniversaire,
                updated_at: new Date(),
                // Only update RGPD date if explicitly checked during this save, or preserve existing
                // Logic: if checked now, set NOW. Else, keep existing.
                derniere_maj_rgpd: profile.consentement_rgpd ? new Date() : profile.derniere_maj_rgpd
            };

            // Separate Email Update logic
            if (profile.email !== originalProfile.email) {
                const { error: emailError } = await supabase.auth.updateUser({ email: profile.email });
                if (emailError) throw emailError;
                setMessage({ type: 'success', text: 'Profil mis à jour. Un email de confirmation a été envoyé à votre nouvelle adresse.' });
            }

            const { error } = await supabase
                .from('profiles')
                .update(sanitizedUpdates)
                .eq('id', profile.id);

            if (error) throw error;

            setOriginalProfile(sanitizedUpdates);
            setProfile(sanitizedUpdates);
            setIsEditing(false);

            if (sanitizedUpdates.consentement_rgpd) {
                setRgpdNeeded(false);
            }

            if (!message) setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });

        } catch (error: any) {
            console.error('Error updating profile:', error);
            let userMessage = error.message || 'Une erreur est survenue lors de la mise à jour.';
            if (error.code === '22007') {
                userMessage = "Format de date invalide. Veuillez vérifier votre date d'anniversaire.";
            }
            setMessage({ type: 'error', text: userMessage });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action sera effective dans 7 jours.")) return;

        try {
            // Calculate date + 7 days
            const deletionDate = new Date();
            deletionDate.setDate(deletionDate.getDate() + 7);

            const { error } = await supabase
                .from('profiles')
                .update({ deletion_scheduled_at: deletionDate })
                .eq('id', profile.id);

            if (error) throw error;

            setProfile({ ...profile, deletion_scheduled_at: deletionDate });
            setMessage({ type: 'success', text: `Votre compte sera supprimé le ${deletionDate.toLocaleDateString()}.` });

        } catch (error: any) {
            console.error(error);
            setMessage({ type: 'error', text: "Erreur lors de la demande de suppression." });
        }
    };

    const handleCancelDelete = async () => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ deletion_scheduled_at: null })
                .eq('id', profile.id);

            if (error) throw error;

            setProfile({ ...profile, deletion_scheduled_at: null });
            setMessage({ type: 'success', text: "La suppression de votre compte a été annulée." });

        } catch (error: any) {
            console.error(error);
            setMessage({ type: 'error', text: "Erreur lors de l'annulation." });
        }
    };

    const handleCancel = () => {
        setProfile(originalProfile);
        setIsEditing(false);
        setMessage(null);
    };

    // Calculate available departments based on current selected region
    const availableDepartements = profile?.region ? REGIONS_DEPARTEMENTS[profile.region] || [] : [];

    if (loading) return <div className="container" style={{ padding: '2rem' }}>Chargement...</div>;
    if (!profile) return <div className="container" style={{ padding: '2rem' }}>Profil introuvable.</div>;

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Mon Profil</h1>
                {/* Header Actions */}
                <div>
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <Edit2 size={18} /> Modifier
                        </button>
                    ) : (
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={handleCancel}
                                style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #ccc', background: 'white' }}
                            >
                                <X size={18} /> Annuler
                            </button>
                            <button
                                onClick={handleSave}
                                className="btn-primary"
                                disabled={isSaving}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                {isSaving ? 'Enregistrement...' : <><Save size={18} /> Enregistrer</>}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {message && (
                <div style={{
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    marginBottom: '1rem',
                    background: message.type === 'success' ? '#d4edda' : '#f8d7da',
                    color: message.type === 'success' ? '#155724' : '#721c24',
                    border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
                }}>
                    {message.text}
                </div>
            )}

            {/* Account Deletion Warning */}
            {profile.deletion_scheduled_at && !message && (
                <div style={{
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    marginBottom: '1rem',
                    background: '#f8d7da',
                    color: '#721c24',
                    border: '1px solid #f5c6cb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <AlertTriangle size={24} />
                        <div>
                            <strong>Attention :</strong> Votre compte sera définitivement supprimé le {new Date(profile.deletion_scheduled_at).toLocaleDateString()}.
                        </div>
                    </div>
                    <button
                        onClick={handleCancelDelete}
                        style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', background: 'white', border: '1px solid #721c24', color: '#721c24', cursor: 'pointer' }}
                    >
                        Annuler la suppression
                    </button>
                </div>
            )}

            {rgpdNeeded && !message && (
                <div style={{
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    marginBottom: '1rem',
                    background: '#fff3cd',
                    color: '#856404',
                    border: '1px solid #ffeeba',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <AlertTriangle size={24} />
                    <div>
                        <strong>Action requise :</strong> Votre consentement RGPD a expiré (validité 2 ans). Veuillez le renouveler.
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                {/* ID Card */}
                <div className="card" style={{ textAlign: 'center', height: 'fit-content' }}>
                    <div style={{
                        width: '100px', height: '100px', background: 'var(--color-primary)',
                        borderRadius: '50%', margin: '0 auto 1rem', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem'
                    }}>
                        {profile.prenom?.[0]}{profile.nom?.[0]}
                    </div>

                    {isEditing ? (
                        <div style={{ marginBottom: '1rem' }}>
                            <input
                                name="prenom"
                                placeholder="Prénom"
                                value={profile.prenom || ''}
                                onChange={handleInputChange}
                                style={{ display: 'block', width: '100%', marginBottom: '0.5rem', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #ccc' }}
                            />
                            <input
                                name="nom"
                                placeholder="Nom"
                                value={profile.nom || ''}
                                onChange={handleInputChange}
                                style={{ display: 'block', width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #ccc' }}
                            />
                            <input
                                name="situation"
                                placeholder="Situation (ex: Étudiant)"
                                value={profile.situation || ''}
                                onChange={handleInputChange}
                                style={{ display: 'block', width: '100%', marginTop: '0.5rem', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #ccc' }}
                            />
                        </div>
                    ) : (
                        <>
                            <h2>{profile.prenom} {profile.nom}</h2>
                            <p style={{ color: '#666', marginBottom: '1rem' }}>{profile.situation || 'Membre JA Alumni'}</p>
                        </>
                    )}

                    <div style={{
                        display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '1rem',
                        background: profile.statut === 'admin' ? 'var(--color-primary)' : '#eee',
                        color: profile.statut === 'admin' ? 'white' : '#333',
                        fontSize: '0.9rem', marginBottom: '1rem'
                    }}>
                        Role: {profile.statut ? profile.statut.toUpperCase() : 'MEMBRE'}
                    </div>

                    {profile.statut !== 'admin' && (
                        <div style={{ fontSize: '0.8rem', color: 'orange', border: '1px solid orange', padding: '0.5rem', borderRadius: '0.5rem' }}>
                            Si vous devriez être admin, contactez le support ou vérifiez votre configuration.
                        </div>
                    )}
                </div>

                {/* Details */}
                <div className="card">
                    <h3>Informations Personnelles</h3>
                    <InfoRow icon={Mail} label="Email" value={profile.email} name="email" type="email" isEditing={isEditing} onChange={handleInputChange} />
                    <InfoRow icon={Phone} label="Téléphone" value={profile.telephone} name="telephone" isEditing={isEditing} onChange={handleInputChange} />

                    <InfoRow
                        icon={MapPin}
                        label="Région"
                        value={profile.region}
                        name="region"
                        type="select"
                        options={REGIONS}
                        isEditing={isEditing}
                        onChange={handleInputChange}
                    />

                    <InfoRow
                        icon={MapPin}
                        label="Département"
                        value={profile.departement}
                        name="departement"
                        type={isEditing ? "select" : "text"} // Switch to select when editing
                        options={availableDepartements}
                        isEditing={isEditing}
                        onChange={handleInputChange}
                    />

                    <InfoRow icon={Briefcase} label="Secteur d'activité" value={profile.secteur} name="secteur" isEditing={isEditing} onChange={handleInputChange} />
                    <InfoRow icon={Calendar} label="Date d'anniversaire" value={profile.anniversaire} name="anniversaire" type="date" isEditing={isEditing} onChange={handleInputChange} />

                    {/* RGPD Section */}
                    <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                            <div style={{ paddingTop: '0.25rem' }}>
                                {profile.consentement_rgpd ?
                                    <CheckSquare size={20} color="green" /> :
                                    <Square size={20} color={rgpdNeeded ? "red" : "gray"} />
                                }
                            </div>
                            <div>
                                <h4 style={{ margin: '0 0 0.5rem 0' }}>Consentement RGPD</h4>
                                {isEditing ? (
                                    <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', cursor: 'pointer', background: rgpdNeeded ? '#fff3cd' : 'transparent', padding: '0.5rem', borderRadius: '0.5rem' }}>
                                        <input
                                            type="checkbox"
                                            name="consentement_rgpd"
                                            checked={profile.consentement_rgpd || false}
                                            onChange={handleCheckboxChange}
                                        />
                                        <span>J&apos;accepte que mes données soient traitées dans le cadre de l&apos;association JA Alumni.</span>
                                    </label>
                                ) : (
                                    <p style={{ fontSize: '0.9rem', color: '#666' }}>
                                        {profile.consentement_rgpd
                                            ? `Accepté le ${new Date(profile.derniere_maj_rgpd).toLocaleDateString()}`
                                            : "Non accepté"}
                                    </p>
                                )}
                                <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                                    <a href="/rgpd" target="_blank" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>Lire notre politique de confidentialité (RGPD)</a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Zone de Danger (Suppression) */}
                    <div style={{ marginTop: '3rem', paddingTop: '1rem', borderTop: '1px solid #faa' }}>
                        <h4 style={{ color: '#d9534f' }}>Zone de Danger</h4>
                        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                            Vous pouvez demander la suppression de votre compte. Elle sera effective dans 7 jours.
                        </p>
                        {!profile.deletion_scheduled_at ? (
                            <button
                                onClick={handleDeleteAccount}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.5rem',
                                    background: '#fff5f5',
                                    border: '1px solid #d9534f',
                                    color: '#d9534f',
                                    cursor: 'pointer'
                                }}
                            >
                                Supprimer mon compte
                            </button>
                        ) : (
                            <div style={{ color: '#d9534f', fontSize: '0.9rem' }}>
                                <em>Une demande de suppression est déjà en cours.</em>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
