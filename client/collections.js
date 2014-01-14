Contactables = new Meteor.Collection("contactables");
ContactableHandler = Meteor.subscribe('contactables', function () {
    _.forEach(ContactableHandler.observers, function (cb) {
        cb();
    });
});
ContactableHandler.observers = [];
ContactableHandler.wait = function (cb) {
    if (this.ready())
        cb();
    else
        this.observers.push(cb);
}

Messages = new Meteor.Collection("messages");
Meteor.subscribe('messages');

Activities = new Meteor.Collection("activities");
Meteor.subscribe('activities');