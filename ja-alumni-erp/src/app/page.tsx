import Link from 'next/link';

export default function Home() {
    return (
        <div className="container" style={{ margin: '4rem auto', textAlign: 'center' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--color-secondary)' }}>
                Bienvenue sur le portail JA Alumni
            </h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
                La plateforme dédiée à la gestion et l'animation du réseau Alumni JA France.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <Link href="/auth" className="btn btn-primary" style={{ fontSize: '1.2rem', padding: '0.75rem 2rem' }}>
                    Rejoindre le réseau
                </Link>
            </div>

            <div style={{ marginTop: '4rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <div className="card">
                    <h3>Pour les Membres</h3>
                    <p>Mettez à jour votre profil, inscrivez-vous aux événements et restez connecté avec le réseau.</p>
                </div>
                <div className="card">
                    <h3>Pour les Modérateurs</h3>
                    <p>Gérez votre région, suivez les KPI et organisez des événements locaux.</p>
                </div>
                <div className="card">
                    <h3>Pour le National</h3>
                    <p>Supervisez l'ensemble du réseau, analysez la croissance et l'impact.</p>
                </div>
            </div>
        </div>
    );
}
