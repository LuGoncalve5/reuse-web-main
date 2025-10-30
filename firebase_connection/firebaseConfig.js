// firebaseConfig.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";

// 🔹 Configurações do seu projeto Firebase
const firebaseConfig = {
	apiKey: "AIzaSyDfYcoijl5D_0EJk4pO1SjPFjeOnzzrsTM",
	authDomain: "reuse-1512f.firebaseapp.com",
	projectId: "reuse-1512f",
	storageBucket: "reuse-1512f.firebasestorage.app",
	messagingSenderId: "296992709188",
	appId: "1:296992709188:web:d1135e3a8beee9ac1f7a11"
};

// 🔹 Inicializa o app Firebase uma única vez
const app = initializeApp(firebaseConfig);

// 🔹 Exporta as instâncias globais
export const auth = getAuth(app);
export const database = getDatabase(app);
