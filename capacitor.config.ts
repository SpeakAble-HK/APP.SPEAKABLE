import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.speakablehk.app',
  appName: 'SpeakAbleHK',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#006479",
      androidSplashResourceName: "splash",
      showSpinner: false,
    },
  },
};

export default config;
