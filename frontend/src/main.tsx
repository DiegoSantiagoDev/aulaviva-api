import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { configurarAmbiente } from './app/ambiente.ts';
import './index.css';
import './styles/tokens.css';
import './styles/compartilhado.css';

configurarAmbiente();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
