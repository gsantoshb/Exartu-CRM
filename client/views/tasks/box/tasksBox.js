var tourIndex;
var entityType = null;
var isEntitySpecific = false;
var taskCollection = Tasks;
var TaskHander, queryObj, status;
var searchQuery = {};
var taskPreview = new ReactiveVar(false);

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
        var statuses = params.status.split(',');
        status = _.filter(states, function (st) {
            return _.contains(statuses, st.name);
        }) || [];
    }

    // Owned by me
    var ownedByMeQuery = {type: Utils.ReactivePropertyTypes.boolean};
    ownedByMeQuery.default=false;
    if (params.owned) {
      ownedByMeQuery.default = params.owned ? true: false;
    }

    // Inactive
    var inactiveQuery = {type: Utils.ReactivePropertyTypes.boolean};
    if (params.inactive) {
      inactiveQuery.default = !!params.inactive;
    }
    else{
      inactiveQuery.default = false;
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
    status = [];
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
            searchQuery.inactive = {
              $ne: false
            };
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

        if (status && status.length) {
            var statusQuery = [];
            var urlStatusQuery = [];
            _.each(status, function (st) {
                statusQuery.push(st.query());
                urlStatusQuery.push(st.name);
            });
            urlQuery.addParam('status', urlStatusQuery);
            _.extend(searchQuery, { $or: statusQuery });

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
  taskPreview.set(false);
  Meteor.call('getIndexTour', "tourActivities", function(err,cb){
    tourIndex = cb;
    if((tourIndex>=18)&&(tourIndex < 22)){
      $("#tourActivities").joyride({
        autoStart: true,
        startOffset:tourIndex + 1,
        modal: true,
        postRideCallback: function(e) {
          Meteor.call('setVisitedTour', "tourActivities", 27, function(err,cb){
          })
        },
        postStepCallback: function(e, ctx){
          tourIndex = e;
          Meteor.call('setVisitedTour', "tourActivities", tourIndex, function(err,cb){
          })
          if(e===22){
            Router.go("/notes");
          }

        }
      });
    }
  });
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
    $("#tourActivities").joyride('destroy');
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
      return Tasks.find(searchQuery,{sort:{begin:1}});
    },
    filters: function () {
        return queryObj;
    },
    states: function () {
        return states;
    },
    selectedClass: function () {
        statusDep.depend();
        return _.contains(status, this) ? 'btn-primary' : 'btn-default';
    },
    isLoading: function () {
        return SubscriptionHandlers.TaskHandler.isLoading();
    },
    isUserSelected: function () {
        return this._id == queryObj.assignedTo.value;
    },
    taskPreview: function(){
        return taskPreview.get();
    }
});

Template.tasksBox.events({
    'keyup #searchString': _.debounce(function (e) {

        queryObj.searchString.value = e.target.value;
    }, 200),
    'click .addTask': function () {
        if (!isEntitySpecific)
            Utils.showModal('addEditTask');
        else {
          Utils.showModal('addEditTask', {link: Session.get('entityId'), type: entityType});
        }
        },
    'click .selectState': function () {
        if (_.contains(status, this)) {
            status.splice(status.indexOf(this), 1);
        } else {
            status.push(this);
        }
        statusDep.changed()
    },
    'click .clearState': function () {
        status = [];
        statusDep.changed()
    },
    'click .editTask':function(e){
      e.stopPropagation();
    },
    'click .tasks-list-item': function (e){
      if(!Session.get('entityId')) {
        //is session.get(entityId) then you are on a contactable
        Meteor.call('getTaskPreview', this._id, function (er, res) {
          taskPreview.set(res);

        })
      }
    }
});


Template.taskPreviewTemp.helpers({
  decodedContactMethods: function() {

    var result = {};
    var contactMethodsTypes = LookUps.find({lookUpCode: Enums.lookUpTypes.contactMethod.type.lookUpCode}).fetch();
    _.some(this.contactMethods, function (cm) {
      var type = _.findWhere(contactMethodsTypes, {_id: cm.type});
      if (!type)
        return false;
      if (type.lookUpActions && _.contains(type.lookUpActions, Enums.lookUpAction.ContactMethod_Email)) {
        result.email = cm;
        email = cm;
      }
      if (type.lookUpActions && _.contains(type.lookUpActions, Enums.lookUpAction.ContactMethod_Phone)) {
        result.phone = cm;
        phone = cm;
      }
      if (!result.email || !result.phone) {
        return false;
      }

      return true;
    });
    if (!result.phone && !result.email) {
      return false
    }
    else {
      return result;
    }
  },
  iconClass: function(){
    switch(this.type){
      case Enums.linkTypes.contactable.value:{
        return "icon-profile-business-man";
      }case Enums.linkTypes.hotList.value:{
      return "icon-list-4";
    }case Enums.linkTypes.job.value:{
      return "icon-briefcase-2";
    }case Enums.linkTypes.placement.value:{
      return "icon icon-suitcase-1";
    }
    }
  },
  iconColor: function(){
    switch(this.type){
      case Enums.linkTypes.contactable.value:{
        return "item-icon-network";
      }case Enums.linkTypes.hotList.value:{
      return "item-icon-hotlist";
    }case Enums.linkTypes.job.value:{
      return "item-icon-jobs";
    }case Enums.linkTypes.placement.value:{
      return "item-icon-placements";
    }
    }
  }
})
