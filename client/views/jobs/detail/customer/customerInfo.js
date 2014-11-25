var collection;
Template.jobCustomerInfo.helpers({
  created: function () {
    var customerId = this.data.customer;
    Meteor.subscribe('singleContactable', customerId);
    collection = this.data.collection;
  },
  customer: function () {
    return Contactables.findOne({_id: this.customer});
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

Template.jobCustomerInfo.events({
  'click .addEdit': function (e, ctx) {
    Composer.showModal('jobCustomerAddEdit', Session.get('entityId'), ctx.data.customer, ctx.data.path, ctx.data.collection, function (customerId) {
      Meteor.subscribe('singleContactable', customerId);
    });
  }
});