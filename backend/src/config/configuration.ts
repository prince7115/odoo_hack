export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  mongodbUri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/assetflow_db',
  jwt: {
    secret: process.env.JWT_SECRET ?? 'assetflow-secret',
    expirationMs: parseInt(process.env.JWT_EXPIRATION_MS ?? '86400000', 10),
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID ?? '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL ?? 'http://localhost:3000/api/auth/google/callback',
  },
  app: {
    adminEmail: process.env.ADMIN_EMAIL ?? 'admin@assetflow.com',
    frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  },
});
