const merge = require("webpack-merge");
const baseConfig = require("./webpack.base.js");
const webpack = require("webpack");
const path = require("path");
const CleanWebpackPlugin = require("clean-webpack-plugin");

const config = {
  mode: "production",
  entry: ["babel-polyfill", "./assets/app.jsx", "./assets/app.scss"],
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "public")
  },
  plugins: [
    new CleanWebpackPlugin(["public"]),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("production")
    })
  ],
  module: {
    rules: [
      {
        include: [path.resolve("node_modules")],
        sideEffects: false
      }
    ]
  }
};

module.exports = merge(baseConfig, config);
