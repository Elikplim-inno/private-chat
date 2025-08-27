import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.038dbee9a6a94724b951136880f73ae0',
  appName: 'private-chat',
  webDir: 'dist',
  server: {
    url: 'https://038dbee9-a6a9-4724-b951-136880f73ae0.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Contacts: {
      permissions: ['read']
    }
  }
};

export default config;