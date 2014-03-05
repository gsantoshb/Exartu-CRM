/*
 * extended subscribe
 */
var extendedSubscribe = function (colectionName, handlerName) {
    //    debugger;
    var handler = {};
    handler = Meteor.subscribe(colectionName, function () {
        _.forEach(handler.observers, function (cb) {
            cb(colectionName);
        });
    });
    handler.observers = [];

    handler.wait = function (cb) {
        if (this.ready())
            cb(colectionName);
        else
            this.observers.push(cb);
    }
    window[handlerName] = handler;
}

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

extendedSubscribe('contactables', 'ContactableHandler');

var getLookUpName = function (lookUpName, code) {
    //    debugger;
    var lookUp = LookUps.findOne({
        name: lookUpName
    });
    if (!lookUp)
        return;
    var lookUpValue = _.find(lookUp.items, function (item) {
        return item.code == code;
    });
    if (!lookUpValue)
        return;
    return lookUpValue.displayName;
}
Jobs = new Meteor.Collection("jobs", {
    transform: function (job) {
        job.displayName = job.publicJobTitle;
        job.industryName = getLookUpName('jobIndustry', job.industry);
        job.categoryName = getLookUpName('jobCategory', job.category);
        job.durationName = getLookUpName('jobDuration', job.duration);
        job.statusName = getLookUpName('jobStatus', job.status);
        _.each(job.candidates, function (candidate) {
            candidate.employeeInfo = Contactables.findOne({
                _id: candidate.employee
            });
            candidate.user = Meteor.users.findOne({
                _id: candidate.userId
            });

        });
        if (job.Customer) {
            job.CustomerInfo = Contactables.findOne({
                _id: job.Customer
            });
        }
        if (job.assignment) {
            job.assignmentInfo = Contactables.findOne({
                _id: job.assignment
            });
        }

        return job;
    },
});
extendedSubscribe('jobs', 'JobHandler');


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
MessagesHandler = Meteor.subscribe('messages', function () {
    _.forEach(MessagesHandler.observers, function (cb) {
        cb();
    });
});
//MessagesHandler = Meteor.subscribe('contactables', function () {
//    _.forEach(ContactableHandler.observers, function (cb) {
//        cb();
//    });
//});
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



LookUps = new Meteor.Collection("lookUps");
Meteor.subscribe('lookUps');

Meteor.subscribe('userData');

Roles = new Meteor.Collection("roles");
Meteor.subscribe('roles');


/*
 * Tasks
 */
Tasks = new Meteor.Collection("tasks", {
    transform: function (task) {
        task.user = Meteor.users.findOne({
            _id: task.userId
        });
        task.assignedUsers = _.map(task.assign, function (userId) {
            return Meteor.users.findOne({
                _id: userId
            });
        });
        var now = moment(new Date())
        if (task.completed == undefined) {
            task.completed = null;
        }
        if (now.isBefore(task.begin)) {
            task.state = Enums.taskState.future;
        } else {
            if (task.completed) {
                task.state = Enums.taskState.complited;
            } else {
                if (now.isBefore(task.end)) {
                    task.state = Enums.taskState.pending;
                } else {
                    task.state = Enums.taskState.closed;
                }

            }
        }
        return task;
    }
});
extendedSubscribe("tasks", 'TasksHandler');
/*
 * objTypes
 */
ObjTypes = new Meteor.Collection("objTypes");
extendedSubscribe('objTypes', 'ObjTypesHandler');

// CollectionFS

ContactablesFS = new CollectionFS('contactables', {
    autopublish: false
});
Meteor.subscribe('contactableFiles');
