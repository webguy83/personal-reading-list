import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular({ jit: true })],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/vitest-setup.ts'],
    include: ['src/**/*.spec.ts'],
    exclude: ['src/app/app.spec.ts', 'e2e/**'],
    server: {
      deps: {
        inline: ['rxfire', '@angular/fire'],
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/app/**/*.ts'],
      exclude: ['src/app/**/*.spec.ts', 'src/app/**/*.html'],
    },
  },
});
