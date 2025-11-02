import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import 'snes.css/dist/snes.min.css';
import './index.css';

// Tratamento global de erros
window.addEventListener('error', (event) => {
  // Só logar erros que não sejam null ou undefined
  if (event.error && event.error !== null) {
    console.error('Erro global capturado:', event.error);
  }
  // Evitar que o erro seja exibido na tela
  event.preventDefault();
});

window.addEventListener('unhandledrejection', (event) => {
  // Só logar promises rejeitadas que tenham conteúdo
  if (event.reason && event.reason !== null) {
    console.error('Promise rejeitada:', event.reason);
  }
  // Evitar que o erro seja exibido na tela
  event.preventDefault();
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster position="top-right" />
    </BrowserRouter>
  </React.StrictMode>
);
