import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.flatly',
  appName: 'Flatly',
  webDir: 'dist/mi-app-mobile/browser',
  server: {
    // Forzamos tu IP local de casa, no la de la VPN
    url: 'http://172.20.10.13:4200',
    cleartext: true
  }
};

export default config;