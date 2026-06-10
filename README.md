# QCM Pro v3 — Plateforme d'évaluation

## Déploiement Render.com (gratuit, sans disk)

1. Créez un compte render.com
2. Créez un dépôt GitHub, uploadez :
   - server.js, package.json, .gitignore
   - public/index.html (dans un dossier public/)
3. Render → New → Web Service
   - Build : npm install
   - Start : node server.js
   - NE PAS ajouter de disk (option 2 = mémoire)

⚠️ Les données sont en mémoire : exportez le CSV avant de fermer
    votre tableau de bord après chaque session.

## Identifiants par défaut
- Code étudiant    : AZUR2026    (modifiable dans Paramètres)
- Mot de passe     : FORMATEUR   (modifiable dans Paramètres)

## Import de QCM — Formats supportés

### CSV (recommandé)
Séparateur ; ou ,
```
title;Nom du QCM
subject;Matière
duration;1800
---
part;question;choixA;choixB;choixC;choixD;answer
Thème;Texte de la question ?;Réponse A;Réponse B;Réponse C;Réponse D;1
```
answer = index 0-based (0=A, 1=B, 2=C, 3=D) ou lettre (A/B/C/D)

### JSON
{"title":"…","subject":"…","duration":1800,"questions":[
  {"part":"…","q":"…","choices":["A","B","C","D"],"answer":1}
]}

### XML
<quiz title="…" subject="…" duration="1800">
  <question part="…">
    <q>Texte ?</q>
    <choice>Réponse A</choice>
    <choice correct="true">Réponse B (bonne)</choice>
    <choice>Réponse C</choice>
  </question>
</quiz>

→ Téléchargez les fichiers exemples directement depuis l'interface
  (onglet Bibliothèque → Importer → boutons Exemple CSV/JSON/XML)
