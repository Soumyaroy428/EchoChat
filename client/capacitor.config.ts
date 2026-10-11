export interface CapacitorConfig {
  appId: string;
  appName: string;
  webDir: string;
  server?: {
    url?: string;
    cleartext?: boolean;
  };
  plugins?: Record<string, any>;
}

const config: CapacitorConfig = {
  appId: "com.echochat.app",
  appName: "EchoChat",
  webDir: ".next",
  server: {
    // Points to production Vercel deployment when running natively on mobile
    url: "https://client-mu-taupe.vercel.app",
    cleartext: true,
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#05060b",
      showSpinner: false,
    },
  },
};

export default config;
