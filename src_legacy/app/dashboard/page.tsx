"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import MemberDashboard from '@/components/dashboard/MemberDashboard';
import ModeratorDashboard from '@/components/dashboard/ModeratorDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/auth');
                return;
            }
            setUser(session.user);

            // Fetch role
            const { data, error } = await supabase
                .from('profiles')
                .select('statut')
                .eq('id', session.user.id)
                .single();

            if (data) {
                setRole(data.statut);
            } else {
                // Handle case where profile doesn't exist yet (should trigger on signup but just in case)
                setRole('membre');
            }
            setLoading(false);
        };
        checkUser();
    }, [router]);

    if (loading) {
        return (
            <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
                Chargement...
            </div>
        );
    }

    if (role === 'copil_plus') {
        return <AdminDashboard />;
    } else if (role === 'referent') {
        return <ModeratorDashboard user={user} />;
    } else {
        return <MemberDashboard user={user} />;
    }
}
