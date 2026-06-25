const PRODUCTION_ENV = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_REGION',
  'AWS_S3_BUCKET',
] as const;

export const validateEnv = (): void => {
  if (process.env.NODE_ENV === 'production') {
    const prodMissing = PRODUCTION_ENV.filter((key) => !process.env[key]?.trim());

    if (prodMissing.length > 0) {
      console.error(
        `Missing required production environment variables: ${prodMissing.join(', ')}`
      );
      process.exit(1);
    }
  }
};
