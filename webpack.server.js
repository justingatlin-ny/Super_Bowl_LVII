var fs = require('fs');
const path = require("path");
const webpack = require("webpack");
const nodeExternals = require('webpack-node-externals');
const envs = require('./utils/manageProcessDotEnv')();

const plugins = []

if (envs) {
  plugins.push(new webpack.DefinePlugin(envs));
}

const isDev = (process.env.NODE_ENV === 'development');

module.exports = {
  "mode": process.env.NODE_ENV || 'production',
    "target": "node",
    "watch": isDev,
    watchOptions: {
      aggregateTimeout: 600,
      // poll: 1000,
      ignored: ['htdocs', 'node_modules']
    },
    externals: [nodeExternals()],
    "entry": "./server/index.js",
    "output": {
        "path": __dirname + '/htdocs',
        "filename": "server-build.js"
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
                  plugins: ["@babel/plugin-proposal-class-properties"]
                }
              }
            },
            {
              test: /\.ejs$/, use: 'ejs-loader?variable=data'
            }
        ]
    },
    plugins: plugins,
    "stats": "errors-only"
}