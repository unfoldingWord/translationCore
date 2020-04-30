module.exports = {
  "extends": [
    "eslint-config-react-app",
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "prettier",
    "prettier/react"
  ],
  "parser": "babel-eslint",
  "parserOptions": {
    "ecmaVersion": 2018,
    "ecmaFeatures": {
      "impliedStrict": true,
      "classes": true
    }
  },
  "env": {
    "browser": true,
    "node": true,
    "es6": true,
    "jest": true
  },
  "plugins": [
    "react",
    "jest",
    "prettier",
    "import",
    "react-hooks",
    "jsdoc"
  ],
  "rules": {
    "array-callback-return": "error",
    "no-await-in-loop": "error",
    "object-curly-newline": ["error", { "multiline": true, "minProperties": 3 }],
    "brace-style": ["error", "1tbs", {"allowSingleLine": false}],
    "no-return-await": "error",
    "quote-props": ["error", "consistent"],
    "require-await": "error",
    "no-async-promise-executor": "error",
    "no-throw-literal": "warn",
    "no-nested-ternary": "error",
    "no-duplicate-imports": ["error", {"includeExports": false}],
    "import/order": ["error", {"groups": [ "builtin", "external", "internal", "parent", "sibling", "index" ]}],
    "import/first": "off",
    "import/default": "off",
    "import/namespace": "off",
    "indent": ["error", 2],
    "react/no-find-dom-node": "warn",
    "no-undef": "error",
    "no-unused-vars": "error",
    "no-debugger": "warn",
    "react/prop-types": "error",
    "curly": "error",
    "semi": ["error", "always", {"omitLastInOneLineBlock": true}],
    "semi-style": ["error", "last"],
    "no-console": "off",
    "react/jsx-uses-react": "error",
    "react/jsx-uses-vars": "error",
    "no-prototype-builtins": "off",
    "react/no-unescaped-entities": "off",
    "object-curly-spacing": ["error", "always"],
    "quotes": ["error", "single", {"allowTemplateLiterals": true}],
    "comma-dangle": ["error", "always-multiline"],
    "keyword-spacing": "error",
    "no-multi-spaces": "error",
    "no-trailing-spaces": "error",
    "arrow-body-style": ["error", "as-needed"],
    "space-before-function-paren": ["error", {"anonymous": "always", "named": "never", "asyncArrow": "always"}],
    "no-return-assign": "error",
    "padding-line-between-statements": [
      "error",
      { "blankLine": "always", "prev": "*", "next": ["function", "if", "for", "while", "switch", "try", ] },
      { "blankLine": "always", "prev": ["const", "let", "var"], "next": ["block", "block-like", "multiline-expression"] },
      { "blankLine": "always", "prev": ["block", "block-like", "multiline-expression"]  , "next":["const", "let", "var"]}
    ],
    "padded-blocks": ["error", "never"],
    "no-unused-expressions": "error",
    "func-names":"off",
    "no-underscore-dangle": "off",
    "consistent-return": "off",
    "radix": "off",
    "guard-for-in": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "jsx-a11y/anchor-has-content": "off",
    "jsx-a11y/anchor-is-valid": "off",
    "no-mixed-operators": "off",
    "jsx-a11y/alt-text": "off",
    "eqeqeq": "off",
    "jsdoc/require-returns-type": "warn",
    "jsdoc/valid-types": "warn"
  },
  "settings": {
    "react": {
      "createClass": "createReactClass", // Regex for Component Factory to use, default to "createReactClass"
      "pragma": "React",  // Pragma to use, default to "React"
      "version": "detect" // React version, default to the latest React stable release
    }
  }
}
