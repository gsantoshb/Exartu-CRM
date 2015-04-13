var hotListCollection = HotLists;
var HotListMembersHandler;

HotListController = RouteController.extend({
  layoutTemplate: 'mainLayout',
  template: 'hotList',
  waitOn: function () {
    if (!SubscriptionHandlers.HotListMembersHandler) {
      SubscriptionHandlers.HotListMembersHandler = Meteor.paginatedSubscribe('hotListMembers', {pubArguments: this.params._id});
    }
    HotListMembersHandler = SubscriptionHandlers.HotListMembersHandler;

    return [Meteor.subscribe('hotListDetails', this.params._id), HotListMembersHandler];
  },
  action: function () {
    if (!this.ready()) {
      this.render('loadingContactable');
    } else {
      this.render();
    }

    Session.set('entityId', this.params._id);
    Session.set('hotListId', this.params._id);
    Session.set('activeTab', this.params.tab || 'members');
  },
  onAfterAction: function () {
    var hotList = hotListCollection.findOne({_id: this.params._id});
    if(hotList) {
      var title = hotList.displayName,
        description = 'HotList information';
      SEO.set({
        title: title,
        meta: {'description': description},
        og: {
          'title': title,
          'description': description
        }
      });
    }
  }
});

// Main template
Template.hotList.helpers({
  hotList: function () {
    var hotList = hotListCollection.findOne({_id: Session.get('entityId')});
    if (hotList.tags == null)
      hotList.tags = [];
    return hotList;
  },
  currentTemplate: function () {
    var selected = _.findWhere(tabs, {id: Session.get('activeTab')});
    return selected && selected.template;
  }
});

Template.hotList.events({
    'click .remove': function (e, ctx) {
        var hotList = hotListCollection.findOne({_id: Session.get('entityId')});
        hotList.members.splice(hotList.members.indexOf(this._id), 1);
        hotListCollection.update({_id: hotList._id}, {$set: {members: hotList.members}});
    },
    'click .goBack': function () {
        history.back();
    }
});


// Header
var editMode = new ReactiveVar(false);
var editingDisplayName= new ReactiveVar(false);
Template.hotListHeader.helpers({
  statusClass: function (statusId) {
    var lu = LookUps.findOne(statusId);
    if (lu && lu.displayName == 'Active') return 'success';
    else return 'error';
  },
  editMode: function () {
    return editMode.get();
  },
  editingDisplayName: function () {
    return editingDisplayName.get();
  }
});

Template.hotListHeader.events({
    'click #toggle-status': function(e, ctx){
        var hotList = hotListCollection.findOne({_id: Session.get('entityId')});
        var statuses = LookUps.find({lookUpCode: Enums.lookUpTypes.active.status.lookUpCode}).fetch();
        var status = undefined;

        if(hotList.activeStatus == statuses[0]['_id'])
            status = statuses[1]['_id'];
        else
            status = statuses[0]['_id'];

        hotListCollection.update({_id: hotList._id}, {$set: {activeStatus: status}}, function(err, result) {});
    },
    'click .toggle-edit-mode': function () {
      editMode.set(!editMode.get());
    },
    'click .saveButton': function () {
        var statusNote = $('#statusNote').val();

        hotListCollection.update({_id: Session.get('entityId')}, {$set: {statusNote: statusNote}}, function (err, result) {
            if (!err) {
              editMode.set(false);
            }
            else{
                alert(err);
            }
        });
    },
    'click .cancelButton': function () {
        editMode.set(false);
    },
    'click #editDisplayName': function () {
        editingDisplayName.set(true);
    },
    'click .saveDisplayNameButton': function () {
        var displayName = $('#displayName').val();

        hotListCollection.update({_id: hotList._id}, {$set: {displayName: displayName}}, function (err, result) {
            if (!err) {
                editingDisplayName.set(false);
            }
            else{
                alert(err);
            }
        });
    },
    'click .cancelDisplayNameButton': function () {
        editingDisplayName.set(false);
    }
});

// Tabs
var tabs;
Template.hotList_nav.helpers({
    tabs: function () {
        tabs = [
            {id: 'members', displayName: 'Members', template: 'hotList_members'},
            {id: 'notes', displayName: 'Notes', template: 'hotList_notes'},
            {id: 'responses', displayName: 'Responses', template: 'hotList_responses'}
        ];

        return tabs;
    },
    getEntityId: function () {
        return Session.get('entityId');
    },
    isActive: function (id) {
      return (id == Session.get('activeTab')) ? 'active' : '';
    }
});
