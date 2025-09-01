import Keycloak from 'keycloak-js';

// Keycloak configuration
const keycloakConfig = {
  url: process.env.REACT_APP_KEYCLOAK_URL || 'http://localhost:8080',
  realm: process.env.REACT_APP_KEYCLOAK_REALM || 'ebl-realm',
  clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID || 'ebl-app',
};

// Initialize Keycloak instance
const keycloak = new Keycloak(keycloakConfig);

// Initialize Keycloak and return promise
export const initKeycloak = (): Promise<boolean> => {
  return keycloak.init({
    onLoad: 'check-sso', // Don't redirect to login immediately
    silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
    checkLoginIframe: false, // Disable iframe check for development
  });
};

export default keycloak;