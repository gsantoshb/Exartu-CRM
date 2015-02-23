var collection;
Template.jobClientInfo.helpers({
  created: function () {
    var clientId = this.data.client;
    Meteor.subscribe('singleContactable', clientId);
    collection = this.data.collection;
  },
  client: function () {
    return Contactables.findOne({_id: this.client});
  },
  pictureUrl: function () {
    if (this.pictureFileId) {
      return ContactablesFS.getThumbnailUrlForBlaze(this.pictureFileId);
    }
    return "/assets/user-photo-placeholder.jpg";
  },
  contactMethod: function (index) {
    if (!this.contactMethods) return;
    return this.contactMethods[index];
  }
});

Template.jobClientInfo.events({
  'click .addEdit': function (e, ctx) {
    Utils.showModal('jobClientAddEdit', Session.get('entityId'), ctx.data.client, function (clientId) {
    });
  }
});