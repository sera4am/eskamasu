import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/**/*.test.*'],
    exclude: ['dist/**', 'docs/**'],
    environment: 'node',
  },
})
