"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, ChevronLeft, Check, AlertTriangle, Loader, LogIn, ArrowLeft } from 'lucide-react';
import geoData from '@/lib/geoData';

const { regions, departments } = geoData;

export default function RegisterWizard() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [accountExists, setAccountExists] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: '',
        birthDate: '',
        region: '',
        department: '',
        miniEntYear: '',
        miniEntName: '',
        miniEntSchool: '',
        miniEntOrg: '',
        miniEntFormat: '',
        rgpdConsent: false
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'region') {
            setFormData(prev => ({ ...prev, region: value, department: '' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.checked }));
    };

    const nextStep = () => {
        setError(null);
        // Basic validation per step
        if (step === 1) {
            if (!formData.email || !formData.password || formData.password !== formData.confirmPassword) {
                setError("Veuillez vérifier vos identifiants (mots de passe identiques).");
                return;
            }
            if (formData.password.length < 6) {
                setError("Le mot de passe doit faire au moins 6 caractères.");
                return;
            }
        }
        if (step === 2) {
            if (!formData.firstName || !formData.lastName || !formData.birthDate) {
                setError("Veuillez remplir les informations obligatoires.");
                return;
            }
        }
        setStep(prev => prev + 1);
    };

    const prevStep = () => setStep(prev => prev - 1);

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        try {
            // 1. Create Auth User
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                    }
                }
            });

            if (authError) {
                // Check for duplicate user
                if (authError.message.includes('already registered')) {
                    setAccountExists(true);
                    setLoading(false);
                    return;
                }
                throw authError;
            }

            if (!authData.user) throw new Error("Erreur lors de la création du compte.");

            // 2. Insert/Update Profile
            const updates = {
                id: authData.user.id,
                first_name: formData.firstName,
                last_name: formData.lastName,
                phone: formData.phone,
                birth_date: formData.birthDate,
                region: formData.region,
                department: formData.department,
                mini_ent_year: formData.miniEntYear ? parseInt(formData.miniEntYear) : null,
                mini_ent_name: formData.miniEntName,
                mini_ent_school: formData.miniEntSchool,
                // mini_ent_school removed duplicate
                mini_ent_org: formData.miniEntOrg,
                mini_ent_format: formData.miniEntFormat || null,
                rgpd_consent: formData.rgpdConsent,
                rgpd_date: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                email: formData.email
            };

            const { error: profileError } = await supabase
                .from('profiles')
                .upsert(updates);

            if (profileError) {
                console.error("Profile update error:", profileError);
                // We don't block registration success if profile update fails (edge case)
                // but usually we should warn.
            }

            // Success
            setStep(5);

        } catch (err: any) {
            console.error(err);
            setError(err.message || "Une erreur est survenue.");
            setLoading(false);
        }
    };

    // Account Exists UI
    if (accountExists) {
        return (
            <div className="min-h-[calc(100vh-4rem)] bg-[var(--bg-main)] py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
                <div className="w-full max-w-md glass-card text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 mb-4">
                        <AlertTriangle className="h-6 w-6 text-orange-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Compte existant</h2>
                    <p className="text-slate-600 mb-8">
                        Un compte est déjà associé à l&apos;adresse <strong>{formData.email}</strong>.
                    </p>

                    <div className="space-y-3">
                        <Link href="/auth/login" className="btn-primary w-full flex items-center justify-center gap-2">
                            <LogIn size={18} /> Se connecter
                        </Link>

                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-slate-500">Ou</span>
                            </div>
                        </div>

                        <button onClick={() => setAccountExists(false)} className="btn-secondary w-full">
                            Modifier mes informations
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Normal Wizard UI
    const progress = (step / 4) * 100;
    const availableDepts = formData.region ? departments[formData.region as keyof typeof departments] || [] : [];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: (currentYear + 1) - 2000 + 1 }, (_, i) => (2000 + i).toString()).reverse();

    // 5. Success Screen
    if (step === 5) {
        return (
            <div className="min-h-[calc(100vh-4rem)] bg-[var(--bg-main)] py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
                <div className="w-full max-w-md glass-card text-center p-8">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                        <Check className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Inscription réussie !</h2>
                    <p className="text-slate-600 mb-8">
                        Votre compte a été créé avec succès. Vous pouvez maintenant accéder à votre espace membre.
                    </p>
                    <Link href="/dashboard" className="btn-primary w-full flex items-center justify-center gap-2">
                        Accéder au tableau de bord <ChevronRight size={18} />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-[var(--bg-main)] py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
            <div className="w-full max-w-2xl">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                        <span>Compte</span>
                        <span>Infos</span>
                        <span>Expérience</span>
                        <span>Validation</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--color-primary-500)] transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>

                <div className="glass-card shadow-xl">
                    <h2 className="text-2xl font-bold mb-6 text-slate-900 border-b border-slate-100 pb-4">
                        {step === 1 && "Création du compte"}
                        {step === 2 && "Informations personnelles"}
                        {step === 3 && "Expérience Mini-Entreprise"}
                        {step === 4 && "Récapitulatif & RGPD"}
                    </h2>

                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
                            <AlertTriangle size={16} />
                            {error}
                        </div>
                    )}

                    {/* STEP 1: ACCOUNT */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <input name="email" type="email" value={formData.email} onChange={handleChange} className="input" placeholder="exemple@mail.com" autoFocus />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
                                    <input name="password" type="password" value={formData.password} onChange={handleChange} className="input" placeholder="••••••••" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Confirmer mot de passe</label>
                                    <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} className="input" placeholder="••••••••" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: PERSONAL */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Prénom</label>
                                    <input name="firstName" value={formData.firstName} onChange={handleChange} className="input" placeholder="Jean" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
                                    <input name="lastName" value={formData.lastName} onChange={handleChange} className="input" placeholder="Dupont" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Date de naissance</label>
                                    <input name="birthDate" type="date" value={formData.birthDate} onChange={handleChange} className="input" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
                                    <input name="phone" type="tel" value={formData.phone} onChange={handleChange} className="input" placeholder="06..." />
                                </div>
                            </div>
                            <hr className="my-4 border-slate-100" />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Région</label>
                                    <select name="region" value={formData.region} onChange={handleChange} className="input">
                                        <option value="">Sélectionner...</option>
                                        {regions.map((r: string) => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Département</label>
                                    <select name="department" value={formData.department} onChange={handleChange} className="input" disabled={!formData.region}>
                                        <option value="">Sélectionner...</option>
                                        {availableDepts.map((d: string) => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: EXPERIENCE */}
                    {step === 3 && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Année de participation</label>
                                    <select name="miniEntYear" value={formData.miniEntYear} onChange={handleChange} className="input">
                                        <option value="">Sélectionner...</option>
                                        {years.map((y) => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Organisation</label>
                                    <select name="miniEntOrg" value={formData.miniEntOrg} onChange={handleChange} className="input">
                                        <option value="">Sélectionner...</option>
                                        <option value="EPA">EPA (Entreprendre Pour Apprendre)</option>
                                        <option value="1000_ENT">1000 Entrepreneurs</option>
                                        <option value="AUTRE">Autre</option>
                                    </select>
                                </div>
                            </div>

                            {formData.miniEntOrg === 'EPA' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Format</label>
                                    <select name="miniEntFormat" value={formData.miniEntFormat} onChange={handleChange} className="input">
                                        <option value="">Sélectionner...</option>
                                        <option value="S">S (Short)</option>
                                        <option value="M">M (Medium)</option>
                                        <option value="L">L (Long)</option>
                                        <option value="XL">XL (Extra Long)</option>
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nom de la Mini-Entreprise</label>
                                <input name="miniEntName" value={formData.miniEntName} onChange={handleChange} className="input" placeholder="Ex: EcoBag" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Etablissement / Ville</label>
                                <input name="miniEntSchool" value={formData.miniEntSchool} onChange={handleChange} className="input" placeholder="Ex: Lycée Victor Hugo" />
                            </div>
                        </div>
                    )}

                    {/* STEP 4: REVIEW */}
                    {step === 4 && (
                        <div className="space-y-6">
                            <div className="bg-slate-50 p-4 rounded-lg space-y-2 text-sm">
                                <p><strong>Email:</strong> {formData.email}</p>
                                <p><strong>Identité:</strong> {formData.firstName} {formData.lastName}</p>
                                <p><strong>Lieu:</strong> {formData.department} ({formData.region})</p>
                                <p><strong>Mini:</strong> {formData.miniEntName} ({formData.miniEntYear})</p>
                            </div>

                            <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                                <div className="pt-0.5">
                                    <input
                                        type="checkbox"
                                        name="rgpdConsent"
                                        checked={formData.rgpdConsent}
                                        onChange={handleCheckbox}
                                        className="h-4 w-4 rounded border-slate-300 text-[var(--color-primary-600)] focus:ring-[var(--color-primary-500)]"
                                    />
                                </div>
                                <div className="text-sm text-slate-600">
                                    <span className="font-medium text-slate-900">Consentement RGPD</span>
                                    <p className="mt-1">
                                        J&apos;accepte que mes données soient traitées par JA Alumni France pour la gestion du réseau, l&apos;organisation d&apos;événements et la communication interne. Je certifie avoir plus de 15 ans.
                                    </p>
                                </div>
                            </label>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="mt-8 flex justify-between pt-6 border-t border-slate-100">
                        {step > 1 ? (
                            <button onClick={prevStep} className="btn-secondary flex items-center gap-2">
                                <ChevronLeft size={18} /> Retour
                            </button>
                        ) : (
                            <Link href="/" className="btn-secondary flex items-center gap-2 text-slate-500 hover:text-slate-700">
                                <ArrowLeft size={18} /> Annuler
                            </Link>
                        )}

                        {step < 4 ? (
                            <button onClick={nextStep} className="btn-primary flex items-center gap-2">
                                Suivant <ChevronRight size={18} />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={!formData.rgpdConsent || loading}
                                className="btn-primary flex items-center gap-2 bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader className="animate-spin" size={18} /> : <Check size={18} />} Confirmer l&apos;inscription
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
