# Ordre d'Exécution des Migrations SQL

Pour configurer la base de données, exécutez les scripts dans cet ordre :

## 1. Schéma de Base
```sql
schema.sql
```
Crée la structure de base (tables `profiles`, `events`, etc.)

## 2. Migrations Principales

### Events
```sql
migration_events.sql
```
Ajoute la table des événements et les permissions

### Mini-Entreprise
```sql
supabase/migration_mini_entreprise.sql
```
Ajoute les champs de parcours mini-entreprise

## 3. Fonctionnalités Copil

```sql
add_copil_role_manual.sql          # Ajoute la colonne copil_role
add_copil_start_year_manual.sql    # Ajoute l'année d'entrée au Copil
add_is_referent_manual.sql         # Flag pour double-rôle Copil+Référent
fix_enum_copil_plus.sql            # Ajoute copil_plus à l'enum user_role
```

## 4. Nettoyage (Optionnel)
```sql
remove_admin_moderator_roles_simple.sql
```
Supprime les anciens rôles admin/moderator (si migration depuis ancienne version)

## 5. Optimisations de Performance
```sql
add_performance_indexes.sql
```
⚠️ **À EXÉCUTER EN DERNIER** - Ajoute les index pour améliorer les performances

## 6. Vérification (Optionnel)
```sql
verify_database.sql
```
Script de diagnostic pour vérifier l'état de la base

---

## Notes Importantes

- **Supabase Dashboard** : Exécutez ces scripts via SQL Editor dans le dashboard Supabase
- **Ordre critique** : Respectez l'ordre d'exécution pour éviter les erreurs de dépendances
- **Backup** : Faites un backup avant toute migration en production
- **Environment** : Ces scripts sont pour PostgreSQL (Supabase)

## Troubleshooting

Si vous rencontrez l'erreur `invalid input value for enum user_role: "copil_plus"` :
1. Exécutez `fix_enum_copil_plus.sql`
2. Réessayez la migration qui a échoué

Si les performances sont lentes :
- Vérifiez que `add_performance_indexes.sql` a bien été exécuté
- Lancez `verify_database.sql` section 7 pour lister les index actifs
