import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { configurarAmbiente } from './app/ambiente';
import './index.css';

configurarAmbiente();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
