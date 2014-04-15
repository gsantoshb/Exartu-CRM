Package.describe({
    summary: 'dynamic types'
});

//Npm.depends({
//});

Package.on_use(function(api){
    api.use(['collection-hooks'],'server');

    api.add_files('common.js', ['server']);
    api.add_files('util.js', ['server']);
    api.add_files('validator.js', ['server']);
    api.add_files('updater.js', ['server']);
    api.add_files('core.js', ['server']);
    api.add_files('constructor.js', ['server']);
    api.export("dType")
});

Package.on_test(function(api){
    api.use(['dType', 'tinytest', 'test-helpers']);
    api.add_files('test/test.js', ['server']);
})