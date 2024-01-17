module.exports = function override(config, env) {

    // This is added because complaining about parsing source maps of walletconnect
    config.ignoreWarnings = [/Failed to parse source map/];

    return config;
}
