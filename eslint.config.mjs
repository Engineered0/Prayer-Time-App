import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // Disable unexpected 'any' error
      "react/no-unescaped-entities": "off",       // Allow unescaped characters in JSX
      "@typescript-eslint/no-unused-vars": "off", // Allow unused variables
    },
  },
];

export default eslintConfig;
