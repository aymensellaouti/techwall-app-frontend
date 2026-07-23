export const environment = {
  production: true,
  // URL publique du backend Railway (domaine .up.railway.app)
  apiUrl: 'https://techwall-app-backend-production.up.railway.app',
  // NOTE: une clé API dans un bundle SPA n'est jamais secrète (elle part au navigateur).
  // Elle sert juste à filtrer les appels basiques. La vraie protection reste côté backend
  // (rate limiting, CORS, et à terme restriction par origine/referer).
  apiKey: '771d848d96b5792d2121942fb383267916667778e5ecba1ccb5c847302efac25',
};
