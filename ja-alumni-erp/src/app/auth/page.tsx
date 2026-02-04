"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                router.push('/dashboard');
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                alert('Inscription réussie ! Veuillez vérifier vos emails.');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--color-primary-light)' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    {isLogin ? 'Connexion' : 'Inscription'}
                </h2>

                <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label className="label">Email</label>
                        <input
                            type="email"
                            required
                            className="input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="label">Mot de passe</label>
                        <input
                            type="password"
                            required
                            className="input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && <div style={{ color: 'red', fontSize: '0.9rem' }}>{error}</div>}

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Chargement...' : (isLogin ? 'Se connecter' : "S'inscrire")}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
                    {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
                    <span
                        onClick={() => setIsLogin(!isLogin)}
                        style={{ color: 'var(--color-primary-dark)', cursor: 'pointer', marginLeft: '0.5rem', fontWeight: 600 }}
                    >
                        {isLogin ? "S'inscrire" : 'Se connecter'}
                    </span>
                </p>
            </div>
            <div style={{ marginTop: '2rem' }}>
                <a href="/" style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>← Retour à l'accueil</a>
            </div>
        </div>
    );
}
