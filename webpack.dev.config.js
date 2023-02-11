const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const glob = require("glob");

const controllers = glob
  .sync("./src/js/**.js")
  .reduce((controllerPaths, controllerPath) => {
    controllerPaths[path.parse(controllerPath).name] = controllerPath;
    return controllerPaths;
  }, {});

module.exports = {
  mode: "development",
  entry: controllers,
  watch: true,
  devtool: "inline-source-map",
  plugins: [
    new HtmlWebpackPlugin({
      title: "Development",
    }),
  ],
  output: {
    filename: "js/[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
};
