import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

if (import.meta.env.PROD) {
  console.log = () => {};
  console.info = () => {};
  console.debug = () => {};
  console.trace = () => {};
}

const rootElement = document.getElementById('root');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
      <App />
  </React.StrictMode>
);
