export default function RGPDPage() {
    return (
        <div className="container" style={{ padding: '2rem' }}>
            <h1>Politique de Confidentialité et RGPD</h1>
            <p>
                Cette page détaille notre politique de gestion des données personnelles conformément au Règlement Général sur la Protection des Données (RGPD).
            </p>
            <section style={{ marginTop: '2rem' }}>
                <h2>1. Collecte des données</h2>
                <p>
                    Les données collectées via le profil (nom, prénom, email, téléphone, etc.) sont nécessaires à la gestion de l'association JA Alumni.
                </p>
            </section>
            <section style={{ marginTop: '2rem' }}>
                <h2>2. Conservation des données</h2>
                <p>
                    Vos données sont conservées tant que vous êtes membre.
                    Si aucune mise à jour n'est effectuée pendant <strong>2 ans</strong>, nous vous demanderons de confirmer vos informations.
                    Sans réponse, vos données pourront être anonymisées ou supprimées.
                </p>
            </section>
            <section style={{ marginTop: '2rem' }}>
                <h2>3. Vos droits</h2>
                <p>
                    Vous disposez d'un droit d'accès, de rectification et d'effacement de vos données.
                    Vous pouvez exercer ces droits directement depuis votre page de profil ou en nous contactant.
                </p>
            </section>
        </div>
    );
}
