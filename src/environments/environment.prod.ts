export const environment = {
  production: true,
  // URL de production Railway (obtenue après déploiement)
  apiUrl: 'https://techwall-app-backend.railway.app',
  // NOTE: une clé API dans un bundle SPA n'est jamais secrète (elle part au navigateur).
  // Elle sert juste à filtrer les appels basiques. La vraie protection reste côté backend
  // (rate limiting, CORS, et à terme restriction par origine/referer).
  apiKey: 'techwall-api-key-v1',
};
