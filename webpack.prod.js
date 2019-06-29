const merge = require("webpack-merge")
const baseConfig = require("./webpack.base.js")
const webpack = require("webpack")
const path = require("path")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const CleanWebpackPlugin = require("clean-webpack-plugin")
const CopyWebpackPlugin = require("copy-webpack-plugin")
const AssetsPlugin = require("assets-webpack-plugin")
const assetsPluginInstance = new AssetsPlugin()

const config = {
  mode: "production",
  entry: ["@babel/polyfill", "./assets/app.jsx", "./assets/app.scss"],
  output: {
    filename: "bundle.[chunkhash].js",
    path: path.resolve(__dirname, "public"),
  },
  plugins: [
    new CleanWebpackPlugin(["public"]),
    new CopyWebpackPlugin([
      {
        from: "assets/app.scss",
        to: "app.scss",
      },
    ]),
    new MiniCssExtractPlugin({
      filename: "[name].[contenthash].css",
      chunkFilename: "[id].css",
    }),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("production"),
    }),
    assetsPluginInstance,
  ],
  module: {
    rules: [
      {
        include: [path.resolve("node_modules")],
        sideEffects: false,
      },
      {
        test: /\.(sass|scss)$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "sass-loader",
        ],
      },
    ],
  },

}

module.exports = merge(baseConfig, config)
