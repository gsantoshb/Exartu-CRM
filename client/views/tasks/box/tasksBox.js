var entityType=null;
var isEntitySpecific=false;
Template.tasksBox.created=function(){
  entityType=Utils.getEntityTypeFromRouter();
  isEntitySpecific=false;
  if (entityType!=null) isEntitySpecific=true

  Meteor.autorun(function () {
    var queryObj = query.getObject();
    var q = {};
    if(! queryObj.inactives){
      q.inactive = {
        $ne: true
      };
    }
    if (queryObj.ownedByMe) {
      q.userId = Meteor.userId();
    }

    if (queryObj.assigned && queryObj.assignedTo) {
      q.assign = queryObj.assignedTo
    }

    statusDep.depend();
    if (status) {
      _.extend(q, status.query());
    }

    if (queryObj.searchString) {
      q.msg = {
        $regex: queryObj.searchString,
        $options: 'i'
      };
    }
    if (isEntitySpecific) {
      q.links = { $elemMatch: { id: Session.get('entityId') } };
    }
    TasksHandler.setFilter(q);
  })
}
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


var query = new Utils.ObjectDefinition({
  reactiveProps: {
    searchString: {},
    ownedByMe: { type: Utils.ReactivePropertyTypes.boolean,
      default: false
    },
    inactives: {
      type: Utils.ReactivePropertyTypes.boolean,
      default: false
    },
    assigned: {
      type: Utils.ReactivePropertyTypes.boolean,
      default: false
    },
    assignedTo: {
      default: Meteor.userId()
    }
  }
});

var status= null;
var statusDep= new Deps.Dependency;

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
})
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

})

