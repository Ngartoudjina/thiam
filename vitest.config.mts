import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const root = fileURLToPath(new URL('./', import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      { find: /^@\//, replacement: root },
      // `server-only` lève une erreur hors de React Server Components : les
      // tests importent des modules serveur, on le neutralise.
      { find: /^server-only$/, replacement: `${root}tests/stubs/server-only.ts` },
    ],
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // La base embarquée (PGlite) démarre en une à deux secondes par fichier.
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
});
