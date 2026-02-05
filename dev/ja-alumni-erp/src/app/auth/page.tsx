"use client";

import { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f0fdf4', // Very light green background
            padding: '1rem'
        }}>

            {/* Main Card Container */}
            <div className="auth-card" style={{
                display: 'flex',
                maxWidth: '900px', // Reduced from 1000px
                width: '100%',
                background: 'white',
                borderRadius: '1.5rem',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0,0,0,0.08)'
            }}>

                {/* Left Panel - Marketing (Visible on Desktop/Tablet) */}
                <div className="side-panel" style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)', // Vibrant green gradient
                    padding: '2rem',
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                }}>

                    <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', fontWeight: 800 }}>
                        JA Alumni
                    </h2>

                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 600 }}>
                        Avec nous, tu :
                    </h3>

                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {[
                            "Continueras à développer tes compétences personnelles et professionnelles",
                            "Bénéficieras d’une aide professionnelle pour tes recherches (stage, alternance, emploi)",
                            "Pourras témoigner de ton expérience pour inspirer d’autres jeunes",
                            "Participeras à des évènements et rencontres exclusifs",
                            "Feras partie d’une communauté qui s’étend au-delà de nos frontières"
                        ].map((item, index) => (
                            <li key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', lineHeight: '1.3' }}>
                                <CheckCircle2 size={20} style={{ minWidth: '20px', marginTop: '2px', opacity: 0.9 }} />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>

                    <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                        <p style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            Alors, tu rejoins l&apos;aventure ? <ArrowRight />
                        </p>
                    </div>
                </div>

                {/* Right Panel - Form */}
                <div className="form-panel" style={{
                    flex: 1,
                    padding: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'white'
                }}>
                    <div style={{ width: '100%' }}>
                        {/* Mobile Header (only visible on small screens when we hide the side panel) */}
                        <div className="show-mobile-only" style={{ marginBottom: '2rem', textAlign: 'center', display: 'none' }}>
                            <h2 style={{ color: 'var(--color-primary-dark)', fontWeight: 800, fontSize: '2rem' }}>JA Alumni</h2>
                        </div>

                        {isLogin ? (
                            <LoginForm onSwitch={() => setIsLogin(false)} />
                        ) : (
                            <SignupForm onSwitch={() => setIsLogin(true)} />
                        )}
                    </div>
                </div>

            </div>

            {/* Simple CSS to handle responsiveness */}
            <style jsx global>{`
                @media (max-width: 768px) {
                    .auth-card {
                        flex-direction: column !important;
                        max-width: 100% !important;
                        border-radius: 0 !important;
                        box-shadow: none !important;
                        background: transparent !important;
                    }
                    .side-panel {
                        display: none !important;
                    }
                    .form-panel {
                        padding: 1rem !important;
                        background: transparent !important;
                    }
                    .show-mobile-only {
                        display: block !important;
                    }
                }
            `}</style>
        </div>
    );
}
