const webpack = require("webpack");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
let nodeExternals = require('webpack-node-externals');
let plugins = [new CleanWebpackPlugin()];
const production = process.env.NODE_ENV === "production";

if (production) {
  console.log("creating production build");
  plugins.push(
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": '"production"'
    }),
    new UglifyJsPlugin({
      uglifyOptions: {
        compress: true,
        ecma: 5,
        mangle: true
      },
      sourceMap: true
    })
  );
}

module.exports =
  //for building the umd distribution
  {
    entry: "./src/main.ts",
    output: {
      filename: "main.js",
      path: __dirname + "/lib",
      libraryTarget: "umd",
      library: "blink-mind-react"
    },
    externals: [nodeExternals()],
    plugins: plugins,
    module: {
      rules: [
        {
          enforce: "pre",
          test: /\.js$/,
          loader: "source-map-loader"
        },
        {
          test: /\.tsx?$/,
          loader: "ts-loader"
        },
        {
          test: /\.scss?$/,
          use: [
            "style-loader",
            "css-loader",
            "sass-loader"
          ]
        }
      ]
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"]
    },
    devtool: production ? "source-map" : "cheap-module-eval-source-map",
    mode: production ? "production" : "development",
  };
