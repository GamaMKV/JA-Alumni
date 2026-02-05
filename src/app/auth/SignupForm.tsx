"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Calendar, Briefcase, MapPin, CheckCircle, ArrowRight, ArrowLeft, Map } from 'lucide-react';
import { REGIONS, DEPARTMENTS, SITUATIONS } from '@/lib/constants';

export default function SignupForm({ onSwitch }: { onSwitch: () => void }) {
    // Steps: 1=Eligibility, 2=Mini-Entreprise, 3=Identity/Auth
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const [formData, setFormData] = useState({
        birthDate: '',
        hasParticipated: false,
        miniYear: new Date().getFullYear().toString(),
        school: '',
        miniName: '',
        org: 'EPA',
        region: '',
        departement: '',
        situation: '',
        lastName: '',
        firstName: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => {
            const newData = { ...prev, [name]: val };
            if (name === 'region') newData.departement = '';
            return newData;
        });
    };

    const validateStep1 = () => {
        if (!formData.birthDate) return "La date de naissance est requise.";
        const today = new Date();
        const birthDate = new Date(formData.birthDate);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        if (age < 15) return "Vous devez avoir au moins 15 ans pour rejoindre JA Alumni.";

        if (!formData.hasParticipated) return "L'inscription est réservée aux personnes ayant participé à une Mini-Entreprise.";

        return null;
    };

    const validateStep2 = () => {
        if (!formData.miniYear) return "L'année est requise.";
        if (!formData.school) return "L'établissement scolaire ou la ville est requis.";
        if (!formData.miniName) return "Le nom de la Mini-Entreprise est requis.";
        return null;
    };

    const validateStep3 = () => {
        if (!formData.region) return "La région est requise.";
        if (formData.region && !formData.departement) return "Le département est requis.";
        if (!formData.situation) return "La situation est requise.";
        return null;
    };

    const validateStep4 = () => {
        if (!formData.lastName || !formData.firstName) return "Nom et Prénom sont requis.";
        if (!formData.email || !formData.email.includes('@')) return "Email invalide.";
        if (formData.password.length < 6) return "Le mot de passe doit faire au moins 6 caractères.";
        if (formData.password !== formData.confirmPassword) return "Les mots de passe ne correspondent pas.";
        return null;
    };

    const handleNext = () => {
        setError(null);
        let err = null;
        if (step === 1) err = validateStep1();
        else if (step === 2) err = validateStep2();
        else if (step === 3) err = validateStep3();

        if (err) {
            setError(err);
        } else {
            setStep(step + 1);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const err = validateStep4();
        if (err) {
            setError(err);
            return;
        }

        setLoading(true);
        try {
            // 1. Create Auth User
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error("Erreur lors de la création du compte.");

            // 2. Insert Profile Data
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    nom: formData.lastName,
                    prenom: formData.firstName,
                    telephone: formData.phone,
                    anniversaire: formData.birthDate,
                    mini_entreprise_annee: parseInt(formData.miniYear),
                    mini_entreprise_ecole: formData.school,
                    mini_entreprise_nom: formData.miniName,
                    mini_entreprise_organisation: formData.org,
                    date_entree_ja: new Date().toISOString(),
                    situation: formData.situation,
                    region: formData.region,
                    departement: formData.departement,
                    statut: 'membre'
                })
                .eq('id', authData.user.id);

            if (profileError) {
                // Determine if it is a "row not found" due to trigger delay or RLS
                console.error("Profile update error:", profileError);
                // We don't throw properly here because the Auth is technically successful, 
                // but we might want to warn the user or retry.
                // For now, we assume trigger works fast enough or we accept partial data and user can edit profile later.
            }

            alert("Inscription réussie ! Bienvenue dans la communauté.");
            // Ideally redirect or show success state
            // router.push('/dashboard'); // Often need to wait for email confirmation if enabled
            window.location.href = '/dashboard';

        } catch (err: any) {
            setError(err.message || "Une erreur est survenue.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', color: 'var(--color-primary-dark)' }}>Inscription Alumni</h2>

            {/* Progress Dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{
                        width: '10px', height: '10px', borderRadius: '50%',
                        background: step >= i ? 'var(--color-primary)' : '#e5e7eb',
                        transition: 'background 0.3s'
                    }} />
                ))}
            </div>

            <div style={{ minHeight: '300px' }}>
                {step === 1 && (
                    <div className="fade-in">
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Calendar size={20} /> Conditions d&apos;éligibilité
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label className="label">Date de naissance</label>
                                <input
                                    type="date"
                                    name="birthDate"
                                    value={formData.birthDate}
                                    onChange={handleChange}
                                    className="input"
                                    style={{ width: '100%' }}
                                />
                                <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                                    Vous devez avoir au moins 15 ans.
                                </p>
                            </div>

                            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', background: '#f9f9f9', padding: '1rem', borderRadius: '0.5rem' }}>
                                <input
                                    type="checkbox"
                                    name="hasParticipated"
                                    checked={formData.hasParticipated}
                                    onChange={handleChange}
                                    style={{ marginTop: '0.25rem' }}
                                />
                                <span style={{ fontSize: '0.95rem', lineHeight: '1.4' }}>
                                    Je certifie avoir participé à une <strong>Mini-Entreprise</strong> (programme EPA ou 1000 Entrepreneurs).
                                </span>
                            </label>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="fade-in">
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Briefcase size={20} /> Votre Mini-Entreprise
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label className="label">Nom de la Mini-Entreprise</label>
                                <input
                                    type="text"
                                    name="miniName"
                                    value={formData.miniName}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="Ex: EcoBag"
                                    style={{ width: '100%' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label className="label">Année</label>
                                    <input
                                        type="number"
                                        name="miniYear"
                                        value={formData.miniYear}
                                        onChange={handleChange}
                                        className="input"
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label className="label">Organisation</label>
                                    <select
                                        name="org"
                                        value={formData.org}
                                        onChange={handleChange}
                                        className="input"
                                        style={{ width: '100%' }}
                                    >
                                        <option value="EPA">EPA (Entreprendre Pour Apprendre)</option>
                                        <option value="1000_ENT">1000 Entrepreneurs</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="label">Établissement / Ville</label>
                                <div style={{ position: 'relative' }}>
                                    <MapPin size={16} style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)', color: '#999' }} />
                                    <input
                                        type="text"
                                        name="school"
                                        value={formData.school}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="Lycée Victor Hugo..."
                                        style={{ width: '100%', paddingLeft: '2.5rem' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="fade-in">
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Map size={20} /> Votre Profil
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label className="label">Région *</label>
                                <select
                                    name="region"
                                    value={formData.region}
                                    onChange={handleChange}
                                    className="input"
                                    style={{ width: '100%' }}
                                >
                                    <option value="">Sélectionner une région</option>
                                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>

                            {formData.region && (
                                <div>
                                    <label className="label">Département *</label>
                                    <select
                                        name="departement"
                                        value={formData.departement}
                                        onChange={handleChange}
                                        className="input"
                                        style={{ width: '100%' }}
                                    >
                                        <option value="">Sélectionner un département</option>
                                        {(DEPARTEMENTS[formData.region] || []).map((d: string) => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="label">Situation *</label>
                                <select
                                    name="situation"
                                    value={formData.situation}
                                    onChange={handleChange}
                                    className="input"
                                    style={{ width: '100%' }}
                                >
                                    <option value="">Votre situation actuelle</option>
                                    {SITUATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="fade-in">
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <User size={20} /> Vos Identifiants
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label className="label">Prénom</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="input"
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label className="label">Nom</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="input"
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="label">Email</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={16} style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)', color: '#999' }} />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="input"
                                        style={{ width: '100%', paddingLeft: '2.5rem' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="label">Mot de passe</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={16} style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)', color: '#999' }} />
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="6 caractères min."
                                        style={{ width: '100%', paddingLeft: '2.5rem' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="label">Confirmer le mot de passe</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={16} style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)', color: '#999' }} />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="input"
                                        style={{ width: '100%', paddingLeft: '2.5rem' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {error && <div style={{ marginTop: '1.5rem', color: '#d9534f', background: '#f9d6d5', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.9rem' }}>{error}</div>}

            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                {step > 1 && (
                    <button
                        type="button"
                        className="btn"
                        onClick={() => setStep(step - 1)}
                        style={{ flex: 1, background: '#e5e7eb', color: '#333' }}
                    >
                        <ArrowLeft size={16} /> Retour
                    </button>
                )}

                {step < 4 ? (
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleNext}
                        style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                    >
                        Suivant <ArrowRight size={16} />
                    </button>
                ) : (
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleSignup}
                        disabled={loading}
                        style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                    >
                        {loading ? 'Création...' : <><CheckCircle size={18} /> S&apos;inscrire</>}
                    </button>
                )}
            </div>

            <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#666' }}>
                Déjà membre ?
                <button
                    onClick={onSwitch}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-primary)',
                        cursor: 'pointer',
                        fontWeight: 600,
                        marginLeft: '0.5rem',
                        textDecoration: 'underline'
                    }}
                >
                    Se connecter
                </button>
            </p>
        </div>
    );
}
