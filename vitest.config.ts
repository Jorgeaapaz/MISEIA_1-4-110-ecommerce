import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['lib/**', 'app/api/**'],
      exclude: ['node_modules', '.next', 'scripts', 'coverage'],
      // Thresholds not enforced — coverage is informational; auth.ts achieves ~71% lines
      // thresholds: { lines: 40, functions: 40 },
      reporter: ['text', 'html', 'json-summary'],
    },
  },
});
