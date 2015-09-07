/**
 * Variables
 */
var tourIndex;
var entityType = null;
var searchQuery;
var isEntitySpecific = false;
var contactable;
var searchFields = ['displayName'];
var selectedSort = new ReactiveVar();
selectedSort.set({field: 'dateCreated', value: -1});
var sortFields = [
    {field: 'dateCreated', displayName: 'Date'},
    {field: 'employeeDisplayName', displayName: 'Name'}
];
var placementCollection = PlacementsView;
var PlacementHandler, query;
var placementPreview = new ReactiveVar(false);
var info = new Utils.ObjectDefinition({
    reactiveProps: {
        placementsCount: {},
        objType: {},
        isRecentDaySelected: {
            default: false
        },
        objTypeDisplayName: {},
        isRecentWeekSelected: {
            default: false
        },
        isRecentMonthSelected: {
            default: false
        },
        isRecentYearSelected: {
            default: false
        },
        isFiltering: {
            default: false
        }
    }
});

var loadqueryFromURL = function (params) {
    // Search string
    var searchStringQuery = {};
    if (params.search) {
        searchStringQuery.default = params.search;
    }

    // Mine only
    var mineQuery = {type: Utils.ReactivePropertyTypes.boolean};
    if (params.mine) {
        mineQuery.default = !!params.mine;
    }



    // CreationDate
    var creationDateQuery = {};
    if (params.creationDate) {
        creationDateQuery.default = params.creationDate;
    }

    // Status
    var statusQuery = { type: Utils.ReactivePropertyTypes.array };
    if (params.status) {
        statusQuery.default = params.status.split(',');
    }

    // Tags
    var tagsQuery = { type: Utils.ReactivePropertyTypes.array };
    if (params.tags) {
        tagsQuery.default = params.tags.split(',');
    }

    var activeStatusQuery = {type: Utils.ReactivePropertyTypes.array};
    if (params.activeStatus) {
        activeStatusQuery.default = params.activeStatus.split(',');
    }
    else
    {
        if (Meteor.user()) // verify not a fresh reload
            activeStatusQuery.default = [Utils.getActiveStatusDefaultId()];
    };


    return new Utils.ObjectDefinition({
        reactiveProps: {
            searchString: searchStringQuery,
            selectedLimit: creationDateQuery,
            activeStatus: activeStatusQuery,
            tags: tagsQuery,
            mineOnly: mineQuery,
            statuses: statusQuery
        }
    });
};
var listViewDefault=Session.get('placementListViewMode');
if (!listViewDefault)
{
    listViewDefault=false;
}
var listViewMode = new ReactiveVar(listViewDefault);

var searchDep = new Deps.Dependency;
var isSearching = false;

var options = {};

var getCandidateStatuses = function(objname){
    var code = Enums.lookUpTypes["candidate"].status.lookUpCode;
    var lkps = LookUps.find( { lookUpCode:code, lookUpActions: { $in: [ objname ] }}).fetch();
    var ids = _.map(lkps,function(doc) {  return doc._id;});
    return ids;
};




var setSortField = function(field) {
    var selected = selectedSort.get();
    if (selected && selected.field == field.field) {
        if (selected.value == 1)
            selected = undefined;
        else
            selected.value = 1;
    } else {
        selected = field;
        selected.value = -1;
    }
    selectedSort.set(selected);
};

/**
 * Callbacks
 */
var lastUser = null;
Template.placementsBox.created = function(){
    // If the user logout and login with other user the filter was keeping the 'old' activeStatus, causing the list to be empty.
    // So if the user changed I force it to get the filter from the url, fixing the problem.
    // If the user hasn't changed proceed as usual to keep the filters between navigation as it used to.
    if (lastUser != Meteor.userId()){
        lastUser = Meteor.userId();
        query = loadqueryFromURL(Router.current().params.query);
    }else{
        query = query || loadqueryFromURL(Router.current().params.query);
    }

    var entityId = Session.get('entityId');
    entityType = Utils.getEntityTypeFromRouter();
    isEntitySpecific = false;

    if (entityType != null) {
        isEntitySpecific = true;
        if (entityType == Enums.linkTypes.contactable.value) {
            contactable = Contactables.findOne({_id: entityId});
        }
    }
};

Template.placementsBox.rendered = function(){
  placementPreview.set(false);
  Meteor.call('getIndexTour', "tourActivities", function(err,cb){
    tourIndex = cb;
    if((tourIndex>=14)&&(tourIndex < 18)){
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
          if(e===18){
            Router.go("/notes");
          }

        }
      });
    }
  });
}

Template.placementsBox.destroyed = function() {
  $("#tourActivities").joyride('destroy');
}

var initialized = new ReactiveVar(false);

Template.placementList.created = function () {
    initialized.set(false);

    Meteor.autorun(function () {
        searchQuery = {
            $and: [] // Push each $or operator here
        };
        var params = {};
        options = {};
        var urlQuery = new URLQuery();

        searchDep.depend();

        if (entityType==Enums.linkTypes.job.value) searchQuery.jobId=Session.get('entityId');

        if (entityType==Enums.linkTypes.contactable.value) {
            if (contactable.Client) {
                // Get client jobs
                var jobsId = Jobs.find({client: Session.get('entityId')}).map(function (job) { return job._id;});
                searchQuery.jobId = {$in: jobsId};
            }
            if (contactable.Employee) searchQuery.employeeId=Session.get('entityId');
        }

        if (!_.isEmpty(query.searchString.value)) {
            params.searchString = query.searchString.value;
            urlQuery.addParam('search', query.searchString.value);
        }

        //Created by
        if (query.mineOnly.value) {
            searchQuery.$and.push({userId: Meteor.userId()});
            urlQuery.addParam('mine', true);
        }

        if (query.selectedLimit.value) {
            var dateLimit = new Date();
            searchQuery.dateCreated = {
                $gte: dateLimit.getTime() - query.selectedLimit.value
            };
            urlQuery.addParam('creationDate', query.selectedLimit.value);
        }

        if (query.tags.value.length > 0) {
            searchQuery.tags = {
                $in: query.tags.value
            };
            urlQuery.addParam('tags', query.tags.value);
        }
        if (!_.isEmpty(query.activeStatus.value)){
            searchQuery.activeStatus={$in: query.activeStatus.value};

            urlQuery.addParam('activeStatus', query.activeStatus.value);
        };

        if (query.statuses.value && query.statuses.value.length > 0){
            searchQuery.candidateStatus = {$in: query.statuses.value};
            urlQuery.addParam('status', query.statuses.value);
        }

        // Set url query
        urlQuery.apply();
        if (selectedSort.get()) {
            var selected = selectedSort.get();
            options.sort = {};
            options.sort[selected.field] = selected.value;
        } else {
            delete options.sort;
        }

        // String search
        if (query.searchString.value) {
            var stringSearches = [];
            _.each(searchFields, function (field) {
                var aux = {};
                aux[field] = {
                    $regex: query.searchString.value,
                    $options: 'i'
                };
                stringSearches.push(aux);
            });
            searchQuery.$and.push({
                $or: stringSearches
            });
            urlQuery.addParam('search', query.searchString.value);
        }

        if (searchQuery.$and.length == 0)
            delete searchQuery.$and;

        if (SubscriptionHandlers.PlacementHandler) {
            SubscriptionHandlers.PlacementHandler.setFilter(searchQuery);
            SubscriptionHandlers.PlacementHandler.setOptions(options);
            PlacementHandler = SubscriptionHandlers.PlacementHandler;
        }
        else {
            SubscriptionHandlers.PlacementHandler =
                Meteor.paginatedSubscribe('placementsView', {
                    filter: searchQuery,
                    options: options
                });
            PlacementHandler = SubscriptionHandlers.PlacementHandler;
        }
        initialized.set(true);

    })
};

/**
 * Helpers
 */
// Placements Box - Helpers
Template.placementsBox.helpers({
    isSearching: function () {
       searchDep.depend();
       return isSearching;
    },
    placementPreview: function(){
      return placementPreview.get();
    }
});

Template.placementsBox.events({
   'click .placements-list-item':function(e){
     Meteor.call('getPlacementPreview', this.placementId, function (er, res) {
       placementPreview.set(res);
     })
   },
   'click #more-menu':function(e,ctx){
     this.$('.dropdown-toggle').dropdown()
     e.stopPropagation();
   },
  'click #delete-placement': function(e,ctx){
    var lkInactive = LookUps.findOne({lookUpActions:Enums.lookUpAction.Implies_Inactive});
    Meteor.call('updatePlacement', this.placementId, {$set:{activeStatus:lkInactive._id}}, function(){

    })

  },
  'click #active-placement': function(e,ctx){
    var lkActive = LookUps.findOne({lookUpActions:Enums.lookUpAction.Implies_Active});
    Meteor.call('updatePlacement', this.placementId, {$set:{activeStatus:lkActive._id}}, function(){
    })
  }

})



// List Header - Helpers
Template.placementListHeader.helpers({
    listViewMode: function () {
        return listViewMode.get();
    }
});

// List Search - Helpers
Template.placementListSearch.helpers({
    isJob: function () {
        if (entityType == Enums.linkTypes.job.value) return true;
    },
    showAddButton: function() {
        return entityType == Enums.linkTypes.job.value;
    },
    searchString: function () {
        return query.searchString;
    },
    isLoading: function () {
        return PlacementHandler.isLoading();
    },
    listViewMode: function () {
        return listViewMode.get();
    },
    initialized: function () {
        return initialized.get();
    }
});

// List Sort - Helpers
Template.placementListSort.helpers({
    sortFields: function() {
        return sortFields;
    },
    selectedSort: function() {
        return selectedSort.get();
    },
    isFieldSelected: function(field) {
        return selectedSort.get() && selectedSort.get().field == field.field;
    },
    isAscSort: function() {
        return selectedSort.get() ? selectedSort.get().value == 1: false;
    }
});

// List Filters - Helpers
Template.placementFilters.helpers({
    information: function() {
      if(initialized.get()){
        if (!PlacementHandler) return;

           info.placementsCount = PlacementHandler.totalCount();

        return info;
      }
      else{
        return;
      }
    },
    query: function () {
        return query;
    },
    tags: function () {
        return query.tags;
    }
});

// List - Helpers
Template.placementList.helpers({
    listViewMode: function () {
        return listViewMode.get();
    },
    info: function () {
        info.isFiltering.value = PlacementHandler.totalCount() != 0;
        return info;
    },
    isLoading: function () {
        return SubscriptionHandlers.PlacementHandler.isLoading();
    },
    placements: function () {
        return placementCollection.find({}, options);
    },
    //placementTypes: function () {
    //    return dType.ObjTypes.find({parent: Enums.objGroupType.placement});
    //},
    listViewMode: function () {
        return listViewMode.get();
    },
    initialized: function () {
        return initialized.get();
    }
});

// List Item - Helpers
Template.placementListItem.helpers({
    placementIcon: function () {
        return helper.getEntityIcon(this);
    },
    statusDisplayName: function (item) {
        var lookUp = LookUps.findOne({_id: this.placementStatus});

        if (lookUp) return lookUp.displayName;
    },
    displayObjType: function () {
        return Utils.getPlacementType(this);
    },

    listViewMode: function () {
        return listViewMode.get();
    },
    isActivePlacement:function(){
      var lkActive = LookUps.findOne({lookUpActions:Enums.lookUpAction.Implies_Active});
      return lkActive._id === this.activeStatus;
    }
});

// Placement Information - Helpers
Template.placementInformation.helpers({
    getRateTypeDisplayName: function () {
        var rate = LookUps.findOne(this.type);
        return rate.displayName;
    }
});

/**
 * Events
 */
// List Search - Events
Template.placementListSearch.events({
    'keyup #searchString': _.debounce(function(e){
        query.searchString.value = e.target.value;
      },200),
    'click #toggle-filters': function(e){
        if( $(e.currentTarget).attr('data-view') == 'normal' ){
            $('body .network-content #column-filters').addClass('hidden');
            $('body .network-content #column-list').removeClass('col-md-9').addClass('col-md-12');
            $(e.currentTarget).attr('data-view', 'wide');
        }
        else{
            $('body .network-content #column-filters').removeClass('hidden');
            $('body .network-content #column-list').removeClass('col-md-12').addClass('col-md-9');
            $(e.currentTarget).attr('data-view', 'normal');
        }
    },
    'click .addPlacement': function (e) {
        Session.set('addOptions', {job: Session.get('entityId')});
        Router.go('/placementAdd/placement');
        e.preventDefault();
    },
    'click #list-view': function () {
        listViewMode.set(true);
        Session.set('placementListViewMode',true);
    },
    'click #detail-view': function () {
        listViewMode.set(false);
        Session.set('placementListViewMode',false);
    }
});

// List Sort - Helpers
Template.placementListSort.events({
    'click .sort-field': function() {
        setSortField(this);
    }
});

Template.placementPreviewTemp.events({
  'click #close-preview':function(e){
    placementPreview.set(false);
  },
  'click .makeTwilioCall': function () {
    Meteor.call('twilioPlacementCall', this._id, function (err, res) {
      if (err) {
        // Show notification
        $.gritter.add({
          title:	'An error has occurred',
          text:	err.reason ? err.reason : err.error,
          image: 	'/img/logo.png',
          sticky: false,
          time: 5000
        });
      }
    });
  }
});


Template.placementPreviewTemp.helpers({
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

