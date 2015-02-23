var task;
var Error = {};

//todo: the logic for the linked entities is almost the same in msgs and taskAdd. We should do some template to use it in both places.
var typeDep = new Tracker.Dependency();
var linkedDep = new Tracker.Dependency();
var link = function (link) {
    if (_.findWhere(task.links, {
            id: link.id
        }))
        return;

    task.links.push(link);

};

var taskDep = new Tracker.Dependency;
var errorDep = new Tracker.Dependency;

var addDisabled = new ReactiveVar(false);
var taskUpdate = function (cb) {
    if (task._id) {
        Tasks.update({
                _id: task._id
            }, {
                $set: {
                    begin: task.begin ? new Date(task.begin): task.begin,
                    end: task.end ? new Date(task.end): task.end,
                    assign: task.assign,
                    msg: task.msg,
                    completed: task.completed,
                    links: task.links,
                    inactive: task.inactive
                }
            },
            function () {
                if (cb)
                    cb();
            }
        );
    }
};


var createTask = function (task) {
        if (task && task.links && task.links[0] && task.links.length==1) {
            var c = Contactables.findOne({_id: task.links[0].id});
            if (c && c.Contact && c.Contact.client) {
                task.links.push({id: c.Contact.client, type: Enums.linkTypes.contactable.value})
            };
        };

        addDisabled.set(false);
        var task = task || {};

        var definition = {
            begin: task.begin ? new Date(task.begin): new Date(),
            end: task.end ? new Date(task.end): new Date(),
            assign: task.assign || [Meteor.userId()],
            msg: task.msg,
            completed: task.completed,
            inactive: task.inactive,
            links: task.links || []
//    reactiveProps: {}
        };
        if (task._id)
            definition._id = task._id;
        return definition;
//  return new Utils.ObjectDefinition(definition);
    }
    ;

Template.addEditTask.helpers({

    addDisabled: function () {
        return addDisabled.get();
    },
    isEditing: function () {
        return !!task._id;
    },
    task: function () {
        if (!task) {
            var param = {};
            if (this) {
                param = this[0]
            }
            task = createTask(param);
        }
        taskDep.depend();
        return task;
    },
    users: function () {
        return Meteor.users.find({});
    },
    isSelected: function () {
        return task.assign == this._id;
    },
    error: function () {
        errorDep.depend();
        return Error;
    },
    hasError: function (key) {
        errorDep.depend();
        return Error[key] ? 'error' : '';
    },
    types: function () {
        return _.map(_.filter(_.keys(Enums.linkTypes), function (key) {
            return !_.contains(['deal', 'candidate'], key);
        }), function (key) {
            return Enums.linkTypes[key];
        });
    },
    entities: function () {
        typeDep.depend();
        var selectedType = $('#taskTypeSelect').val();
        selectedType = parseInt(selectedType);
        switch (selectedType) {
            case Enums.linkTypes.contactable.value:
                return AllContactables.find({}, {
                    sort: {
                        displayName: -1
                    }
                });
            case Enums.linkTypes.job.value:
                return AllJobs.find({}, {
                    sort: {
                        'displayName': -1
                    }
                });
            case Enums.linkTypes.placement.value:
                return AllPlacements.find();
            default :
                return [];
        }
    },
    linkedEntities: function () {
        linkedDep.depend();
        return task.links;
    },
    getEntity: Utils.getEntityFromLinkForAdd,
    datepickerOptions: function () {
        return {
            format: 'D, MM dd, yyyy hh:ii',
            momentFormat: 'ddd, MMMM DD, YYYY HH:mm'
        };
    }
});

var isValid = function (task, key) {
    var result = true;

    if (key) {
        if (key == 'msg') {
            if (!task.msg) {
                Error.msg = 'This field is required';
                result = false;
            } else {
                Error.msg = '';
            }
        }
        if (key == 'assign') {
            if (!task.assign || !task.assign.length) {
                Error.assign = 'This field is required';
                result = false;
            } else {
                Error.assign = '';
            }
        }
    }
    else {
        if (!task.msg) {
            Error.msg = 'This field is required';
            result = false;
        } else {
            Error.msg = '';
        }

        if (!task.assign) {
            Error.assign = 'This field is required';
            result = false;
        } else {
            Error.assign = '';
        }
    }
    errorDep.changed();
    return result;
};

Template.addEditTask.events({
    'click .accept': function (e, ctx) {
        if (!isValid(task)) {
            return;
        }

        addDisabled.set(true);
        if (task._id) {
            taskUpdate(function () {
                $('.modal-host').children().modal('toggle')
            });
        } else {
            Tasks.insert(task, function () {
                $('.modal-host').children().modal('toggle');

            })
        }
        addDisabled.set(false);
    },
    'click .archive': function () {
        if (!isValid(task)) {
            return;
        }
        if (task._id) {
            task.inactive = !task.inactive;
            taskUpdate(function () {
                $('.modal-host').children().modal('toggle')
            });
        } else {
            Tasks.insert(task, function () {
                $('.modal-host').children().modal('toggle')
            })
        }
    },
    'click .push-oneweek': function () {
        task.end = task.end || new Date();
        task.end.setDate(task.end.getDate() + 7);
        taskUpdate(function () {
            $('.modal-host').children().modal('toggle')
        });
    },
    'change.dp .completed>.dateTimePicker': function (e, ctx) {
        task.completed = $(e.currentTarget).data().datetimepicker.date;
        //taskUpdate();
    },
    'change.dp .begin>.date': function (e, ctx) {
        task.begin = $(e.currentTarget).data().date;
        //taskUpdate();
    },
    'change.dp .end>.date': function (e, ctx) {
        task.end = $(e.currentTarget).data().date;
        //taskUpdate();
    },
    'change .isCompleted': function (e) {
        if (e.target.checked) {
            task.completed = new Date;
        } else {
            task.completed = null;
        }
        taskDep.changed();
        //taskUpdate();
    },
    'change .msg': function (e) {
        task.msg = e.target.value;
        //taskUpdate();
    },
    'change .assign': function (e) {
        var newassign = $(e.target).val();
        task.assign = newassign;
        //taskUpdate();
    },
    'blur .msg': function () {
        isValid(task, 'msg');
    },
    'blur .assign': function () {
        isValid(task, 'assign');
    },

    'change #taskTypeSelect': function () {
        typeDep.changed();
    },
    'click #taskLinkEntity': function () {
        var type = $('#taskTypeSelect').val();
        type = parseInt(type);
        var entity = $('#taskEntitySelect').val();
        if (!_.isNumber(type) || !entity) return;

        link({
            type: type,
            id: entity
        });
        linkedDep.changed();
        //taskUpdate();
    },
    'click .remove-link': function () {
        var item = _(task.links).findWhere({id: this._id})

        task.links = _(task.links).without(item);
        linkedDep.changed();
        //taskUpdate();
    }
});

Template.addEditTask.created = function () {
    Meteor.subscribe('allContactables');
    Meteor.subscribe('allJobs');
    Meteor.subscribe('allPlacements');
    task = null;
};
