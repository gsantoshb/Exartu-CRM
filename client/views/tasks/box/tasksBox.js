var entityType = null;
var isEntitySpecific = false;
var taskCollection = Tasks;
var TaskHander, queryObj, status;
var searchQuery = {};

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
    queryObj = queryObj || loadTaskQueryFromURL(Router.current().params.query);
    var entityId = Session.get('entityId');
    entityType = Utils.getEntityTypeFromRouter();
    isEntitySpecific = false;
    if (entityType != null) isEntitySpecific = true;

    Meteor.autorun(function () {
        var urlQuery = new URLQuery();
        searchQuery={};
        if (!queryObj.inactives.value) {
            searchQuery.inactive = {
                $ne: true
            };
        }
        if (queryObj.inactives.value) {
            urlQuery.addParam('inactive', true);
        }

        if (queryObj.selectedLimit.value) {

            var dateLimit = new Date();
            searchQuery.dateCreated = {
                $gte: dateLimit.getTime() - queryObj.selectedLimit.value
            };
            urlQuery.addParam('creationDate', queryObj.selectedLimit.value);
        }
        if (queryObj.ownedByMe.value) {
            searchQuery.userId = Meteor.userId();
            urlQuery.addParam('owned', true);
        }


        if (queryObj.assignedTo.value) {
            searchQuery.assign = queryObj.assignedTo.value;
            urlQuery.addParam('assignedTo', queryObj.assignedTo.value);
        }

        statusDep.depend();

        if (status) {
            _.extend(searchQuery, status.query());
            urlQuery.addParam('status', status.name);
        }

        if (queryObj.searchString.value) {
            searchQuery.msg = {
                $regex: queryObj.searchString.value,
                $options: 'i'
            };
            urlQuery.addParam('search', queryObj.searchString);
        }
        if (isEntitySpecific) {
            searchQuery.links = {$elemMatch: {id: entityId}};
        }
        urlQuery.apply();
        if (SubscriptionHandlers.TaskHandler) {
            SubscriptionHandlers.TaskHandler.setFilter(searchQuery);
            SubscriptionHandlers.TaskHandler.setOptions();
            TaskHandler = SubscriptionHandlers.TaskHandler;
        }
        else {
            SubscriptionHandlers.TaskHandler =
                Meteor.paginatedSubscribe('tasks', {
                    filter: searchQuery
                });
            TaskHandler = SubscriptionHandlers.TaskHandler;
        }
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
  //SubscriptionHandlers.TaskHandler.stop();
  //delete SubscriptionHandlers.TaskHandler;
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
        if (TaskHandler)
            return TaskHandler.totalCount();
    },
    users: function () {
        return Meteor.users.find({}, {sort: {'emails.address': 1}});
    },
    tasks: function () {
      return Tasks.find(searchQuery,{sort:{dateCreated:-1}});
    },
    filters: function () {
        return queryObj;
    },
    states: function () {
        return states;
    },
    selectedClass: function () {
        statusDep.depend();
        return this == status ? 'btn-primary' : 'btn-default';
    },
    isLoading: function () {
        return SubscriptionHandlers.TaskHandler.isLoading();
    },
    isUserSelected: function () {
        return this._id == queryObj.assignedTo.value;
    }
});

Template.tasksBox.events({
    'keyup #searchString': _.debounce(function (e) {

        queryObj.searchString.value = e.target.value;
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

