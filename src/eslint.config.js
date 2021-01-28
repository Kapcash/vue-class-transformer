module.exports = {
  "space-before-blocks": "warn",
  "padding-line-between-statements": [
    "error",
    { blankLine: "always", prev: "*", next: "*"},
  ],
  "@typescript-eslint/member-delimiter-style": ["error"],
  semi: "off",
  "@typescript-eslint/semi": ["error", "always"],
  "no-return-assign": ["error", "except-parens"],
  "comma-dangle": ["error", "always-multiline"],
  "lines-between-class-members": ["error", "always", { exceptAfterSingleLine: true }],
  "quote-props": ["error", "as-needed"],
  "space-before-function-paren": ["error", {
    anonymous: "never",
    named: "never",
    asyncArrow: "always",
  }],
  "import/no-mutable-exports": "off",
  "no-unused-vars": "off",
  "import/order": "off",
  "no-console": "off",
  camelcase: "off",
}
