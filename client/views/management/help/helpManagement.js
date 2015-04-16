HelpManagementController = RouteController.extend({
  layoutTemplate: 'mainLayout',
  waitOn: function () {
    return Meteor.subscribe('helpVideos');
  },
  action: function () {
    if (!this.ready()) {
      this.render('loadingContactable');
      return;
    }
    this.render('helpManagement')
  }
});

var editinId = new ReactiveVar(null);

Template.helpManagement.helpers({
  helpVideos: function () {
    return HelpVideos.find({},{ sort:{ order: 1 } });
  },
  isEditing: function () {
    return this._id == editinId.get();
  }
});

Template.helpManagement.events({
  'click .edit': function () {
    if (editinId.get() == this._id){
      editinId.set(null);
    }else{
      editinId.set(this._id);
    }
  },
  'click .remove': function () {
    Meteor.call('removeHelpVideo', this._id, function (err, result) {
      if (err) {
        console.error(err);
      }
    });
  }
});


AutoForm.hooks({
  addHelpVideo: {
    onSubmit: function (insertDoc, updateDoc, currentDoc) {
      var self = this;
      // transform url in an embed url
      if (/www\.youtube\.com\/watch/.test(insertDoc.url)){
        var match = insertDoc.url.match(/\?v=(\w+)/);
        var id = match && match.length && match[1];
        if (id){
          insertDoc.url = 'https://www.youtube.com/embed/'+id;
        }
      }
      Meteor.call('addUpdateHelpVideo', insertDoc, function (err, result) {
        if (err) {
          self.done(err);
        }
        else {
          self.done();
        }
      });
      return false;
    }
  }
});

AutoForm.hooks({
  editHelpVideo: {
    onSubmit: function (insertDoc, updateDoc, currentDoc) {
      var self = this;
      // transform url in an embed url
      if (/www\.youtube\.com\/watch/.test(insertDoc.url)){
        var match = insertDoc.url.match(/\?v=(\w+)/);
        var id = match && match.length && match[1];
        if (id){
          insertDoc.url = 'https://www.youtube.com/embed/'+id;
        }
      }
      insertDoc._id = currentDoc._id;
      Meteor.call('addUpdateHelpVideo', insertDoc, function (err, result) {
        if (err) {
          self.done(err);
        }
        else {
          editinId.set(null);
          self.done();
        }
      });
      return false;
    }
  }
});