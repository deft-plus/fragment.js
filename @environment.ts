/** Environment variables. */
export type Environment = 'development' | 'production' | 'test';

/** Returns the current environment. */
export const environment = Object.assign(
  () => (Deno.env.get('ENVIRONMENT') ?? 'development') as Environment,
  {
    /** Whether the current environment is development. */
    isDevelopment: () => Deno.env.get('ENVIRONMENT') === 'development',
    /** Whether the current environment is production. */
    isProduction: () => Deno.env.get('ENVIRONMENT') === 'production',
    /** Whether the current environment is test. */
    isTest: () => Deno.env.get('ENVIRONMENT') === 'test',
  },
);
