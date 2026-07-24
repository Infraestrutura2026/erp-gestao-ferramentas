/**
 * Configuração do Firebase
 * 
 * INSTRUÇÕES:
 * 1. Acesse https://console.firebase.google.com
 * 2. Crie um novo projeto ou use um existente
 * 3. Clique em "</>" (Adicionar app da Web)
 * 4. Copie as configurações e cole abaixo
 * 
 * NÃO COMPARTILHE SUA API KEY PUBLICAMENTE!
 * Para repositórios públicos, use variáveis de ambiente.
 */

const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_PROJETO_ID",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID",
  appId: "SEU_APP_ID"
};

// Para produção com variáveis de ambiente (ex: Netlify/Vercel):
// const firebaseConfig = {
//   apiKey: process.env.FIREBASE_API_KEY,
//   authDomain: process.env.FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.FIREBASE_PROJECT_ID,
//   storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.FIREBASE_APP_ID
// };
