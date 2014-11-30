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

  // Status
  if (params.status) {
    status = _.findWhere(states, {name: params.status});
  }

  // Owned by me
  var ownedByMeQuery = {};
//  if (params.owned) {
//    ownedByMeQuery.default = params.owned ? Meteor.userId() : undefined;
//  }

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
  console.log('task box run');
  return new Utils.ObjectDefinition({
    reactiveProps: {
      searchString: searchStringQuery,
      ownedByMe: ownedByMeQuery,
      inactives: inactiveQuery,
      assignedTo: assignedToQuery
    }
  });
};

Template.tasksBox.created = function () {
  taskQuery = taskQuery || loadTaskQueryFromURL(Router.current().params);
  console.log('task box created',Router.current().params,taskQuery);
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

    if (queryObj.ownedByMe) {
      q.userId = Meteor.userId();
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
    console.log('task query',q);
    TasksHandler.setFilter(q);
  })
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
    name: 'Closed',
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
    TasksHandler.totalCount();
  },
  users: function () {
    return Meteor.users.find();
  },
  tasks: function () {

    return Tasks.find();
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
  'click .addTask': function () {
    if (!isEntitySpecific)
      Composer.showModal('addEditTask');
    else
      Composer.showModal('addEditTask', {
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

