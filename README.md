# 📊 Planning des bénévoles sur Google Sheet pour un refuge pour animaux. 

Les bénévoles ajoutent leur nom et le motif dans une cellule. Par exemple, *Tartempion, balades chiens*.
Un accès en écriture est nécessaire pour les bénévoles.
Les feuilles et les dates se mettent à jour automatiquement.
Projet **Google Apps Script** lié à un **Google Sheet**, versionné avec **GitHub** via **CLASP**.

---

## ▶️ Exemple en ligne

1. Ouvrez la page https://docs.google.com/spreadsheets/d/1JwrkQHKb_Np5uTHjPZxees9CdOoigd_JZPV0nbo1hPo/edit?usp=sharing
2. Ouvrez Fichier → Créer une copie

---

## ⏰ Ajouter des déclencheurs

Les déclencheurs permettent d’exécuter automatiquement des fonctions Apps Script
(en réponse à un événement ou selon un planning).

⚠️ Les déclencheurs **ne sont pas versionnés dans GitHub**.  
Ils doivent être recréés manuellement dans chaque copie du Google Sheet.

---

### 📍 Accéder à la gestion des déclencheurs

1. Ouvrez le **Google Sheet** associé au projet
2. Menu **Extensions → Apps Script**
3. Dans l’éditeur Apps Script, cliquez sur l’icône **⏰ Déclencheurs** (barre latérale gauche)

### 📍 Créez les déclencheurs

#### Avec l'interface graphique

1. Ouvrez Extensions → Apps Script → Déclencheurs
2. Ajoutez les déclancheurs suivants :

| Déploiement | Événement | Fonction | Description |
|-------------|-----------|----------|-------------|
| Head | Basé sur la feuille de calcul (à l'ouverture) | `creerMenuPersonnalise` | Crée et affiche le menu personnalisé du tableur |
| Head | Basé sur la feuille de calcul (à l'ouverture) | `protegeEtCacheFeuillesProtegees` | Protège et masque les feuilles réservées |
| Head | Basé sur la feuille de calcul (à l'ouverture) | `supprimeFeuillesInutiles` | Supprime les feuilles temporaires ou obsolètes |
| Head | Basé sur l'heure (tous les lundis entre 2 h et 3 h) | `creeFeuillesDesSemaines` | Crée automatiquement les feuilles hebdomadaires |
| Head | Basé sur l'heure (tous les lundis entre 3 h et 4 h) | `supprimeAnciennesFeuilles` | Supprime les anciennes feuilles devenues inutiles |

#### Avec Apps Script (alternative)

1. Ouvrez Extensions → Apps Script
2. Sélectionnez la fonction `setupTriggers`
3. Cliquez sur ▶ Exécuter
4. Autorisez le script

👉 Les déclencheurs apparaîtront ensuite dans ⏰ Déclencheurs
