GoogleMaps.observers = [];
GoogleMaps._initialized = false;
GoogleMaps.wait = function (cb) {
    if (GoogleMaps._initialized) {
        cb('googleMaps');
    } else {
        GoogleMaps.observers.push(cb);
    }
};

Meteor.startup(function () {
    GoogleMaps.init({
        'sensor': true, //optional 
        'libraries': 'places',
        //'MY-GOOGLEMAPS-API-KEY',
        //optional 'language': 'en' 
        //optional 
    }, function () {
        GoogleMaps._initialized = true;
        _.each(GoogleMaps.observers, function (cb) {
            cb('googleMaps');
        })
        dep.changed();
    });
});
var dep=new Deps.Dependency;
GoogleMapsHandler={
    ready:function(){
        dep.depend();
        return GoogleMaps._initialized;
    }
}