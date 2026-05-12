// Electromagnetic Beat Lab - Main Entry Point
// React application bootstrap with error handling and performance monitoring

import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { attachRAGConsole } from './utils/ragConsole';

// Global error handling
window.addEventListener('error', (event) => {
  // Could add error reporting service here
});

window.addEventListener('unhandledrejection', (event) => {
  // Could add error reporting service here
});

// Performance monitoring
if ('performance' in window && 'measure' in window.performance) {
  window.performance.mark('app-start');
  
  window.addEventListener('load', () => {
    window.performance.mark('app-loaded');
    window.performance.measure('app-load-time', 'app-start', 'app-loaded');
    
    const measure = window.performance.getEntriesByName('app-load-time')[0];
  });
}

// Check for Web Audio API support
if (!window.AudioContext && !(window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext) {
}

// Initialize app
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);

// 🔥 STRICT MODE DISABLED - Prevents double-mounting in dev
// This avoids duplicate AudioContexts and WebSocket connections
root.render(<App />);

// Attach RAG console — prints live index status + exposes window.ragStatus()
// and window.showRAGPipeline() helpers. Polls every 30s for re-index events.
attachRAGConsole();