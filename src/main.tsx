// Electromagnetic Beat Lab - Main Entry Point
// React application bootstrap with error handling and performance monitoring

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// Global error handling
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // Could add error reporting service here
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Could add error reporting service here
});

// Performance monitoring
if ('performance' in window && 'measure' in window.performance) {
  window.performance.mark('app-start');
  
  window.addEventListener('load', () => {
    window.performance.mark('app-loaded');
    window.performance.measure('app-load-time', 'app-start', 'app-loaded');
    
    const measure = window.performance.getEntriesByName('app-load-time')[0];
    console.log(`App loaded in ${measure.duration.toFixed(2)}ms`);
  });
}

// Check for Web Audio API support
if (!window.AudioContext && !(window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext) {
  console.warn('Web Audio API not supported. Some features may not work.');
}

// Initialize app
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
