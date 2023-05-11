const path = require('path');

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // https://nuxt.com/docs/getting-started/introduction#server-side-rendering
  ssr: true, // https://nuxt.com/docs/getting-started/deployment#static-hosting
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
    optimizeDeps: { // https://vitejs.dev/config/dep-optimization-options.html
      include: [
        // 'mtof',
        // 'sine-waves',
        // 'colormap',
        // 'abcjs',
        // 'lodash'
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
