const DEFAULT_DEV_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000'];

export const getAllowedOrigins = () => {
  const configuredOrigins = process.env.APP_URL?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return configuredOrigins?.length ? configuredOrigins : DEFAULT_DEV_ORIGINS;
};

