
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error('Error al inicializar la aplicación:', error);
  rootElement.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif;">
      <h1>Error al cargar la aplicación</h1>
      <p>${error instanceof Error ? error.message : 'Error desconocido'}</p>
      <p>Por favor, revisa la consola del navegador para más detalles.</p>
    </div>
  `;
}
