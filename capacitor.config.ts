import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.github.skunkie.torrplayclient',
  appName: 'TorrPlay',
  webDir: 'out',
  server: {
    cleartext: true,
    androidScheme: 'http'
  },
  android: {
    allowMixedContent: true,
  },
  plugins: {
    EdgeToEdge: {
      dark: {
        backgroundColor: '#17171C',
        statusBarColor: '#17171C',
      },
      light: {
        backgroundColor: '#FFFFFF',
        statusBarColor: '#FFFFFF',
      },
    },
  },
};

export default config;