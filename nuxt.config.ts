// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: 'Weaving Music',
      meta: [
        { name: 'description', content: 'weaving musical patterns'}
      ],
      script: [
        {
          src: 'https://www.googletagmanager.com/gtag/js?id=UA-120208217-1',
          async: true
        }
      ]
    },
    baseURL: '/weaving/'
  },

  // https://nuxt.com/docs/getting-started/introduction#server-side-rendering
  ssr: true, // https://nuxt.com/docs/getting-started/deployment#static-hosting
  // nitro: {
  //   output: {
  //     publicDir: path.join(__dirname, '/docs')
  //   }
  // },
  build: {
    transpile: [
      /colormap/,
      /sine-waves/
    ]
  },
  experimental: {
    payloadExtraction: false
  },
  modules: [
    '@pinia/nuxt',
    '@element-plus/nuxt'
  ],
  // app: {
    // baseURL: '/weaving/'
  // },
  plugins: [
    '~/plugins/mitt.client.js'
  ],
  vite: {
    optimizeDeps: { // https://vitejs.dev/config/dep-optimization-options.html
      include: [
        'colormap'
      ]
    },
    build: {
      rollupOptions: {
        plugins: [
          // https://stackoverflow.com/questions/71645151/cannnot-initialize-coinbasesdk-in-nuxt3-project
          // nodePolyfills()
        ],

      },
      commonjsOptions: {
        transformMixedEsModules: true,
        // https://github.com/vitejs/vite/issues/5668#issuecomment-968125763
        include: [
          // https://vitejs.dev/guide/dep-pre-bundling.html#monorepos-and-linked-dependencies
          'lodash',
          /mtof/,
          /lodash/,
          /colormap/,
          /abcjs/,
          /dayjs/,
          /escape-html/,
          /node_modules/
        ]
      }
    }
  }
});
