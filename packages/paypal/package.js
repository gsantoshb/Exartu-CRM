Package.describe({
    summary: 'paypal integration'
});


var both = ["client", "server"];

Package.on_use(function(api){
    api.use([
        "iron-router",
    ], 'server');

    api.add_files('listener.js', ['server']);

    api.export("paypal")
});

