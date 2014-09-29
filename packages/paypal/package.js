Package.describe({
    summary: 'paypal integration'
});


var both = ["client", "server"];

Package.onUse(function(api){
    api.use([
        "iron:router",
    ], 'server');

    api.addFiles('listener.js', ['server']);

    api.export("paypal", both)
});

