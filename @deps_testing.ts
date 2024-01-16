// Disables since this is a dependency file.
// deno-lint-ignore-file no-external-import no-unused-vars ban-unused-ignore no-namespace

// Sets the environment to test and imports the testing dependencies
Deno.env.set('ENVIRONMENT', 'test');

export * from 'https://deno.land/std@0.185.0/testing/asserts.ts';
export * from 'https://deno.land/std@0.185.0/testing/bdd.ts';
export * from 'https://deno.land/std@0.185.0/async/mod.ts';
