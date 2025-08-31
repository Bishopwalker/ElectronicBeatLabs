// Electromagnetic Beat Lab - Global Styles
// Advanced CSS-in-JS styling with electromagnetic field aesthetics

import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  /* Reset and Base Styles */
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 16px;
    line-height: 1.5;
    color: #e0e0e0;
    background: #000000;
    overflow-x: hidden;
  }

  body {
    background: 
      radial-gradient(circle at 20% 20%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(120, 198, 121, 0.2) 0%, transparent 50%),
      linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 50%, #0a1a1a 100%);
    background-attachment: fixed;
    min-height: 100vh;
  }

  /* Electromagnetic Field Background Animation */
  body::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: 
      radial-gradient(ellipse at center, transparent 20%, rgba(0, 255, 136, 0.03) 60%),
      conic-gradient(from 0deg at 50% 50%, 
        transparent, 
        rgba(255, 107, 0, 0.05) 60deg, 
        transparent 120deg,
        rgba(138, 43, 226, 0.05) 180deg,
        transparent 240deg,
        rgba(0, 191, 255, 0.05) 300deg,
        transparent
      );
    animation: electromagnetic-pulse 8s ease-in-out infinite;
    pointer-events: none;
    z-index: -1;
  }

  @keyframes electromagnetic-pulse {
    0%, 100% { 
      opacity: 0.3; 
      transform: scale(1) rotate(0deg);
    }
    33% { 
      opacity: 0.6; 
      transform: scale(1.02) rotate(120deg);
    }
    66% { 
      opacity: 0.4; 
      transform: scale(0.98) rotate(240deg);
    }
  }

  /* Scrollbar Styling */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: linear-gradient(45deg, #ff6b00, #8a2be2);
    border-radius: 4px;
    box-shadow: 0 0 10px rgba(255, 107, 0, 0.5);
  }

  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(45deg, #ff8533, #9944d9);
    box-shadow: 0 0 15px rgba(255, 107, 0, 0.7);
  }

  /* Typography */
  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    margin-bottom: 0.5em;
    color: #ffffff;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
  }

  h1 {
    font-size: 2.5rem;
    background: linear-gradient(45deg, #ff6b00, #00ff88, #8a2be2);
    background-size: 300% 300%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: electromagnetic-gradient 3s ease-in-out infinite;
  }

  h2 {
    font-size: 2rem;
    color: #00ff88;
    text-shadow: 0 0 15px rgba(0, 255, 136, 0.6);
  }

  h3 {
    font-size: 1.5rem;
    color: #ff6b00;
    text-shadow: 0 0 10px rgba(255, 107, 0, 0.5);
  }

  @keyframes electromagnetic-gradient {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }

  /* Input and Form Styling */
  input, select, button, textarea {
    font-family: inherit;
    font-size: inherit;
    border: none;
    outline: none;
    background: rgba(255, 255, 255, 0.05);
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 0.75rem;
    transition: all 0.3s ease;
  }

  input:focus, select:focus, textarea:focus {
    background: rgba(255, 255, 255, 0.08);
    border-color: #ff6b00;
    box-shadow: 
      0 0 0 2px rgba(255, 107, 0, 0.2),
      0 0 20px rgba(255, 107, 0, 0.3);
  }

  /* Button Styling */
  button {
    cursor: pointer;
    background: linear-gradient(45deg, #ff6b00, #8a2be2);
    border: 1px solid transparent;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    position: relative;
    overflow: hidden;
  }

  button:hover {
    background: linear-gradient(45deg, #ff8533, #9944d9);
    box-shadow: 
      0 0 20px rgba(255, 107, 0, 0.4),
      0 0 40px rgba(138, 43, 226, 0.3);
    transform: translateY(-1px);
  }

  button:active {
    transform: translateY(0);
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  /* Electromagnetic Button Effect */
  button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: left 0.5s;
  }

  button:hover::before {
    left: 100%;
  }

  /* Glass Panel Styling */
  .glass-panel {
    background: rgba(255, 255, 255, 0.02);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    position: relative;
    overflow: hidden;
  }

  .glass-panel::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 107, 0, 0.6),
      rgba(0, 255, 136, 0.6),
      rgba(138, 43, 226, 0.6),
      transparent
    );
    animation: electromagnetic-line 3s ease-in-out infinite;
  }

  @keyframes electromagnetic-line {
    0%, 100% { transform: translateX(-100%); }
    50% { transform: translateX(100%); }
  }

  /* Control Panel Styling */
  .control-panel {
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 107, 0, 0.3);
    border-radius: 12px;
    padding: 1rem;
    box-shadow: 
      0 4px 16px rgba(255, 107, 0, 0.2),
      inset 0 1px 0 rgba(255, 107, 0, 0.1);
  }

  /* Frequency Display Styling */
  .frequency-display {
    font-family: 'Courier New', monospace;
    font-size: 2rem;
    font-weight: 700;
    color: #00ff88;
    text-shadow: 
      0 0 10px rgba(0, 255, 136, 0.6),
      0 0 20px rgba(0, 255, 136, 0.4),
      0 0 40px rgba(0, 255, 136, 0.2);
    animation: frequency-pulse 2s ease-in-out infinite;
  }

  @keyframes frequency-pulse {
    0%, 100% { 
      text-shadow: 
        0 0 10px rgba(0, 255, 136, 0.6),
        0 0 20px rgba(0, 255, 136, 0.4),
        0 0 40px rgba(0, 255, 136, 0.2);
    }
    50% { 
      text-shadow: 
        0 0 15px rgba(0, 255, 136, 0.8),
        0 0 30px rgba(0, 255, 136, 0.6),
        0 0 60px rgba(0, 255, 136, 0.4);
    }
  }

  /* Status Indicator Styling */
  .status-indicator {
    display: inline-block;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    margin-right: 0.5rem;
    position: relative;
  }

  .status-indicator.inactive {
    background: #666;
  }

  .status-indicator.charging {
    background: #ffaa00;
    animation: status-pulse 1s ease-in-out infinite;
  }

  .status-indicator.active {
    background: #00ff88;
    animation: status-pulse 1.5s ease-in-out infinite;
  }

  .status-indicator.resonant {
    background: #ff6b00;
    animation: status-pulse 0.8s ease-in-out infinite;
  }

  .status-indicator.critical {
    background: #ff0066;
    animation: status-pulse 0.5s ease-in-out infinite;
  }

  @keyframes status-pulse {
    0%, 100% { 
      opacity: 1; 
      transform: scale(1);
      box-shadow: 0 0 0 0 currentColor;
    }
    50% { 
      opacity: 0.7; 
      transform: scale(1.2);
      box-shadow: 0 0 0 8px transparent;
    }
  }

  /* Tab Styling */
  .tab-container {
    display: flex;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    margin-bottom: 1rem;
  }

  .tab-button {
    padding: 0.75rem 1.5rem;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
  }

  .tab-button.active {
    color: #ff6b00;
    border-bottom-color: #ff6b00;
    box-shadow: 0 0 10px rgba(255, 107, 0, 0.3);
  }

  .tab-button:hover:not(.active) {
    color: rgba(255, 255, 255, 0.8);
    background: rgba(255, 255, 255, 0.05);
  }

  /* Slider Styling */
  .slider-container {
    position: relative;
    margin: 1rem 0;
  }

  .slider {
    -webkit-appearance: none;
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: linear-gradient(
      90deg,
      rgba(255, 107, 0, 0.3),
      rgba(0, 255, 136, 0.5),
      rgba(138, 43, 226, 0.3)
    );
    outline: none;
    cursor: pointer;
  }

  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: linear-gradient(45deg, #ff6b00, #00ff88);
    border: 2px solid #ffffff;
    box-shadow: 
      0 0 10px rgba(255, 107, 0, 0.5),
      0 0 20px rgba(0, 255, 136, 0.3);
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .slider::-webkit-slider-thumb:hover {
    transform: scale(1.2);
    box-shadow: 
      0 0 15px rgba(255, 107, 0, 0.7),
      0 0 30px rgba(0, 255, 136, 0.5);
  }

  .slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: linear-gradient(45deg, #ff6b00, #00ff88);
    border: 2px solid #ffffff;
    box-shadow: 
      0 0 10px rgba(255, 107, 0, 0.5),
      0 0 20px rgba(0, 255, 136, 0.3);
    cursor: pointer;
    transition: all 0.3s ease;
  }

  /* Pattern Visualization */
  .pattern-visualization {
    width: 100%;
    height: 300px;
    background: radial-gradient(circle at center, 
      rgba(0, 0, 0, 0.8) 0%, 
      rgba(0, 0, 0, 0.95) 100%
    );
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    position: relative;
    overflow: hidden;
  }

  /* Loading Animation */
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top: 3px solid #ff6b00;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    html {
      font-size: 14px;
    }

    h1 {
      font-size: 2rem;
    }

    .glass-panel {
      padding: 1rem;
      border-radius: 12px;
    }

    .control-panel {
      padding: 0.75rem;
    }

    .tab-button {
      padding: 0.5rem 1rem;
      font-size: 0.8rem;
    }
  }

  @media (max-width: 480px) {
    html {
      font-size: 12px;
    }

    h1 {
      font-size: 1.8rem;
    }

    .glass-panel {
      padding: 0.75rem;
      border-radius: 8px;
    }

    .pattern-visualization {
      height: 200px;
    }
  }

  /* Accessibility */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

  /* High contrast mode */
  @media (prefers-contrast: high) {
    body {
      background: #000000;
      color: #ffffff;
    }

    .glass-panel {
      background: rgba(255, 255, 255, 0.1);
      border: 2px solid #ffffff;
    }

    button {
      background: #ffffff;
      color: #000000;
      border: 2px solid #ffffff;
    }
  }
`;

export default GlobalStyles;