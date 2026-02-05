"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function DebugRolePage() {
    const [session, setSession] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [error, setError] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const check = async () => {
            setLoading(true);
            try {
                // Check Key
                const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'MISSING';
                console.log("Current Key:", key);

                // 1. Get Session
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                setSession(session);

                if (sessionError) throw sessionError;

                if (session?.user) {
                    // 2. Get Profile
                    const { data, error: profileError } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    setProfile(data);
                    if (profileError) setError(profileError);
                }
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        check();
    }, []);

    return (
        <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
            <h1>Debug Role Status</h1>

            <div style={{ marginBottom: '2rem' }}>
                <h3>1. Auth Session</h3>
                {loading ? "Loading..." : session ? (
                    <pre style={{ background: '#eee', padding: '1rem' }}>
                        Email: {session.user.email} <br />
                        ID: {session.user.id} <br />
                        Role (Auth): {session.user.role}
                    </pre>
                ) : (
                    <div style={{ color: 'red' }}>NO SESSION. Please Log In.</div>
                )}
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <h3>2. Database Profile (public.profiles)</h3>
                {loading ? "Loading..." : profile ? (
                    <pre style={{ background: '#eef', padding: '1rem' }}>
                        ID: {profile.id} <br />
                        Email: {profile.email} <br />
                        <strong>Statut: {profile.statut}</strong> <br />
                        Region: {profile.region}
                    </pre>
                ) : (
                    <div style={{ color: 'red' }}>
                        PROFILE NOT FOUND / NULL. <br />
                        Error Details: {JSON.stringify(error, null, 2)}
                    </div>
                )}
            </div>

            <div style={{ background: '#fffae6', padding: '1rem', border: '1px solid #ddd' }}>
                <strong>Diagnosis:</strong>
                <ul>
                    <li>If <strong>Statut</strong> is &apos;membre&apos;, you did not run the UPDATE SQL command correctly (or forgot to replace the email).</li>
                    <li>If <strong>Profile is NULL</strong> but Session exists, the Row Level Security (RLS) might be blocking read access, or the profile wasn&apos;t created.</li>
                    <li>If <strong>Error code is 42P01</strong>, the table is STILL missing (did you run the fix script?).</li>
                </ul>
            </div>
        </div>
    );
}
