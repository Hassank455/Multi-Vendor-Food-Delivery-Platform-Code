import type { Configuration } from 'lint-staged'

export default {
  '*.{js,jsx,ts,tsx}': ['pnpm lint:fix', 'pnpm lint:check'],
  '*.{js,jsx,ts,tsx,json,yml}': ['pnpm format:fix', 'pnpm format:check'],
  '*.{ts,tsx}': [() => 'pnpm type:check'],
} satisfies Configuration
