// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Tell Expo to use Webpack for web builds
config.web = {
    bundler: 'webpack',
};

module.exports = config;
