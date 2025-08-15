const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Standard Expo configuration
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;