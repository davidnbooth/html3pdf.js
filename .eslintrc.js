module.exports = {
  'parserOptions': {
    'sourceType': 'module',
    'ecmaVersion': 2020
  },
  'env': {
    'browser': true,
    es6: true
  },
  'extends': 'eslint:recommended',
  'rules': {
    'indent': [
      'error',
      2,
      {'SwitchCase' : 1}
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    'quotes': [
      'error',
      'single'
    ],
    'no-unexpected-multiline': [
      'error'
    ],
    'brace-style': [
      'error',
      '1tbs',
      {'allowSingleLine': true}
    ],
    'no-var' : ['error'],
    'prefer-const' : ['error'],
    'no-unused-vars' : ['warn'],
    'eqeqeq' : ['error']
  },
  'globals': {
  }
}