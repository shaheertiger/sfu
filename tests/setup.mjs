// Lets `node --test` load the app's TypeScript server modules directly:
// Node strips the types; this hook resolves extensionless imports and stubs `server-only`.
import { register } from 'node:module';

register('./hooks.mjs', import.meta.url);
