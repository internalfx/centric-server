module.exports = {
  "env": {
    // "browser": true,
    // "es6": true,
    // "node": true
  },
  "extends": [
    "plugin:vue/essential",
    "standard"
  ],
  "globals": {
    "Atomics": "readonly",
    "SharedArrayBuffer": "readonly"
  },
  "parserOptions": {
    // "ecmaVersion": 2018,
    // "sourceType": "module"
  },
  "plugins": [
    "html",
    "import",
    "node",
    "promise",
    "standard",
    "vue"
  ],
  "rules": {
  },
  "parser": "vue-eslint-parser",
  "parserOptions": {
    "parser": "babel-eslint",
    "sourceType": "module"
  }
};