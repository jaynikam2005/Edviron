export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    uri: process.env.MONGODB_URI || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
  },
  payment: {
    apiKey: process.env.PAYMENT_API_KEY || '',
    pgKey: process.env.PG_KEY || '',
    baseUrl: process.env.PAYMENT_BASE_URL || 'https://dev-vanilla.edviron.com',
  },
  apiKey: process.env.API_KEY || '',
});
