Package.describe({
    summary: 'show a progress bar in the client for work done in the server'
});


var both = ["client", "server"];

Package.onUse(function(api){
    api.use(['templating','underscore', 'deps'],'client');


    api.export("ServerProgress",  ["client", "server"]);

    api.addFiles('server.js', 'server');
    api.addFiles('client.js', 'client');

    api.addFiles('view/bar.html', 'client');
    api.addFiles('view/bar.js', 'client');
});

