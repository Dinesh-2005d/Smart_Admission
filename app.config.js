/**
 * app.config.js — Dynamic Expo config
 * 
 * This wraps app.json and injects environment variables into the app bundle
 * so they're available in EAS builds (where .env files are NOT included).
 * 
 * For EAS builds, set secrets via:
 *   eas secret:create --name EXPO_PUBLIC_GROQ_API_KEY --value <your-key> --scope project
 */

const IS_DEV = process.env.APP_VARIANT === 'development';

module.exports = ({ config }) => {
  return {
    ...config,
    extra: {
      ...config.extra,
      // This injects the env variable into the JS bundle via Constants.expoConfig.extra
      EXPO_PUBLIC_GROQ_API_KEY: process.env.EXPO_PUBLIC_GROQ_API_KEY || '',
    },
  };
};
