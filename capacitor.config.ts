import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dhakabasha.app',
  appName: 'Dhaka Basha',
  webDir: 'public',
  server: {
    url: 'https://dhaka-basha.vercel.app',
    cleartext: true,
    allowNavigation: [
      "*"
    ]
  }
};

export default config;