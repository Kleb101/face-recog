const path = require('path');
const glob = require('glob');

const controllers = glob
  .sync('./src/js/**.js')
  .reduce((controllerPaths, controllerPath) => {
    controllerPaths[path.parse(controllerPath).name] = controllerPath;
    return controllerPaths;
  }, {});

module.exports = {
  entry: controllers,
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].bundle.js',
  },
};
