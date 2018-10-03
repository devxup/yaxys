const merge = require("webpack-merge");
const baseConfig = require("./webpack.base.js");
const path = require("path");
const webpack = require("webpack");

const config = {
  mode: "development",
  entry: [
    "babel-polyfill",
    "./assets/app.jsx"
  ],
  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("development")
    })
  ],
  output: {
    publicPath: "/"
  },
  devtool: "inline-cheap-module-source-map",
  module: {
    rules: [
    ]
  }
}

module.exports = merge(baseConfig, config);
