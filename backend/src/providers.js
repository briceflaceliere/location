var providers = [];

module.exports.addProvider = function (provider) {
    providers.push(provider);
    return this;
};

module.exports.getProviders = function () {
    return providers;
};