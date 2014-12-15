var collection;

Template.contactCustomerInfo.helpers({
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

Template.contactCustomerInfo.events({
  'click .addEdit': function (e, ctx) {
    Utils.showModal('contactCustomerAddEdit', Session.get('entityId'), ctx.data.customer, function (customerId) {
      Meteor.subscribe('singleContactable', customerId);
    });
  }
});