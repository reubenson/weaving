const path = require('path');

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,
  // nitro: {
  //   output: {
  //     publicDir: path.join(__dirname, '/docs')
  //   }
  // },
  modules: [
    '@pinia/nuxt',
    '@element-plus/nuxt'
  ],
  app: {
    baseURL: '/weaving/'
  },
  plugins: ['~/plugins/mitt.client.js'],
  vite: {
    optimizeDeps: {
      include: [
        // 'mtof',
        'sine-waves'
      ]
    },
    build: {
      commonjsOptions: {
        // transformMixedEsModules: true,
        // https://github.com/vitejs/vite/issues/5668#issuecomment-968125763
        include: [
          // https://github.com/vitejs/vite/issues/2679
          // 'sine-waves/*',
          'sine-waves',
          'lodash',
          /mtof/,
          /sine-waves/,
          /lodash/,
          /colormap/,
          /abcjs/,
          /dayjs/,
          /escape-html/,
          '/node_modules/**'
        ],
        // exclude: [
          // 'mtof'
          // /sine-waves/
        // ]
      }
    }
  }
});
