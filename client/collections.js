Contactables = new Meteor.Collection("contactables", {
    transform: function (contactable) {
        if (contactable.person)
            contactable.displayName = contactable.person.lastName + ', ' + contactable.person.firstName + ' ' + contactable.person.middleName;
        if (contactable.organization)
            contactable.displayName = contactable.organization.organizationName;

        extendObject(contactable);

        return contactable;
    },
});
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

Jobs = new Meteor.Collection("jobs", {
    transform: function (contactable) {
        if (contactable.person)
            contactable.displayName = contactable.person.lastName + ', ' + contactable.person.firstName + ' ' + contactable.person.middleName;
        if (contactable.organization)
            contactable.displayName = contactable.organization.organizationName;

        return contactable;
    },
});
JobHandler = Meteor.subscribe('jobs', function () {
    _.forEach(Jobs.observers, function (cb) {
        cb();
    });
});
JobHandler.observers = [];
JobHandler.wait = function (cb) {
    if (this.ready())
        cb();
    else
        this.observers.push(cb);
}


Deals = new Meteor.Collection("deals", function () {
    _.forEach(Deals.observers, function (cb) {
        cb();
    });
});
DealHandler = Meteor.subscribe('deals', function () {
    _.forEach(Deals.observers, function (cb) {
        cb();
    });
});
DealHandler.observers = [];
DealHandler.wait = function (cb) {
    if (this.ready())
        cb();
    else
        this.observers.push(cb);
}


/*
 * Messages
 */
Messages = new Meteor.Collection("messages");
Meteor.subscribe('messages', function () {
    _.forEach(MessagesHandler.observers, function (cb) {
        cb();
    });
});
MessagesHandler = Meteor.subscribe('contactables', function () {
    _.forEach(ContactableHandler.observers, function (cb) {
        cb();
    });
});
MessagesHandler.observers = [];
MessagesHandler.wait = function (cb) {
    if (this.ready())
        cb();
    else
        this.observers.push(cb);
}

Conversations = new Meteor.Collection("conversations", {
    transform: function (conversation) {
        conversation.lastMessage = Messages.findOne({
            $or: [
                {
                    from: conversation.user1,
                    destination: conversation.user2
                },
                {
                    from: conversation.user2,
                    destination: conversation.user1
                }
            ]
        }, {
            sort: {
                createdAt: -1
            }
        });

        return conversation;
    }
});
Meteor.subscribe('conversations');

Activities = new Meteor.Collection("activities");
Meteor.subscribe('activities');

ObjTypes = new Meteor.Collection("objTypes");
Meteor.subscribe('objTypes');

LookUps = new Meteor.Collection("lookUps");
Meteor.subscribe('lookUps');

Meteor.subscribe('userData');

Roles = new Meteor.Collection("roles");
Meteor.subscribe('roles');

/*
 * extended subscribe
 */
var extendedSubscribe = function (colectionName, handler) {
    handler = Meteor.subscribe(colectionName, function () {
        _.forEach(handler.observers, function (cb) {
            cb();
        });
    });
    handler.observers = [];

    handler.wait = function (cb) {
        if (this.ready())
            cb();
        else
            this.observers.push(cb);
    }
}
/*
 * Tasks
 */
Tasks = new Meteor.Collection("tasks");
var TasksHandler = {};
extendedSubscribe("tasks", TasksHandler);