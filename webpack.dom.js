var fs = require('fs');
const path = require("path");
const webpack = require("webpack");
const nodeExternals = require('webpack-node-externals');
const CopyPlugin = require("copy-webpack-plugin");

const envs = require('./utils/manageProcessDotEnv')();

const plugins = []

if (envs) {
  plugins.push(
    new webpack.DefinePlugin(envs),
    new CopyPlugin({
      patterns: [
        { from: 'src/root', to: '' }
      ]
    })
    );
}

const isDev = (process.env.NODE_ENV === 'development');

module.exports = {
    "mode": process.env.NODE_ENV || 'production',
    "target": "web",
    "entry": "./src/index.js",
    "watch": isDev,
    watchOptions: {
      aggregateTimeout: 600,
      // poll: 1000,
      ignored: ['htdocs', 'node_modules']
    },
    "output": {
        "path": __dirname + '/htdocs/public',
        "filename": "bundle.js",
        "publicPath": "/htdocs/public"
    },
    "devtool": "source-map",
    "module": {
        "rules": [
            {
              test: /\.js$/,
              exclude: /node_modules/,
              use: {
                loader: 'babel-loader',
                options: {
                  presets: ['@babel/preset-env', "@babel/preset-react"],
                  plugins: ["@babel/plugin-proposal-class-properties", "react-hot-loader/babel"]
                }
              }
            }
        ]
    },
    "stats": "errors-only",
    plugins: plugins
}