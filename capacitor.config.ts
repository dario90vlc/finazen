import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dariofernandez.finanzen',
  appName: 'FinanZen',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
