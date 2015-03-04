var entityType = null;
var isEntitySpecific = false;
var TasksHandler, taskQuery, status;
var statusDep = new Deps.Dependency;
$("#assignedToDropdown").prop("selectedIndex", -1);

var loadTaskQueryFromURL = function (params) {
    // Search string
    var searchStringQuery = {};
    if (params.search) {
        searchStringQuery.default = params.search;
    }
    // CreationDate
    var creationDateQuery = {};
    if (params.creationDate) {
        creationDateQuery.default = params.creationDate;
    }
    // Status
    if (params.status) {
        status = _.findWhere(states, {name: params.status});
    }

    // Owned by me
    var ownedByMeQuery = {type: Utils.ReactivePropertyTypes.boolean};
    ownedByMeQuery.default=false;
    if (params.owned) {
      ownedByMeQuery.default = params.owned ? true: false;
    }

    // Inactive
    var inactiveQuery = {type: Utils.ReactivePropertyTypes.boolean};
    if (params.inactives) {
        inactiveQuery.default = !!params.inactives;
    }

    // Assigned to
    var assignedToQuery = {};
    if (params.assignedTo) {
        assignedToQuery.default = params.assignedTo;
    }

    return new Utils.ObjectDefinition({
        reactiveProps: {
            searchString: searchStringQuery,
            ownedByMe: ownedByMeQuery,
            inactives: inactiveQuery,
            assignedTo: assignedToQuery,
            selectedLimit: creationDateQuery
        }
    });
};

var taskCount = new ReactiveVar();

Template.tasksBox.created = function () {
    taskQuery = taskQuery || loadTaskQueryFromURL(Router.current().params.query);
    var entityId = Session.get('entityId');

    if (!SubscriptionHandlers.TasksHandler) {
        SubscriptionHandlers.TasksHandler = Meteor.paginatedSubscribe("tasks");
    }
    TasksHandler = SubscriptionHandlers.TasksHandler;
    entityType = Utils.getEntityTypeFromRouter();
    isEntitySpecific = false;
    if (entityType != null) isEntitySpecific = true;

    Meteor.autorun(function () {
        var urlQuery = new URLQuery();
        var queryObj = taskQuery.getObject();
        var q = {};

        if (!queryObj.inactives) {
            q.inactive = {
                $ne: true
            };
        }
        if (queryObj.inactives) {
            urlQuery.addParam('inactive', true);
        }

        if (queryObj.selectedLimit) {

            var dateLimit = new Date();
            q.dateCreated = {
                $gte: dateLimit.getTime() - queryObj.selectedLimit
            };
            urlQuery.addParam('creationDate', queryObj.selectedLimit);
        }
        if (queryObj.ownedByMe) {
            q.assign = Meteor.userId();
            urlQuery.addParam('owned', true);
        }


        if (queryObj.assignedTo) {
            q.assign = queryObj.assignedTo;
            urlQuery.addParam('assignedTo', queryObj.assignedTo);
        }

        statusDep.depend();
        if (status) {
            _.extend(q, status.query());
            urlQuery.addParam('status', status.name);
        }

        if (queryObj.searchString) {
            q.msg = {
                $regex: queryObj.searchString,
                $options: 'i'
            };
            urlQuery.addParam('search', queryObj.searchString);
        }
        if (isEntitySpecific) {
            q.links = {$elemMatch: {id: entityId}};
        }
        urlQuery.apply();
        TasksHandler.setFilter(q);
    })
};

Template.tasksBox.rendered = function () {
    $(document).on('click', 'button[data-toggle="popover"]', function (e) {
        var object = e.currentTarget;
        var linkId = $(object).attr('data-link');
        if ($(object).attr('data-init') == 'off') {
            $(object).attr('data-content', $('#' + linkId).html());
            $(object).popover('show');
            $(object).attr('data-init', 'on');
        }
    });
};

Template.tasksBox.destroyed = function () {
    $('.popover').popover('destroy');
};

//todo: improve queries to match with the state in the transform
var states = [
    {
        name: 'Pending',
        query: function () {
            return {
                completed: null,
                begin: {
                    $lte: new Date()
                },
                $or: [
                    {
                        end: {$gte: new Date()}
                    },
                    {
                        end: {$exists: false}
                    }
                ]
            }
        }
    }, {
        name: Enums.taskState.overDue,
        query: function () {
            return {
                completed: null,
                begin: {
                    $lt: new Date()
                },
                end: {
                    $lt: new Date()
                }
            }
        }
    }, {
        name: 'Completed',
        query: function () {
            return {
                completed: {
                    $ne: null
                }
            }
        }
    }, {
        name: 'Future',
        query: function () {
            return {
                completed: null,
                begin: {
                    $gt: new Date()
                }
            }
        }
    }
];

Template.tasksBox.helpers({
    taskCount: function () {
      statusDep.depend();
      return TasksHandler.totalCount();
    },
    users: function () {
        return Meteor.users.find({}, {sort: {'emails.address': 1}});
    },
    tasks: function () {
      return Tasks.find({},{sort:{dateCreated:-1}});
    },
    filters: function () {
        return taskQuery;
    },
    states: function () {
        return states;
    },
    selectedClass: function () {
        statusDep.depend();
        return this == status ? 'btn-primary' : 'btn-default';
    },
    isLoading: function () {

        return TasksHandler.isLoading();
    }
});

Template.tasksBox.events({
    'keyup #searchString': _.debounce(function (e) {
        taskQuery.searchString.value = e.target.value;
    }, 200),
    'click .addTask': function () {
        if (!isEntitySpecific)
            Utils.showModal('addEditTask');
        else
            Utils.showModal('addEditTask', {
                links: [{
                    id: Session.get('entityId'),
                    type: entityType
                }]
            })
    },
    'click .selectState': function () {
        if (status == this) {
            status = null;
        } else {
            status = this;
        }
        statusDep.changed()
    },
    'click .clearState': function () {
        status = null;
        statusDep.changed()
    }
});

