import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.flatly',
  appName: 'Flatly',
  webDir: 'dist/mi-app-mobile/browser',
  server: {
    // Usamos 10.0.2.2 porque es el "localhost" de tu PC visto desde el emulador
    url: 'http://10.0.2.2:4200', 
    cleartext: true
  }
};

export default config;