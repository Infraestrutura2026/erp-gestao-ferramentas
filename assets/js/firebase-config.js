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

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA-JN8TLCAo1slWd_VLxIeDnKT_AK1-lxA",
  authDomain: "erp-gestao-ferramentas.firebaseapp.com",
  projectId: "erp-gestao-ferramentas",
  storageBucket: "erp-gestao-ferramentas.firebasestorage.app",
  messagingSenderId: "1082813829556",
  appId: "1:1082813829556:web:aa9f2741885a89646ee2e1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
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
