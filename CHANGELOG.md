# Changelog - JA Alumni ERP

## [Unreleased] - 2026-02-06

### Nouvelles Fonctionnalités Détailées (Calendar Update)

#### 📅 Calendrier & Événements
- **Vue Calendrier** : Nouvelle page `/calendar` avec vues mensuelle et liste.
- **Filtrage** :
  - Événements Nationaux (toujours visibles).
  - Événements Régionaux (filtrables, région de l'utilisateur obligatoire).
- **Consultation** :
  - Modal de détails avec image de couverture, lieu, dates, et description.
  - Bouton **"Je participe !"** pour s'inscrire/se désinscrire.
- **Gestion (Create/Edit/Delete)** :
  - **Admins / Copil / Copil+** : Contrôle total sur tous les événements (Nationaux & Régionaux).
  - **Référents** : Création et gestion uniquement pour **leur région**.
  - Formulaire intuitif avec pré-remplissage pour l'édition.

#### 🔐 Permissions & Sécurité
- **RLS (Row Level Security)** :
  - Correction des politiques pour `events` et `participations`.
  - Résolution des boucles de récursion infinie sur la table `profiles`.
- **Debug Mode** :
  - Ajout d'un sélecteur de rôle (encadré rouge sur la page Profil) pour l'utilisateur `mroberdeau.pro@gmail.com` afin de tester facilement les différents niveaux d'accès.

#### 🛠️ Technique & Optimisation
- **Nettoyage** : Suppression de ~30 fichiers temporaires SQL et scripts de vérification à la racine.
- **Dépendances** : Suppression de `@types/date-fns` (conflit avec `date-fns` v3) pour corriger les erreurs de linting/build.
- **Navigation** : Correction des liens `/events` -> `/calendar` dans la Navbar.

---

## [Précédent]
- Mise en place de l'Annuaire (Directory).
- Page Profil & Édition.
- Rôles : Admin, Moderator (Copil), Member (Alumni).
