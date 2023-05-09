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
  plugins: ['~/plugins/mitt.client.js']
})
