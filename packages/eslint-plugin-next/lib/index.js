module.exports = {
  rules: {
    'no-css-tags': require('./rules/no-css-tags'),
    'no-sync-scripts': require('./rules/no-sync-scripts'),
    'no-html-link-for-pages': require('./rules/no-html-link-for-pages'),
    'no-unwanted-polyfillio': require('./rules/no-unwanted-polyfillio'),
    'no-title-in-document-head': require('./rules/no-title-in-document-head'),
    'google-font-display': require('./rules/google-font-display'),
    'google-font-preconnect': require('./rules/google-font-preconnect'),
    'no-document-import-in-page': require('./rules/no-document-import-in-page'),
    'no-head-import-in-document': require('./rules/no-head-import-in-document'),
  },
  configs: {
    recommended: {
      plugins: ['@next/next'],
      rules: {
        '@next/next/no-css-tags': 1,
        '@next/next/no-sync-scripts': 1,
        '@next/next/no-html-link-for-pages': 1,
        '@next/next/no-unwanted-polyfillio': 1,
        '@next/next/no-title-in-document-head': 1,
        '@next/next/google-font-display': 1,
        '@next/next/google-font-preconnect': 1,
        '@next/next/no-document-import-in-page': 2,
        '@next/next/no-head-import-in-document': 2,
      },
    },
  },
}
