"use strict";

/*
This file is strictly for creating browserPreacher.js for index.html. It is not
intended to be used as a dependency. For that use npm, webpack and or browserify.
*/

const debug = process.env.NODE_ENV !== "production";

const webpack = require('webpack');
const path = require('path');

module.exports = {
  devtool: 'inline-sourcemap', //debug ? 'inline-sourcemap' : null,
  entry: path.join(__dirname, 'browser.js'),
  devServer: {
    inline: true,
    port: 3333,
    contentBase: "./",
    historyApiFallback: {
      index: '/index.html'
    }
  },
  output: {
    path: path.join(__dirname, 'dist'),
    // publicPath: "/js/",
    filename: 'browserPreacher.js'
  },
  module: {
  rules: [
    {
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        // options: {
        //   presets: ['env'],
        //   plugins: [require('babel-plugin-transform-object-rest-spread')
        //   "transform-object-assign",
      	// 	"transform-class-properties",
      	// 	"transform-object-rest-spread",
      	// 	"transform-export-extensions"]
        // }
      }
    }
  ]
},
  plugins: debug ? [] : [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false },
      mangle: true,
      sourcemap: false,
      beautify: false,
      dead_code: true
    })
  ]
};
