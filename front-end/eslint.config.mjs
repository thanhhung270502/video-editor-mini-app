import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    plugins: {
      "react-hooks": pluginReactHooks,
    },
    settings: { react: { version: "detect" } },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      "react-hooks/set-state-in-effect": "off",
      // React scope no longer necessary with new JSX transform.
      "react/react-in-jsx-scope": "off",
    },
  },
  {
    rules: {
      "@next/next/no-img-element": "off",
      "@next/next/google-font-display": "off",
      "@next/next/google-font-preconnect": "off",
      "@next/next/no-page-custom-font": "off",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-loss-of-precision": "off",
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-empty-interface": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unnecessary-type-constraint": "off",
      "@typescript-eslint/no-extra-semi": "off",
      "@typescript-eslint/ban-types": "off",
      "camelcase": "off",
      "import/prefer-default-export": "off",
      "import/no-extraneous-dependencies": 0,
      "linebreak-style": "off",
      "max-classes-per-file": 0,
      "no-underscore-dangle": "off",
      "no-useless-escape": "off",
      "no-useless-catch": 0,
      "no-async-promise-executor": 0,
      "no-misleading-character-class": 0,
      "no-plusplus": "off",
      "no-prototype-builtins": "off",
      "no-control-regex": "off",
      "no-console": [1],
      "no-empty": "off",
      "no-constant-condition": "warn",
      "prefer-object-spread": 0,
      "prefer-const": "off",
      "prefer-rest-params": "off",
      "react/no-unescaped-entities": "off",
      "react/jsx-filename-extension": [0],
      "react/jsx-fragments": [0],
      "react/prop-types": "off",
      "react/jsx-no-target-blank": "off",
      "react/jsx-one-expression-per-line": [0, {
        "allow": "literal",
      }],
      "jsx-a11y/click-events-have-key-events": "off",
      "jsx-a11y/no-static-element-interactions": "off",
      "jsx-a11y/label-has-associated-control": "off",
      "jsx-a11y/img-redundant-alt": "off",
      "react-hooks/exhaustive-deps": ["warn", {
        "additionalHooks": "(useAsync|useDeepCompareEffect|useDeepCompareCallback|useDeepCompareMemo|useDeepCompareImperativeHandle|useDeepCompareLayoutEffect)",
      }],
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
      "tailwindcss/no-custom-classname": "off",
      "turbo/no-undeclared-env-vars": "off",
    }
  }
]);

export default eslintConfig;
