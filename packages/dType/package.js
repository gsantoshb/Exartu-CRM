Package.describe({
    summary: 'dynamic types'
});

var both = ["client", "server"];

Package.on_use(function(api){
    api.use([
        "collection-hooks",
        "underscore",

    ], both);

    api.use([
        'deps',
    ], 'client');

    api.add_files('common.js', ['server']);
    api.add_files('util.js', ['server']);
    api.add_files('validator.js', ['server']);
    api.add_files('updater.js', ['server']);
    api.add_files('core.js', both);
    api.add_files('constructor.js', ['server']);
    api.add_files('basicFieldTypesDefinition.js', both);
    api.add_files('client.js', ['client']);
    api.export("dType")
});

Package.on_test(function(api){
    api.use(['dType', 'tinytest', 'test-helpers']);
    api.add_files('test/test.js', ['server']);
    api.add_files('test/fieldTest.js', ['server']);
    api.add_files('test/serviceTest.js', ['server']);
    api.add_files('test/relation.js', ['server']);
})
