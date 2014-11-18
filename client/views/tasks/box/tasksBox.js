var entityType=null;
var isEntitySpecific=false;
var TasksHandler, query, status;
var statusDep = new Deps.Dependency;


Template.tasksBox.created = function() {
  query = this.data.query;
  status = _.findWhere(states, {name: this.data.statusName});

  if (! SubscriptionHandlers.TasksHandler) {
    SubscriptionHandlers.TasksHandler = Meteor.paginatedSubscribe("tasks");
  }
  TasksHandler = SubscriptionHandlers.TasksHandler;

  Meteor.autorun(function () {
    var urlQuery = new URLQuery();

    entityType = Utils.getEntityTypeFromRouter();
    isEntitySpecific = false;
    if (entityType != null) isEntitySpecific = true;

    var queryObj = query.getObject();
    var q = {};

    if(! queryObj.inactives){
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
      q.links = { $elemMatch: { id: Session.get('entityId') } };
    }

    urlQuery.apply();

    TasksHandler.setFilter(q);
  })
};

//todo: improve queries to match with the state in the transform
var states = [
    {
        name: 'Pending',
        query:function() {
          return {
            completed: null,
            begin: {
                $lte: new Date(),
            },
            end: {
                $gte: new Date(),
            }
          }
        }
    }, {
        name: 'Closed',
        query: function() {
          return {
            completed: null,
            begin: {
                $lt: new Date(),
            },
            end: {
                $lt: new Date(),
            }
          }
        }
    }, {
        name: 'Completed',
        query: function() {
          return {
            completed: {
                $ne: null
            }
          }
        }
    }, {
        name: 'Future',
        query: function() {
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
  taskCount: function(){
    TasksHandler.totalCount();
  },
  users: function(){
    return Meteor.users.find();
  },
  tasks: function(){

    return Tasks.find();
  },
  filters: function(){
    return query
  },
  states: function(){
    return states;
  },
  selectedClass: function(){
    statusDep.depend();
    return this == status ? 'btn-primary': 'btn-default';
  },
  isLoading: function () {
    return TasksHandler.isLoading();
  }
});

Template.tasksBox.events({
  'click .addTask': function(){
    if (!isEntitySpecific)
      Composer.showModal('addEditTask');
    else
      Composer.showModal('addEditTask', { links: [{
        id: Session.get('entityId'),
        type: entityType
      }] })
  },
  'click .selectState': function(){
    if (status == this){
      status = null;
    }else{
      status = this;
    }
    statusDep.changed()
  },
  'click .clearState': function(){
    status = null;
    statusDep.changed()
  }
});

