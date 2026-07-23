# TechWall Frontend — Angular 22

Application frontend moderne pour les recommandations pédagogiques alimentées par l'IA.

---

## Architecture

### Structure des fichiers

```
src/
├── app/
│   ├── core/
│   │   └── services/
│   │       └── recommendation.service.ts     # API client pour /recommendations
│   ├── features/
│   │   └── home/
│   │       ├── home.component.ts             # Chat-like recommendation widget
│   │       ├── home.component.css
│   │       └── assets/
│   │           └── logo.jpg                   # Logo TechWall
│   └── app.component.ts                      # Root component
├── environments/
│   ├── environment.ts                         # Dev: localhost backend + clé dev
│   └── environment.prod.ts                    # Production: Railway URL + clé env variable
├── styles.css                                 # Styles globaux
└── main.ts                                    # Bootstrap
```

### Composants

#### `RecommendationService`
- Communique avec l'API `/recommendations`
- Envoie la clé API dans le header `Authorization: Bearer [key]`
- Gère la session utilisateur dans `localStorage`
- **Pourquoi**: Sépare la logique HTTP de la présentation

```typescript
submitGoal(goalText: string): Observable<RecommendationResponse> {
  const sessionId = this.getOrCreateSessionId();
  const headers = {
    'Authorization': `Bearer ${this.apiKey}`,
  };
  // POST to ${environment.apiUrl}/recommendations
}
```

#### `HomeComponent` (Chat Widget)
- Interface chat-like pour soumettre des objectifs
- Affiche les recommandations sous forme de cartes
- Icône TechWall en header
- **Pourquoi**: UX conversationnelle pour l'apprentissage personnalisé

---

## Configuration

### Dev (localhost)

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  apiKey: 'techwall-api-key-v1-dev',
};
```

Lancer le backend:
```bash
cd ../backend
npm run start:dev
```

Lancer le frontend:
```bash
npm run start
# http://localhost:4200
```

### Production (Netlify)

```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://techwall-app-backend.railway.app',
  apiKey: process.env['NG_APP_API_KEY'], // Passée par Netlify
};
```

La clé `NG_APP_API_KEY` est configurée dans **Netlify Dashboard → Site Settings → Build & deploy → Environment**.

---

## Build & Déploiement

### Build local (production)

```bash
npm run build

# Output: dist/frontend/browser/
```

### Déploiement sur Netlify

Configuration automatique via `netlify.toml`:
- Build: `npm run build`
- Publish: `dist/frontend/browser`
- Environment: `NG_APP_API_KEY` (configuré dans Netlify Dashboard)

Après push vers GitHub, Netlify redéploie automatiquement.

---

## Variables d'environnement

### `NG_APP_API_KEY` (Production uniquement)

**Qu'est-ce que c'est**: Clé API secrète pour authentifier les requêtes vers le backend

**Où c'est stocké**:
- ❌ PAS dans le code (`.env` ou hardcodé)
- ❌ PAS commité dans GitHub
- ✅ **Netlify Dashboard → Build & deploy → Environment**

**Pourquoi**: La clé doit être différente par environnement et ne jamais être exposée dans le code source

**Configuration Netlify**:

1. Aller à: Netlify Dashboard → Sites → techwall-app-frontend
2. Settings → Build & deploy → Environment
3. Ajouter une variable: `NG_APP_API_KEY` = `[valeur_de_railway_api_key]`
4. Aller à Railway → Project Settings → Variables
5. Copier la valeur de `API_KEY`
6. Re-trigger la build Netlify (automatique après changement de variables)

---

## Sécurité

### API Key Management

✅ **Ce qui est sécurisé**:
- Clé stockée en variable d'env Netlify (pas exposée en public)
- Clé injectée au build-time (jamais visible dans les sources)
- Clé envoyée via header `Authorization` (pas en URL)
- Backend valide la clé (`ApiKeyGuard`)
- Rate limiting: 10 req/min par IP

❌ **Ce qui n'est pas sécurisé** (et ne peut pas l'être):
- La clé API est visible dans le JavaScript compilé (car c'est du code client)
- Quelqu'un peut faire du reverse engineering du build Netlify
- **Solution**: La clé est "juste" pour protéger contre les abus, pas contre les utilisateurs malveillants
- **Cas d'usage réel**: Un utilisateur légitime ne peut pas faire 1000 requêtes/seconde

### CORS

Le backend n'accepte les requêtes CROSS-ORIGIN que depuis:
- `http://localhost:4200` (dev)
- `https://*.netlify.app` (production)

---

## Dépannage

### La clé API n'est pas chargée

**Symptôme**: `Authorization: Bearer undefined`

**Cause**: `NG_APP_API_KEY` n'est pas passée au build

**Solution**:
1. Vérifier Netlify → Build & deploy → Environment → `NG_APP_API_KEY` existe
2. Re-trigger le build: Netlify Dashboard → Deploys → Trigger deploy

### Erreur CORS dans le navigateur

**Symptôme**: "Access to XMLHttpRequest blocked by CORS policy"

**Cause**: Requête depuis une origine non-autorisée

**Solution**:
- Dev: Vérifier que le frontend tourne sur `http://localhost:4200`
- Production: Vérifier que Netlify URL est `https://*.netlify.app`

### Erreur 401 Unauthorized

**Symptôme**: "Invalid or missing API key"

**Cause**: Clé API ne correspond pas

**Solution**:
1. Vérifier que Railway `API_KEY` = Netlify `NG_APP_API_KEY`
2. Re-trigger le build Netlify après changement d'variables d'env

---

## Ressources

- [Angular 22 Guide](https://angular.io/docs)
- [Netlify Docs](https://docs.netlify.com)
- [DEPLOYMENT.md](../DEPLOYMENT.md) — Guide complet de déploiement
