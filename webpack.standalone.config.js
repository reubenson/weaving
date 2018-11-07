/* eslint-disable */
'use strict';

const path = require('path');
module.exports = {
  entry: './src/main/lib/app.js',
  // module: {
  //   rules: [
  //     {
  //       test: /\.node$/,
  //       use: 'node-loader'
  //     }
  //   ]
  // },
  // resolve: {
  //   root: path.resolve('./src/main/lib')
  //   // extensions: ['.js']
  // },
  // context: x,
  // resolve: {
  //   // alias:{
  //   //   mydir: path.resolve( __dirname, 'path', 'to', 'mydir' )
  //   // },
  // },
  // externals: [
  //   ...Object.keys(dependencies || {})
  // ],
  // module: {
  //   rules: [
  //     {
  //       // test: /\.(js)$/,
  //       // enforce: 'pre',
  //       exclude: /node_modules/,
  //       // use: {
  //       //   loader: 'eslint-loader',
  //       //   options: {
  //       //     formatter: require('eslint-friendly-formatter')
  //       //   }
  //       // }
  //     }
  //   ]
  // },
  // },
  // externals: [
  //   ...Object.keys(dependencies || {})
  // ],
  // externals: {
  //   fs: 'fs',
  //   lodash : {
  //     commonjs: 'lodash',
  //     amd: 'lodash',
  //     root: '_' // indicates global variable
  //   }
  // },
  externals: {
    midi: "require('midi')"
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  target: 'node',
};
