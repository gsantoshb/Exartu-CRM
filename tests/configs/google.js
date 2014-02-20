var assert = require('assert');

suite('Google', function () {
    test('Check if google configurations are ready', function (done, server) {
        server.eval(function () {
            emit('check', !ExartuConfig.GoogleConfig_clientId || !ExartuConfig.GoogleConfig_clientSecret);
        }).once('check', function (config) {
            assert.equal(config, false);
            done();
        });
    });
});