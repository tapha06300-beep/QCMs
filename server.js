const express = require('express');
const path    = require('path');
const multer  = require('multer');

const app    = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });

app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ══════════════════════════════════════════════════════════════════════════════
// BASE DE DONNÉES EN MÉMOIRE
// ══════════════════════════════════════════════════════════════════════════════
const db = {
  config: {
    teacherPwd:  'qcm@69100!DZ',
    accessCode:  'QCM2026',
    duration:    1800,
    qcmActive:   true
  },
  quizzes:  {},   // id -> { id, title, subject, createdAt, questions[] }
  sessions: {},   // id -> session
  activeQuizId: null,
  nextQuizId: 1
};

// ── QCM Azure par défaut ──────────────────────────────────────────────────────
function insertDefaultQuiz() {
  const id = db.nextQuizId++;
  db.quizzes[id] = {
    id, createdAt: new Date().toISOString(),
    title: 'Évaluations numériques',
    subject: '',
    questions: [
      {part:"Cloud & organisation",q:"Dans le modèle IaaS sur Azure, quelle responsabilité incombe exclusivement au client ?",choices:["La maintenance du matériel physique dans le datacenter","La gestion de l'hyperviseur et du réseau physique","Le patching du système d'exploitation et la configuration des middlewares","La redondance électrique et la climatisation des salles serveurs"],answer:2},
      {part:"Cloud & organisation",q:"Qu'est-ce qu'une Availability Zone dans Azure ?",choices:["Un datacenter situé dans un pays différent pour la reprise après sinistre","Un ou plusieurs datacenters physiquement isolés au sein d'une même région, avec alimentation et réseau indépendants","Un groupe de régions partageant la même infrastructure réseau backbone","Un service de répartition de charge automatique entre plusieurs régions"],answer:1},
      {part:"Cloud & organisation",q:"Quel est l'ordre hiérarchique correct de la structure organisationnelle Azure ?",choices:["Subscription → Management Group → Tenant → Resource Group → Resource","Tenant → Management Group → Subscription → Resource Group → Resource","Resource Group → Subscription → Management Group → Tenant → Resource","Tenant → Subscription → Management Group → Resource → Resource Group"],answer:1},
      {part:"Cloud & organisation",q:"Parmi ces services Azure, lequel est un exemple de modèle PaaS ?",choices:["Azure Virtual Machine","Azure Managed Disk","Azure App Service","Azure Virtual Network"],answer:2},
      {part:"Calcul",q:"Vous hébergez une base de données MySQL nécessitant un ratio RAM élevé. Quelle famille de VM Azure est la plus adaptée ?",choices:["Série B — burstable, pour les charges variables","Série D — general purpose, ratio CPU/RAM équilibré","Série E — memory optimized, ratio RAM élevé","Série F — compute optimized, CPU haute fréquence"],answer:2},
      {part:"Calcul",q:"Quelle est la principale différence entre un Availability Set et un déploiement multi-Availability Zone ?",choices:["Un Availability Set protège contre la panne d'un datacenter entier ; les AZ protègent contre la panne d'un rack","Un Availability Set distribue les VMs sur des fault/update domains dans un même datacenter ; les AZ les distribuent sur des datacenters physiquement distincts","Les deux mécanismes sont identiques, seul le SLA associé diffère","Un Availability Set est réservé aux VMs Windows ; les AZ supportent Linux et Windows"],answer:1},
      {part:"Calcul",q:"Azure VM Scale Sets (VMSS) permet principalement de :",choices:["Cloner une VM dans un autre datacenter pour la sauvegarde","Connecter des VMs on-premise à Azure via VPN","Déployer et gérer un groupe de VMs identiques avec scaling horizontal automatique basé sur des métriques","Regrouper des VMs de types différents dans une seule unité de facturation"],answer:2},
      {part:"Stockage",q:"Vous devez stocker des archives légales pendant 7 ans, consultées moins d'une fois par an. Quel niveau Blob Storage est le plus adapté ?",choices:["Hot — accès immédiat, coût stockage élevé","Cool — accès occasionnel, rétention minimum 30 jours","Cold — accès rare, rétention minimum 90 jours","Archive — réhydratation requise, coût stockage minimal, rétention longue durée"],answer:3},
      {part:"Stockage",q:"Le type de redondance Azure Storage qui garantit 3 copies dans 3 datacenters distincts au sein d'une même région s'appelle :",choices:["LRS — Locally Redundant Storage","ZRS — Zone-Redundant Storage","GRS — Geo-Redundant Storage","GZRS — Geo-Zone-Redundant Storage"],answer:1},
      {part:"Stockage",q:"Une application doit accéder à un Storage Account sans stocker de credentials dans le code. Quelle est la solution recommandée ?",choices:["Stocker les access keys dans des variables d'environnement système","Utiliser une Managed Identity avec un rôle RBAC attribué sur le Storage Account","Créer un SAS token d'un an et le passer en variable d'environnement","Partager les credentials via un fichier de configuration chiffré"],answer:1},
      {part:"Réseau",q:"Un subnet Azure /26 dispose de combien d'adresses IP utilisables par des ressources déployées ?",choices:["64 adresses","62 adresses","59 adresses (Azure réserve 5 adresses par subnet)","56 adresses"],answer:2},
      {part:"Réseau",q:"Un NSG (Network Security Group) filtre le trafic à quel niveau du modèle OSI ?",choices:["Niveau 7 — il inspecte le contenu HTTP/HTTPS","Niveau 3/4 — il filtre sur IP source/destination et numéro de port","Niveau 2 — il filtre sur les adresses MAC","Niveau 5 — il maintient l'état des sessions TLS"],answer:1},
      {part:"Réseau",q:"Quelle technologie Azure permet de relier deux VNets via le backbone Microsoft sans passer par Internet ?",choices:["Azure ExpressRoute","Azure VNet Peering","Azure VPN Gateway Site-to-Site","Azure Application Gateway"],answer:1},
      {part:"Réseau",q:"Quelle est la principale différence entre Azure Load Balancer Standard et Azure Application Gateway ?",choices:["Azure Load Balancer est payant ; Azure Application Gateway est gratuit","Azure Load Balancer opère en couche 4 (TCP/UDP) ; Azure Application Gateway opère en couche 7 (HTTP/HTTPS) avec WAF","Azure Application Gateway ne supporte que HTTPS, pas HTTP","Azure Load Balancer ne peut distribuer le trafic qu'au sein d'un même subnet"],answer:1},
      {part:"Identité & Sécurité",q:"Quelle est la différence fondamentale entre Microsoft Entra ID et Active Directory Domain Services ?",choices:["Entra ID utilise LDAP et Kerberos comme AD DS, mais hébergé dans le cloud","Entra ID est un annuaire cloud natif (OAuth2, OIDC, SAML) ; AD DS repose sur LDAP/Kerberos pour les environnements réseau locaux","Entra ID ne supporte pas les groupes d'utilisateurs, contrairement à AD DS","AD DS est plus sécurisé car il ne nécessite pas de connexion Internet"],answer:1},
      {part:"Identité & Sécurité",q:"Le modèle RBAC Azure repose sur trois éléments. Lequel des ensembles suivants est correct ?",choices:["Tenant + Subscription + Resource Group","Security Principal + Role Definition + Scope","User + Password + Permission","Identity + Policy + Action"],answer:1},
      {part:"Identité & Sécurité",q:"Quel service Azure permet de stocker des secrets applicatifs, des clés de chiffrement et des certificats TLS de façon centralisée ?",choices:["Azure Security Center","Azure Active Directory Certificate Services","Azure Key Vault","Microsoft Defender for Identity"],answer:2},
      {part:"Supervision & IaC",q:"Dans KQL (Kusto Query Language), quel opérateur permet de filtrer les lignes d'une table selon une condition ?",choices:["summarize","project","where","extend"],answer:2},
      {part:"Supervision & IaC",q:"Quelle est la caractéristique principale d'un déploiement Bicep par rapport à un déploiement manuel via le portail Azure ?",choices:["Bicep est plus rapide que le portail pour créer une VM","Bicep est déclaratif et idempotent : exécuté plusieurs fois, il ne recrée les ressources que si leur configuration a changé","Bicep ne supporte que les ressources réseau et stockage","Bicep nécessite PowerShell pour être exécuté"],answer:1},
      {part:"Architecture",q:"Dans le Azure Well-Architected Framework, que désigne le RPO (Recovery Point Objective) ?",choices:["Le temps maximum acceptable entre une panne et le retour à un service normal","Le nombre maximum de régions sur lesquelles une application doit être déployée","La quantité maximale de données pouvant être perdues, mesurée en temps","Le pourcentage minimal de disponibilité garanti par le SLA"],answer:2}
    ]
  };
  db.activeQuizId = id;
}
insertDefaultQuiz();

// ══════════════════════════════════════════════════════════════════════════════
// PARSERS MULTI-FORMAT
// ══════════════════════════════════════════════════════════════════════════════

// ── CSV ───────────────────────────────────────────────────────────────────────
// Format attendu (séparateur ; ou ,) :
// title;Mon QCM
// subject;Matière
// duration;1800
// ---
// part;question;choiceA;choiceB;choiceC;choiceD;answer
// Réseau;Quel protocole...;HTTP;TCP;UDP;ARP;1
function parseCSV(text) {
  const lines = text.replace(/\r/g, '').split('\n').filter(l => l.trim());
  const sep = lines[0].includes(';') ? ';' : ',';

  const meta   = { title: 'QCM importé', subject: '', duration: 1800 };
  const questions = [];
  let inQuestions = false;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;

    if (line === '---') { inQuestions = true; continue; }

    const cols = line.split(sep).map(c => c.trim().replace(/^"|"$/g, ''));

    if (!inQuestions) {
      // Lignes de métadonnées : key;value
      const [k, ...rest] = cols;
      const v = rest.join(sep).trim();
      if (k.toLowerCase() === 'title')    meta.title    = v;
      if (k.toLowerCase() === 'subject')  meta.subject  = v;
      if (k.toLowerCase() === 'duration') meta.duration = parseInt(v) || 1800;
      // Ignorer la ligne d'en-tête des questions
      if (k.toLowerCase() === 'part' || k.toLowerCase() === 'question') { inQuestions = true; continue; }
    } else {
      // Colonnes : part ; question ; choix1 ; choix2 [; choix3 [; choix4]] ; answer
      if (cols.length < 4) continue;
      // Détecter si la 1re colonne est "part" ou directement la question
      // On accepte 4 à 7 colonnes
      let part, q, choices, answerRaw;
      if (cols.length >= 6) {
        // part ; question ; A ; B ; [C] ; [D] ; answer
        part      = cols[0];
        q         = cols[1];
        answerRaw = cols[cols.length - 1];
        choices   = cols.slice(2, cols.length - 1).filter(c => c.length > 0);
      } else {
        // question ; A ; B ; [C] ; answer  (sans part)
        part      = '';
        q         = cols[0];
        answerRaw = cols[cols.length - 1];
        choices   = cols.slice(1, cols.length - 1).filter(c => c.length > 0);
      }
      if (!q || choices.length < 2) continue;
      // answer : index numérique (0-based) ou lettre (A/B/C/D)
      let answer = parseInt(answerRaw);
      if (isNaN(answer)) {
        answer = answerRaw.toUpperCase().charCodeAt(0) - 65; // A→0, B→1...
      }
      if (answer < 0 || answer >= choices.length) continue;
      questions.push({ part, q, choices, answer });
    }
  }
  if (!questions.length) throw new Error('Aucune question trouvée dans le fichier CSV');
  return { ...meta, questions };
}

// ── JSON ──────────────────────────────────────────────────────────────────────
function parseJSON(text) {
  const data = JSON.parse(text);
  const quiz = Array.isArray(data)
    ? { title: 'QCM importé', questions: data }
    : data;
  if (!quiz.title)                              throw new Error('Champ "title" manquant');
  if (!Array.isArray(quiz.questions) || !quiz.questions.length) throw new Error('Champ "questions" vide ou manquant');
  for (let i = 0; i < quiz.questions.length; i++) {
    const q = quiz.questions[i];
    if (!q.q || !Array.isArray(q.choices) || q.choices.length < 2)
      throw new Error(`Question ${i + 1} : structure invalide`);
    if (typeof q.answer !== 'number' || q.answer < 0 || q.answer >= q.choices.length)
      throw new Error(`Question ${i + 1} : answer invalide`);
  }
  return quiz;
}

// ── XML ───────────────────────────────────────────────────────────────────────
// Format :
// <quiz title="..." subject="..." duration="1800">
//   <question part="Réseau">
//     <q>Texte de la question ?</q>
//     <choice>Réponse A</choice>
//     <choice correct="true">Réponse B</choice>
//     <choice>Réponse C</choice>
//   </question>
// </quiz>
function parseXML(text) {
  const attr = (tag, a) => { const m = tag.match(new RegExp(`${a}="([^"]*)"`)); return m ? m[1] : ''; };
  const inner = (tag, t) => { const m = t.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`,'i')); return m ? m[1].trim() : ''; };

  const quizMatch = text.match(/<quiz([^>]*)>/i);
  if (!quizMatch) throw new Error('Balise <quiz> introuvable');
  const quizAttrs = quizMatch[1];
  const title    = attr(quizAttrs, 'title')    || 'QCM importé';
  const subject  = attr(quizAttrs, 'subject')  || '';
  const duration = parseInt(attr(quizAttrs, 'duration')) || 1800;

  const questions = [];
  const qBlocks = [...text.matchAll(/<question([^>]*)>([\s\S]*?)<\/question>/gi)];
  for (let i = 0; i < qBlocks.length; i++) {
    const [, qAttrs, qBody] = qBlocks[i];
    const part = attr(qAttrs, 'part') || '';
    const q    = inner('q', qBody);
    if (!q) continue;
    const choiceBlocks = [...qBody.matchAll(/<choice([^>]*)>([\s\S]*?)<\/choice>/gi)];
    const choices = [];
    let answer = 0;
    choiceBlocks.forEach(([, cAttrs, cText], ci) => {
      choices.push(cText.trim());
      if (/correct\s*=\s*"true"/i.test(cAttrs)) answer = ci;
    });
    if (choices.length < 2) continue;
    questions.push({ part, q, choices, answer });
  }
  if (!questions.length) throw new Error('Aucune question trouvée dans le fichier XML');
  return { title, subject, duration, questions };
}

// ── Dispatcher ────────────────────────────────────────────────────────────────
function parseFile(buffer, filename) {
  const text = buffer.toString('utf8');
  const ext  = filename.split('.').pop().toLowerCase();
  if (ext === 'json')         return parseJSON(text);
  if (ext === 'xml')          return parseXML(text);
  if (ext === 'csv' || ext === 'txt') return parseCSV(text);
  // Auto-détection
  const t = text.trim();
  if (t.startsWith('{') || t.startsWith('[')) return parseJSON(text);
  if (t.startsWith('<'))                       return parseXML(text);
  return parseCSV(text);
}

// ══════════════════════════════════════════════════════════════════════════════
// MIDDLEWARE AUTH FORMATEUR
// ══════════════════════════════════════════════════════════════════════════════
function auth(req, res, next) {
  if (req.headers['x-teacher-pwd'] !== db.config.teacherPwd)
    return res.status(403).json({ error: 'Accès refusé' });
  next();
}

// ══════════════════════════════════════════════════════════════════════════════
// API ÉTUDIANTS
// ══════════════════════════════════════════════════════════════════════════════

app.get('/api/status', (req, res) => {
  const quiz = db.activeQuizId ? db.quizzes[db.activeQuizId] : null;
  res.json({
    active: db.config.qcmActive,
    quiz:   quiz ? { id: quiz.id, title: quiz.title, subject: quiz.subject, duration: quiz.questions.length > 0 ? db.config.duration : 1800 } : null
  });
});

app.post('/api/start', (req, res) => {
  const { name, code } = req.body;
  if (!name || !name.trim())           return res.status(400).json({ error: 'Nom requis' });
  if (code !== db.config.accessCode)   return res.status(403).json({ error: 'Code d\'accès incorrect' });
  if (!db.config.qcmActive)           return res.status(403).json({ error: 'Le QCM n\'est pas actif pour le moment' });
  if (!db.activeQuizId)               return res.status(400).json({ error: 'Aucun QCM actif' });

  const quiz = db.quizzes[db.activeQuizId];
  if (!quiz)                           return res.status(400).json({ error: 'QCM introuvable' });

  const id = name.trim().toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
  db.sessions[id] = {
    id, quizId: quiz.id, quizTitle: quiz.title,
    name: name.trim(),
    status: 'en_cours', progress: 0,
    answers: [], score: null, correct: null, time: null,
    violations: [], startedAt: new Date().toISOString(), finishedAt: null
  };

  // Questions sans les réponses
  const questions = quiz.questions.map(({ part, q, choices }) => ({ part, q, choices }));
  res.json({ sessionId: id, duration: db.config.duration, questions, total: questions.length });
});

app.patch('/api/session/:id', (req, res) => {
  const s = db.sessions[req.params.id];
  if (!s) return res.status(404).json({ error: 'Session introuvable' });
  if (req.body.progress   !== undefined) s.progress   = req.body.progress;
  if (req.body.answers    !== undefined) s.answers    = req.body.answers;
  if (req.body.violations !== undefined) s.violations = req.body.violations;
  res.json({ ok: true });
});

app.post('/api/submit/:id', (req, res) => {
  const s = db.sessions[req.params.id];
  if (!s) return res.status(404).json({ error: 'Session introuvable' });
  const { answers, timeUsed, violations } = req.body;
  const quiz = db.quizzes[s.quizId];
  if (!quiz) return res.status(400).json({ error: 'QCM introuvable' });

  s.answers    = answers;
  s.violations = violations || [];
  s.status     = 'terminé';
  s.finishedAt = new Date().toISOString();
  s.progress   = quiz.questions.length;

  let correct = 0;
  answers.forEach((a, i) => { if (quiz.questions[i] && a === quiz.questions[i].answer) correct++; });
  s.correct = correct;
  s.score   = Math.round(correct / quiz.questions.length * 100);
  const mm  = String(Math.floor(timeUsed / 60)).padStart(2, '0');
  const ss  = String(timeUsed % 60).padStart(2, '0');
  s.time    = mm + ':' + ss;

  res.json({ score: s.score, correct: s.correct, time: s.time, total: quiz.questions.length });
});

// ══════════════════════════════════════════════════════════════════════════════
// API FORMATEUR — SESSIONS LIVE
// ══════════════════════════════════════════════════════════════════════════════

app.get('/api/results', auth, (req, res) => {
  const sessions = Object.values(db.sessions);
  const done     = sessions.filter(s => s.status === 'terminé');
  const avg      = done.length ? Math.round(done.reduce((a, s) => a + s.score, 0) / done.length) : null;
  const viol     = sessions.reduce((a, s) => a + s.violations.length, 0);
  res.json({
    sessions, active: db.config.qcmActive,
    config: { accessCode: db.config.accessCode },
    activeQuizId: db.activeQuizId,
    stats: { total: sessions.length, done: done.length, inProgress: sessions.filter(s => s.status === 'en_cours').length, avg, violations: viol }
  });
});

app.get('/api/session/:id/detail', auth, (req, res) => {
  const s = db.sessions[req.params.id];
  if (!s) return res.status(404).json({ error: 'Session introuvable' });
  const quiz = db.quizzes[s.quizId];
  res.json({ ...s, questions: quiz ? quiz.questions : [] });
});

app.delete('/api/results', auth, (req, res) => {
  db.sessions = {};
  res.json({ ok: true });
});

// ══════════════════════════════════════════════════════════════════════════════
// API FORMATEUR — BIBLIOTHÈQUE QCM
// ══════════════════════════════════════════════════════════════════════════════

app.get('/api/quizzes', auth, (req, res) => {
  const quizzes = Object.values(db.quizzes).map(q => ({
    id: q.id, title: q.title, subject: q.subject,
    createdAt: q.createdAt, questionCount: q.questions.length,
    active: q.id === db.activeQuizId
  })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ quizzes, activeQuizId: db.activeQuizId });
});

app.get('/api/quizzes/:id', auth, (req, res) => {
  const q = db.quizzes[Number(req.params.id)];
  if (!q) return res.status(404).json({ error: 'QCM introuvable' });
  res.json(q);
});

app.post('/api/quizzes/import', auth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu' });
  try {
    const quiz = parseFile(req.file.buffer, req.file.originalname);
    const id   = db.nextQuizId++;
    db.quizzes[id] = { id, createdAt: new Date().toISOString(), ...quiz };
    res.json({ ok: true, id, title: quiz.title, count: quiz.questions.length });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.patch('/api/quizzes/:id/activate', auth, (req, res) => {
  const id = Number(req.params.id);
  if (!db.quizzes[id]) return res.status(404).json({ error: 'QCM introuvable' });
  db.activeQuizId = id;
  db.sessions = {};   // Reset sessions lors du changement de QCM
  res.json({ ok: true });
});

app.delete('/api/quizzes/:id', auth, (req, res) => {
  const id = Number(req.params.id);
  if (id === db.activeQuizId) return res.status(400).json({ error: 'Impossible de supprimer le QCM actif' });
  delete db.quizzes[id];
  res.json({ ok: true });
});

// ══════════════════════════════════════════════════════════════════════════════
// API FORMATEUR — CONFIG
// ══════════════════════════════════════════════════════════════════════════════

app.get('/api/config', auth, (req, res) => {
  res.json({
    accessCode: db.config.accessCode,
    duration:   db.config.duration,
    qcmActive:  db.config.qcmActive
  });
});

app.patch('/api/config', auth, (req, res) => {
  const { active, teacherPwd, accessCode, duration } = req.body;
  if (active     !== undefined)              db.config.qcmActive  = !!active;
  if (teacherPwd && teacherPwd.length >= 4)  db.config.teacherPwd = teacherPwd;
  if (accessCode && accessCode.length >= 4)  db.config.accessCode = accessCode.toUpperCase().replace(/\s+/g,'');
  if (duration   && duration > 0)            db.config.duration   = parseInt(duration);
  res.json({ ok: true, active: db.config.qcmActive, accessCode: db.config.accessCode });
});

// ══════════════════════════════════════════════════════════════════════════════
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`QCM Final — http://localhost:${PORT}`));
