TasksController = RouteController.extend({
    template: 'tasks',
    layoutTemplate: 'mainLayout',
  onAfterAction: function() {
    var title = 'Tasks',
      description = 'Manage your tasks here';
    SEO.set({
      title: title,
      meta: {
        'description': description
      },
      og: {
        'title': title,
        'description': description
      }
    });
  }
});

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

Template.tasks.helpers({
  taskCount: function(){
    return Tasks.find().count();
  },
  users: function(){
    return Meteor.users.find();
  },
  tasks: function(){
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
    return Tasks.find(q);
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
  }
})
Template.tasks.events({
  'click .addTask': function(){
    Composer.showModal('addEditTask');
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
Template.tasks.asd= function () {
    var self = {};
    self.searchString = ko.observable();
    self.selectedState = ko.observable();
    self.states = ko.observableArray(states);
    self.selectState = function (data) {
        if (self.selectedState() == data) {
            self.selectedState(false);
        } else {
            self.selectedState(data);
        }
    }
    self.clearState = function () {
        self.selectedState(false);
    }


    self.users = ko.meteor.find(Meteor.users, {});
    var query = ko.computed(function () {

        var q = {};
        var selectedState = self.selectedState();
        if (selectedState) {
            _.extend(q, selectedState.query());
        }

        return q;
    });

    var options = ko.computed(function () {
        return {
            sort: { dateCreated: -1 }
        }
    })


    self.tasks = ko.meteor.find(Tasks, query, options);
    self.add = function () {
        Composer.showModal('addEditTask');
    }
    self.edit = function (data) {
        Composer.showModal('addEditTask', ko.toJS(data));
    }
    self.complete = function (data) {
        var task = ko.toJS(data);
        Tasks.update({
            _id: task._id
        }, {
            $set: {
                completed: new Date()
            }
        });
    };

  self.getEntity=Utils.getEntityFromLink;
  self.getHref=Utils.getHrefFromLink;

    return self;
};
