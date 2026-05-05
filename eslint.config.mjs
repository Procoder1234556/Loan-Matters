// eslint-config-next ships as native flat config arrays in v15+
// No FlatCompat needed — import and spread directly.
import nextCoreWebVitals from "eslint-config-next/core-web-vitals"
import nextTypescript from "eslint-config-next/typescript"

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  // Next.js core rules: React, hooks, accessibility, @next/next
  ...nextCoreWebVitals,

  // TypeScript rules (includes @typescript-eslint plugin)
  ...nextTypescript,

  // Project-level rule overrides
  {
    rules: {
      // Warn on unused vars/params, allow _ prefix convention
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // Downgrade to warn for gradual adoption
      "@typescript-eslint/no-explicit-any": "warn",
      // Common in Next.js page props patterns
      "@typescript-eslint/no-empty-object-type": "off",
      // Next.js handles fonts via next/font
      "@next/next/no-page-custom-font": "off",
      // Allow unescaped quotes in JSX
      "react/no-unescaped-entities": "off",
      // React 19 strict compiler rules — too aggressive for common patterns
      // (calling setState in useEffect body, Math.random in useMemo, etc.)
      // Shadcn/ui components and standard hooks trigger these legitimately
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
    },
  },

  // Global ignores
  {
    ignores: [".next/**", "node_modules/**", "public/**", "pnpm-lock.yaml", "*.min.js"],
  },
]

export default eslintConfig
