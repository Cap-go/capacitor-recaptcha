import type { CapacitorConfig } from '@capacitor/cli';

import pkg from './package.json';

const config: CapacitorConfig = {
  "appId": "app.capgo.recaptcha.example",
  "appName": "Recaptcha Example",
  "webDir": "dist",
  "plugins": {
    "Recaptcha": {
      "enterprise": true
    },
    "CapacitorUpdater": {
      "appId": "app.capgo.recaptcha.example",
      "autoUpdate": true,
      "autoSplashscreen": true,
      "directUpdate": "always",
      "defaultChannel": "production",
      "version": pkg.version
    }
  }
};

export default config;
